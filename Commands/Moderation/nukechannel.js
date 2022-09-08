const { EmbedBuilder, Colors } = require('discord.js');

module.exports = {
  name: 'nukechannel',
  aliases: { prefix: ['clearchannel'], slash: ['clearchannel'] },
  permissions: { client: ['ManageChannels'], user: ['ManageGuild', 'ManageChannels'] },
  cooldowns: { guild: 10000, user: 1000 },
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
      channelTypes: ['GuildText', 'GuildVoice']
    }
  ],

  run: async (interaction, lang) => {
    if (interaction.options.getString('confirmation')?.toLowerCase() != 'delete channel') return interaction.editReply(lang('needConfirm'));

    const embed = new EmbedBuilder({
      description: lang('embedDescription'),
      color: Colors.Red,
      image: { url: 'https://giphy.com/media/XUFPGrX5Zis6Y/giphy.gif' },
      footer: { text: lang('embedFooterText', interaction.user.tag) }
    });

    const channel = interaction.options?.getChannel('channel') || interaction.channel;
    const cloned = await channel.clone({ parent: channel.parentId });

    await channel.delete(`nukechannel command, member ${interaction.user.tag}`);

    cloned.send({ embeds: [embed] });
  }
}
