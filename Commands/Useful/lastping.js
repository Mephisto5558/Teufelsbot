const
  { Constants, EmbedBuilder, Colors } = require('discord.js'),
  { getTargetChannel, getTargetMember } = require('#Utils');

module.exports = new MixedCommand({
  cooldowns: { guild: 200, user: 1e4 },
  ephemeralDefer: true,
  options: [
    new CommandOption({
      name: 'channel',
      type: 'Channel',
      channelTypes: Constants.GuildTextBasedChannelTypes
    }),
    new CommandOption({ name: 'member', type: 'User' })
  ],

  run: async function (lang) {
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
      description: lang('embedDescription', { url, content: content ? `>>> ${content.slice(0, 200)}` : lang('global.unknown'), author: author?.id ?? author }),
      timestamp: createdAt,
      color: Colors.White
    });

    return this.customReply({ embeds: [embed] });
  }
});