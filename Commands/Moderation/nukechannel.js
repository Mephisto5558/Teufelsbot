const { EmbedBuilder, Colors } = require('discord.js');

module.exports = {
  name: 'nukechannel',
  aliases: { prefix: ['clearchannel'], slash: ['clearchannel'] },
  permissions: { client: ['ManageChannels'], user: ['ManageGuild', 'ManageChannels'] },
  cooldowns: { guild: 1e4, user: 1000 },
  category: 'Moderation',
  slashCommand: true,
  prefixCommand: false,
  options: [
    {
      name: 'confirmation',
      type: 'String',
      required: true
    },
    {
      name: 'channel',
      type: 'Channel',
      channelTypes: ['GuildText', 'GuildAnnouncement', 'GuildVoice', 'GuildCategory', 'GuildStageVoice', 'GuildForum']
    }
  ],

  run: async function (lang) {
    if (this.options.getString('confirmation')?.toLowerCase() != lang('confirmation')) return this.editReply(lang('needConfirm'));

    const embed = new EmbedBuilder({
      description: lang('embedDescription'),
      color: Colors.Red,
      image: { url: 'https://giphy.com/media/XUFPGrX5Zis6Y/giphy.gif' },
      footer: { text: lang('embedFooterText', this.user.tag) }
    });

    const channel = this.options?.getChannel('channel') || this.channel;
    const cloned = await channel.clone({ parent: channel.parentId });

    await channel.delete(`nukechannel command, member ${this.user.tag}`);

    cloned.send({ embeds: [embed] });
  }
};
