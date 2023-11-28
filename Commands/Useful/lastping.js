const
  { Constants, EmbedBuilder, Colors } = require('discord.js'),
  { getTarget } = require('../../Utils');

/**@type {command}*/
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
      type: 'Integer',
      minValue: 0,
      maxValue: 20
    }*/
  ],

  /**@this GuildInteraction|GuildMessage*/
  run: async function (lang) {
    const
      channel = this.options?.getChannel('channel') || this.mentions?.channels.first(),
      target = getTarget.call(this, { targetOptionName: 'member' });

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
      description: lang('embedDescription', { url, content: content ? `>>> ${content.substring(0, 200)}` : lang('unknown'), author: author.id || author }),
      color: Colors.White,
      footer: { text: createdAt?.toLocaleTimeString(lang.__boundArgs__[0].locale, { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }
    });

    return this.customReply({ embeds: [embed] });
  }
};