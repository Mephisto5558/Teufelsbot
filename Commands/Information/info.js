const
  { EmbedBuilder, Colors, ActionRowBuilder, ButtonBuilder, ButtonStyle, TimestampStyles, hyperlink, inlineCode } = require('discord.js'),
  { msInSecond, timestamp } = require('#Utils').timeFormatter,
  userURL = id => `https://discord.com/users/${id}`,

  createButton = (label, url, emoji) => new ButtonBuilder({ label, url, emoji, style: ButtonStyle.Link });

/**
 * @this {Client<true>}
 * @param {command} cmd */
function commandListFilter(cmd) {
  /* eslint-disable-next-line @typescript-eslint/no-deprecated -- will be fixed when commands are moved to their own lib */
  return !!cmd.aliasOf || this.config.ownerOnlyFolders.includes(cmd.category) || cmd.disabled;
}

/** @param {Client<true>} client */
function getCommandCount(client) {
  const
    commands = new Set([
      ...client.slashCommands.filter(commandListFilter.bind(client)).keys(),
      ...client.prefixCommands.filter(commandListFilter.bind(client)).keys()
    ]),
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
    else if (client.prefixCommands.has(command)) count.prefix++;
  }

  return Object.fromEntries(Object.entries(count).map(([k, v]) => [k, inlineCode(v)]));
}

/** @type {command<'both', false>} */
module.exports = {
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,

  async run(lang) {
    const
      startTime = Date.now() - process.uptime() * msInSecond,
      description
        = `${lang('dev')}: ${hyperlink('Mephisto5558', userURL('691550551825055775'))}\n` // Please do not change this line
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
            de: `${hyperlink('Mephisto5558', userURL('691550551825055775'))} & ${hyperlink('Koikarpfen1907', userURL('636196723852705822'))}`,
            en: `${hyperlink('Mephisto5558', userURL('691550551825055775'))} & ${hyperlink('PenguinLeo', userURL('740930989798195253'))}`
          }),

      embed = new EmbedBuilder({
        description, title: lang('embedTitle'),
        color: Colors.DarkGold
      }),
      component = new ActionRowBuilder(),
      { website, github, discordInvite, disableWebserver } = this.client.config;

    if (github.repo)
      component.components.push(createButton(lang('links.repo'), github.repo, getEmoji('icon_github')));
    if (discordInvite)
      component.components.push(createButton(lang('links.discord'), discordInvite, getEmoji('icon_discord')));

    if (!disableWebserver && website.domain) {
      const domain = website.domain + (website.port ?? 0 ? ':' + website.port : '');
      if (website.invite) component.components.push(createButton(lang('links.invite'), `${domain}/${website.invite}`));
      if (website.dashboard) component.components.push(createButton(lang('links.dashboard'), `${domain}/${website.dashboard}`));
      if (website.privacyPolicy) component.components.push(createButton(lang('links.privacyPolicy'), `${domain}/${website.privacyPolicy}`));
    }

    return this.customReply({ embeds: [embed], components: component.components.length ? [component] : undefined });
  }
};