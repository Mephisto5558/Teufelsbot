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
    },
    { name: 'member', type: 'User' }
    /*{
      name: 'amount',
      type: 'Number',
      minValue: 0,
      maxValue: 20
    }*/
  ],

  run: async function (lang) {
    const
      channel = this.options?.getChannel('channel') || this.mentions?.channels.first(),
      target = this.options?.getUser('member') || this.mentions?.users.first();

    if (target) {
      if (!channel) return this.customReply(lang('memberRequiresChannel'));
      if (!channel.isTextBased()) return this.customReply(lang('invalidChannel'));
    }

    const { url, content, author, createdAt } = (channel ? channel.messages.cache.find(e =>
      (!target || e.author.id == target.id) && e.mentions.everyone || e.mentions.users.has(this.user.id) || e.mentions.roles.hasAny(this.member.roles.cache.keys())
    ) : this.guild.db.lastMentions?.[this.user.id]) || {};

    if (!url) return this.customReply(lang('noneFound'));

    const embed = new EmbedBuilder({
      title: lang('embedTitle'),
      description: lang('embedDescription', { url, content: content?.substring(0, 200) ?? lang('unknown'), author: author.id || author }),
      color: Colors.White,
      footer: { text: createdAt?.toLocaleTimeString('de', { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }
    });

    return this.customReply({ embeds: [embed] });
  }
};