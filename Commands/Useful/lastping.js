const { EmbedBuilder, Colors } = require('discord.js');
module.exports = {
  name: 'lastping',
  aliases: { prefix: [], slash: [] },
  permissions: { client: [], user: [] },
  cooldowns: { guild: 200, user: 1000 },
  category: 'Useful',
  slashCommand: true,
  prefixCommand: true,
  ephemeralDefer: true,
  options: [{
    name: 'channel',
    type: 'Channel',
    channelTypes: ['GuildText', 'GuildVoice', 'GuildAnnouncement', 'GuildPublicThread', 'GuildPrivateThread']
  }], beta: true,

  run: async function (lang) {
    const channel = this.options?.getChannel('channel') || this.mentions?.channels.first() || this.channel;
    if (!channel.isTextBased()) return this.customReply(lang('invalid'));

    const { url, content = lang('unknown'), author = lang('unknown'), createdAt } = (await channel.messages.fetch({ limit: 100 })).find(e => e.mentions.members.has(this.user.id)) || {};
    if (!url) return this.customReply(lang('noneFound'));

    const embed = new EmbedBuilder({
      title: lang('embedTitle'),
      description: lang('embedDescription', { url, content: content.substring(0, 200), author }),
      color: Colors.White,
      footer: { text: createdAt?.toLocaleString(this.locale) }
    });

    this.customReply({ embeds: [embed] });
  }
};