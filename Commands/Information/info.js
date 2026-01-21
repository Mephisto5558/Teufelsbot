/**
 * @import { ApplicationEmoji } from 'discord.js'
 * @import { Locale } from '@mephisto5558/i18n' */

/* eslint-disable @stylistic/max-len */
/**
 * @typedef {{ memory_bytes: number, memory_limit_bytes?: number, cpu_absolute: number, disk_bytes: number, network_rx_bytes: number, network_tx_bytes: number, uptime: number }} Resources
 * @typedef {{ memory: number, swap: number, disk: number, io: number, cpu: number, threads: number | null, oom_disabled: boolean }} Limits
 * @typedef {{ fetchedAt: number, resources: Resources, limits: Limits, buffers: Map<Locale, Buffer> }} ServerInfo */
/* eslint-enable @stylistic/max-len */

const
  {
    ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle,
    Colors, EmbedBuilder, TimestampStyles, hyperlink, inlineCode
  } = require('discord.js'),
  { Command, commandTypes } = require('@mephisto5558/command'),
  { Canvas } = require('skia-canvas'), /* eslint-disable-line import-x/no-unresolved -- false positive */
  { timeFormatter: { msInSecond, timestamp }, toMs: { minToMs }, shellExec, constants: { commonHeaders, byteConversion } } = require('#Utils'),

  userLink = /** @param {Snowflake} id */ id => `https://discord.com/users/${id}`,

  /** @type {(label: string, url: string, emoji: ApplicationEmoji) => ButtonBuilder} */
  createButton = (label, url, emoji) => new ButtonBuilder({ label, url, emoji, style: ButtonStyle.Link }),

  graphLayout = {
    /* eslint-disable @typescript-eslint/no-magic-numbers */
    fontName: 'sans-serif',
    width: 1500,
    height: 800,
    backgroundRadius: 30,
    padding: 50,
    barHeight: 50,
    barRadius: 25,
    barWidth: 1400,
    startY: 200,
    shadowBlur: 15,
    textMargin: 20,
    colors: {
      background: '#23272A',
      title: '#FFFFFF',
      label: '#BBBBBB',
      value: '#FFFFFF',
      barBackground: '#2C2F33',
      cpu: '#5865F2',
      ram: '#43b581',
      disk: '#FAA61A',
      network: '#2C2F33',
      netRx: '#33A0E4',
      netTx: '#F04747'
    }
    /* eslint-enable @typescript-eslint/no-magic-numbers */
  };


/**
 * @param {number} bytes
 * @param {lang} lang */
function formatBytes(bytes, lang) {
  if (bytes == 0) return '0 Bytes';
  const
    i = Math.floor(Math.log(bytes) / Math.log(byteConversion)),
    units = ['byte', 'kilobyte', 'megabyte', 'gigabyte', 'terrabyte', 'petabyte'],
    formatter = new Intl.NumberFormat(lang.config.locale, { maximumFractionDigits: 2, minimumFractionDigits: 2 });

  return `${formatter.format(bytes / byteConversion ** i)} ` + lang(`global.unitAbbreviations.${units[i]}`);
}

/**
 * @this {Client<true>}
 * @param {Command} cmd */
function commandListFilter(cmd) {
  return !cmd.aliasOf && !this.config.devOnlyFolders.includes(cmd.category) && !cmd.disabled;
}

/** @param {Client<true>} client */
function getCommandCount(client) {
  const
    commands = new Set([...client.slashCommands.values(), ...client.prefixCommands.values()].filter(commandListFilter.bind(client)).map(e => e.name)),
    count = {
      total: commands.size,
      combined: 0,
      slash: 0, prefix: 0
    };

  for (const command of commands) {
    if (client.slashCommands.has(command)) {
      if (client.prefixCommands.has(command)) count.combined++;
      else count.slash++;
    }
    else count.prefix++;
  }

  return Object.fromEntries(Object.entries(count).map(([k, v]) => [k, inlineCode(v)]));
}

/**
 * @this {Interaction}
 * @param {number} unixTimestamp */
async function getGitInfo(unixTimestamp) {
  const
    commitHash = unixTimestamp
      ? (await shellExec(`git rev-list -n 1 --before=${unixTimestamp} HEAD`).catch(() => ({ stdout: '' }))).stdout.trim()
      : 'HEAD',
    [shortHash = '', hash, ref, ts] = (
      await shellExec(`git show -s --format="%h|%H|%D|%ct" ${commitHash}`).catch(() => ({ stdout: '' }))
    ).stdout.split('|'),
    branch = ref?.match(/HEAD -> (?<branch>.*?)(?:,|$)/)?.groups?.branch ?? 'main',
    commitURL = this.client.config.github.repo ? `${this.client.config.github.repo}/commit/${hash}` : undefined;

  return { shortHash, commitURL, branch, ts };
}

/** @type {ServerInfo | undefined} */
let lastServerInfo;

/** @this {Client<true>} */
async function fetchServerInfo() {
  if (lastServerInfo && lastServerInfo.fetchedAt > Date.now() - minToMs(1)) return lastServerInfo;
  if (!process.env.pterodactylPanelURL || !process.env.pterodactylServerId || !process.env.pterodactylServerAPIKey)
    return;

  const
    authHeaders = { ...commonHeaders(this), Authorization: `Bearer ${process.env.pterodactylServerAPIKey}` },
    basePath = `${process.env.pterodactylPanelURL}/api/client/servers/${process.env.pterodactylServerId}`,

    /** @type {[{ attributes: { resources: Resources } } | { errors: unknown[] }, { attributes?: { limits: Limits } } | { errors: unknown[] }]} */
    [resResources, resDetails] = await Promise.all([
      fetch(`${basePath}/resources`, { headers: authHeaders }).then(async e => e.json()),
      lastServerInfo?.limits ? Promise.resolve({}) : fetch(basePath, { headers: authHeaders }).then(async e => e.json())
    ]);

  if ('errors' in resResources) void log.error(resResources.errors);
  else if ('errors' in resDetails) void log.error(resDetails.errors);
  else {
    /* eslint-disable-next-line require-atomic-updates -- Not an issue */
    lastServerInfo = {
      resources: resResources.attributes.resources,
      limits: resDetails.attributes?.limits ?? lastServerInfo.limits,
      fetchedAt: Date.now(),
      buffers: new Map()
    };
  }

  return lastServerInfo;
}

/**
 * @this {Client<true>}
 * @param {lang} lang */
async function createResourceGraph(lang) {
  const data = await fetchServerInfo.call(this);
  if (!data?.resources) return;
  if (data.buffers.has(lang.config.locale)) return data.buffers.get(lang.config.locale);

  const
    { resources, limits, buffers } = data,
    canvas = new Canvas(graphLayout.width, graphLayout.height),
    ctx = canvas.getContext('2d'),
    formatter = new Intl.NumberFormat(lang.config.locale, { maximumFractionDigits: 2, minimumFractionDigits: 2 }),

    netTotal = resources.network_rx_bytes + resources.network_tx_bytes,
    metrics = [
      {
        id: 'cpu',
        text: `${formatter.format(resources.cpu_absolute)} % / ${formatter.format(limits.cpu)} %`,
        percentage: limits.cpu > 0 ? Math.min(resources.cpu_absolute / limits.cpu, 1) : 0,
        color: graphLayout.colors.cpu
      },
      {
        id: 'ram',
        text: `${formatter.format(resources.memory_bytes / byteConversion ** 2)} MB / ${formatter.format(limits.memory)} MB`,
        percentage: limits.memory > 0 ? Math.min(resources.memory_bytes / byteConversion ** 2 / limits.memory, 1) : 0,
        color: graphLayout.colors.ram
      },
      {
        id: 'disk',
        text: `${formatter.format(resources.disk_bytes / byteConversion ** 2)} MB / ${formatter.format(limits.disk)} MB`,
        percentage: limits.disk > 0 ? Math.min(resources.disk_bytes / byteConversion ** 2 / limits.disk, 1) : 0,
        color: graphLayout.colors.disk
      },
      {
        id: 'network',
        text: `\u2B07 ${formatBytes(resources.network_rx_bytes, lang)} | `
          + `\u2B06 ${formatBytes(resources.network_tx_bytes, lang)}`,
        percentage: netTotal > 0 ? resources.network_rx_bytes / netTotal : 0
      }
    ],
    rowMargin = graphLayout.barHeight + graphLayout.padding * 2;

  ctx.fillStyle = graphLayout.colors.background;
  ctx.beginPath();
  ctx.roundRect(0, 0, graphLayout.width, graphLayout.height, graphLayout.backgroundRadius);
  ctx.fill();

  ctx.fillStyle = graphLayout.colors.title;
  ctx.font = `bold 50px ${graphLayout.fontName}`;
  ctx.fillText(lang('embedTitle'), graphLayout.padding, graphLayout.padding + graphLayout.backgroundRadius);

  ctx.fillStyle = graphLayout.colors.barBackground;
  ctx.beginPath();
  for (let i = 0; i < metrics.length; i++)
    ctx.roundRect(graphLayout.padding, graphLayout.startY + rowMargin * i, graphLayout.barWidth, graphLayout.barHeight, graphLayout.barRadius);

  ctx.fill();

  for (const [i, metric] of metrics.entries()) {
    const y = graphLayout.startY + rowMargin * i;

    ctx.fillStyle = graphLayout.colors.label;
    ctx.font = `bold 36px ${graphLayout.fontName}`;
    ctx.fillText(lang(`graph.${metric.id}`), graphLayout.padding, y - graphLayout.textMargin);

    ctx.fillStyle = graphLayout.colors.value;
    ctx.font = `36px ${graphLayout.fontName}`;
    ctx.fillText(metric.text, graphLayout.width - graphLayout.padding - ctx.measureText(metric.text).width, y - graphLayout.textMargin);
  }

  for (const [i, metric] of metrics.entries()) {
    const y = graphLayout.startY + rowMargin * i;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(graphLayout.padding, y, graphLayout.barWidth, graphLayout.barHeight, graphLayout.barRadius);
    ctx.clip();

    ctx.shadowBlur = graphLayout.shadowBlur;

    if (metric.id == 'network') {
      if (metric.percentage > 0) {
        ctx.fillStyle = graphLayout.colors.netRx;
        ctx.shadowColor = graphLayout.colors.netRx;
        ctx.fillRect(graphLayout.padding, y, graphLayout.barWidth * metric.percentage, graphLayout.barHeight);
      }
      if (metric.percentage < 1) {
        ctx.fillStyle = graphLayout.colors.netTx;
        ctx.shadowColor = graphLayout.colors.netTx;
        ctx.fillRect(
          graphLayout.padding + graphLayout.barWidth * metric.percentage, y,
          graphLayout.barWidth * (1 - metric.percentage), graphLayout.barHeight
        );
      }
    }
    else if (metric.percentage > 0) {
      ctx.fillStyle = metric.color;
      ctx.shadowColor = metric.color;
      ctx.fillRect(graphLayout.padding, y, graphLayout.barWidth * metric.percentage, graphLayout.barHeight);
    }

    ctx.restore();
  }

  const buffer = await canvas.toBuffer('webp');
  buffers.set(lang.config.locale, buffer);
  return buffer;
}

module.exports = new Command({
  types: [commandTypes.slash, commandTypes.prefix],
  dmPermission: true,

  async run(lang) {
    const
      startTime = Date.now() - process.uptime() * msInSecond,
      git = await getGitInfo.call(this, Math.floor(startTime / msInSecond)),
      graph = await createResourceGraph.call(this.client, lang),
      commitLink = git.commitURL ? hyperlink(git.branch + '#' + git.shortHash, git.commitURL) : git.branch + '#' + git.shortHash,
      description
        = `${lang('dev')}: ${hyperlink('Mephisto5558', userLink('691550551825055775'))}\n` // Please do not change this line.
          + (git.shortHash ? `${lang('version')}: ${commitLink} (${timestamp(Number(git.ts) * msInSecond)})\n` : '')
          + (this.inGuild()
            ? `${lang('shard')}: ${inlineCode(this.guild.shardId)}\n`
            + `${lang('guild')}: ${inlineCode(this.guild.db.position)}\n`
            : ''
          )
          + `${lang('guilds')}: ${inlineCode(this.client.guilds.cache.size)}\n`
          + `${lang('commands', getCommandCount(this.client))}\n`
          + `${lang('starts')}: ${inlineCode(this.client.settings.startCount[this.client.botType])}\n`
          + `${lang('lastStart')}: ${timestamp(startTime)} ${timestamp(startTime, TimestampStyles.RelativeTime)}\n`
          + lang('translation', {
            de: `${hyperlink('Mephisto5558', userLink('691550551825055775'))} & ${hyperlink('Koikarpfen1907', userLink('636196723852705822'))}`,
            en: `${hyperlink('Mephisto5558', userLink('691550551825055775'))} & ${hyperlink('PenguinLeo', userLink('740930989798195253'))}`
          }),

      embed = new EmbedBuilder({
        description, title: lang('embedTitle'),
        image: graph ? { url: 'attachment://stats.webp' } : undefined,
        color: Colors.DarkGold
      }),
      component = new ActionRowBuilder(),
      { website, github, discordInvite, disableWebserver } = this.client.config;

    if (github.repo)
      component.components.push(createButton(lang('links.repo'), github.repo, this.client.application.getEmoji('icon_github')));
    if (discordInvite)
      component.components.push(createButton(lang('links.discord'), discordInvite, this.client.application.getEmoji('icon_discord')));

    if (!disableWebserver && website.domain) {
      const domain = website.domain + (website.port ? `:${website.port}` : '');
      if (website.invite) component.components.push(createButton(lang('links.invite'), `${domain}/${website.invite}`));
      if (website.dashboard) component.components.push(createButton(lang('links.dashboard'), `${domain}/${website.dashboard}`));
      if (website.privacyPolicy) component.components.push(createButton(lang('links.privacyPolicy'), `${domain}/${website.privacyPolicy}`));
    }

    return this.customReply({
      embeds: [embed], components: component.components.length ? [component] : undefined,
      files: graph ? [new AttachmentBuilder(graph, { name: 'stats.webp' })] : undefined
    });
  }
});