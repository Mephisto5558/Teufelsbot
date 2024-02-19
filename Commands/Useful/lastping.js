const
  { Constants, EmbedBuilder, Colors } = require('discord.js'),
  { getTargetChannel, getTargetMember } = require('../../Utils');

/** @type {command<'both'>}*/
module.exports = {
  name: 'lastping',
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

  run: function (lang) {
    const
      target = getTargetMember.call(this, { targetOptionName: 'member' }),

      /** @type {import('discord.js').GuildTextBasedChannel} */
      channel = getTargetChannel.call(this);

    if (target) {
      if (!channel) return this.customReply(lang('memberRequiresChannel'));
      if (!channel.isTextBased()) return this.customReply(lang('invalidChannel'));
    }

    /** @type {{ url: string, content: string, author: import('discord.js').User|import('discord.js').Snowflake, createdAt: Date }}*/
    const { url, content, author, createdAt } = (
      channel
        /* eslint-disable-next-line arrow-body-style */
        ? channel.messages.cache.find(e => {
          return (!target || e.author.id == target.id) && e.mentions.everyone || e.mentions.users.has(this.user.id) || e.mentions.roles.hasAny(this.member.roles.cache.keys());
        })
        : this.guild.db.lastMentions?.[this.user.id]
    ) ?? {};

    if (!url) return this.customReply(lang('noneFound'));

    const embed = new EmbedBuilder({
      title: lang('embedTitle'),
      description: lang('embedDescription', { url, content: content ? `>>> ${content.slice(0, 200)}` : lang('unknown'), author: author.id ?? author }),
      timestamp: createdAt,
      color: Colors.White
    });

    return this.customReply({ embeds: [embed] });
  }
};