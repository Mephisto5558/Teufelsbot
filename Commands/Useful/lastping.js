const
  { Constants, EmbedBuilder, Colors } = require('discord.js'),
  { getTargetChannel, getTargetMember, constants: { embedDescriptionMaxLength } } = require('#Utils');

/** @type {command<'both'>}*/
module.exports = {
  /* eslint-disable-next-line custom/sonar-no-magic-numbers */
  cooldowns: { guild: 200, user: 1e4 },
  slashCommand: true,
  prefixCommand: true,
  ephemeralDefer: true,
  options: [
    {
      name: 'channel',
      type: 'Channel',
      channelTypes: Constants.GuildTextBasedChannelTypes
    },
    { name: 'member', type: 'User' }
  ],

  async run(lang) {
    const
      target = getTargetMember(this, { targetOptionName: 'member' }),

      /** @type {import('discord.js').GuildTextBasedChannel | undefined}*/
      channel = getTargetChannel(this);

    if (target) {
      if (!channel) return this.customReply(lang('memberRequiresChannel'));
      if (!channel.isTextBased()) return this.customReply(lang('invalidChannel'));
    }

    const { url, content, author, createdAt } = (channel
      ? channel.messages.cache.find(e => (!target || e.author.id == target.id) && e.mentions.everyone || e.mentions.users.has(this.user.id) || e.mentions.roles.hasAny(this.member.roles.cache.keys()))
      : this.guild.db.lastMentions?.[this.user.id]) ?? {};

    if (!url) return this.customReply(lang('noneFound'));

    const embed = new EmbedBuilder({
      title: lang('embedTitle'),
      description: lang('embedDescription', { url, content: content ? `>>> ${content.slice(0, embedDescriptionMaxLength)}` : lang('global.unknown'), author: author?.id ?? author }),
      timestamp: createdAt,
      color: Colors.White
    });

    return this.customReply({ embeds: [embed] });
  }
};