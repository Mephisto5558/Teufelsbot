const { Constants, EmbedBuilder, Colors } = require('discord.js');

module.exports = {
  name: 'lastping',
  cooldowns: { guild: 200, user: 10000 },
  slashCommand: true,
  prefixCommand: true,
  ephemeralDefer: true,
  options: [
    {
      name: 'channel',
      type: 'Channel',
      channelTypes: Constants.TextBasedChannelTypes
    }/*,
    { name: 'member', type: 'User' },
    {
      name: 'amount',
      type: 'Number',
      minValue: 0,
      maxValue: 20
    }*/
  ], beta: true,

  run: async function (lang) {
    const
      channel = this.options?.getChannel('channel') || this.mentions?.channels.first(),
      target = (this.options?.getUser('member') || this.mentions?.users.first() || this.user).id,
      mentionsCache = this.guild.mentionsCache.get(target);

    if (channel && !channel.isTextBased()) return this.customReply(lang('invalid'));
    if (!mentionsCache?.size) return this.customReply(lang('noneFound'));

    const { url, content, author, createdAt } = (channel ? mentionsCache.filter(e => e.channel.id == channel.id) : mentionsCache)?.last() || {};
    if (!url) return this.customReply(lang('noneFound'));

    const embed = new EmbedBuilder({
      title: lang('embedTitle'),
      description: lang('embedDescription', { url, content: content?.substring(0, 200) ?? lang('unknown'), author }),
      color: Colors.White,
      footer: { text: createdAt?.toLocaleString(this.guild.preferredLocale, { month: '2-digit', day: '2-digit' }) }
    });

    this.customReply({ embeds: [embed] });
  }
};