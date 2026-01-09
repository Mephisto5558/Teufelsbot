/** @import { ApplicationEmoji } from 'discord.js' */

const
  { ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, EmbedBuilder, TimestampStyles, hyperlink, inlineCode } = require('discord.js'),
  { Command } = require('@mephisto5558/command'),
  { timeFormatter: { msInSecond, timestamp }, shellExec } = require('#Utils'),
  userLink = /** @param {Snowflake} id */ id => `https://discord.com/users/${id}`,

  /** @type {(label: string, url: string, emoji: ApplicationEmoji) => ButtonBuilder} */
  createButton = (label, url, emoji) => new ButtonBuilder({ label, url, emoji, style: ButtonStyle.Link });

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

module.exports = new Command({
  types: ['slash', 'prefix'],
  dmPermission: true,

  async run(lang) {
    const
      startTime = Date.now() - process.uptime() * msInSecond,
      git = await getGitInfo.call(this, Math.floor(startTime / msInSecond)),
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

    return this.customReply({ embeds: [embed], components: component.components.length ? [component] : undefined });
  }
});