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
  options: [
    {
      name: 'channel',
      type: 'Channel',
      channelTypes: ['GuildText', 'GuildVoice', 'GuildAnnouncement', 'GuildPublicThread', 'GuildPrivateThread']
    },
    { name: 'member', type: 'User' }
  ], beta: true,

  run: async function (lang) {
    const
      channel = this.options?.getChannel('channel') || this.mentions?.channels.first() || this.channel,
      user = (this.options?.getUser('member') || this.mentions?.users.first())?.id;

    if (!channel.isTextBased()) return this.customReply(lang('invalid'));

    const { url, createdAt, content = lang('unknown'), author = lang('unknown') } = (await channel.messages.fetch({ limit: 100 })).find(e => (e.mentions.everyone || e.mentions.roles.find(e2 => this.member.roles.cache.has(e2.id)) || e.mentions.members.has(this.user.id)) && (!user || !e.author || e.author.id == user)) || {};
    if (!url) return this.customReply(lang('noneFound'));

    const embed = new EmbedBuilder({
      title: lang('embedTitle'),
      description: lang('embedDescription', { url, content: content.substring(0, 200), author }),
      color: Colors.White,
      footer: { text: createdAt?.toLocaleString(this.guild.preferredLocale, { month: '2-digit', day: '2-digit' }) }
    });

    this.customReply({ embeds: [embed] });
  }
};