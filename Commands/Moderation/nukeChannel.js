const
  { Command } = require('reconlx'),
  { EmbedBuilder, Colors } = require('discord.js'),
  embed = new EmbedBuilder({
    description: ':radioactive: Channel Nuked!',
    color: Colors.Red,
    image: { url: 'https://media.giphy.com/media/XUFPGrX5Zis6Y/giphy.gif' },
    footer: { text: '' }
  });

module.exports = new Command({
  name: 'nukechannel',
  aliases: { prefix: ['clearchannel'], slash: ['clearchannel'] },
  description: 'Clears all channel messages by duplicating the channel and then deleting the original one',
  usage: '',
  permissions: { client: ['ManageChannels'], user: ['ManageGuild', 'ManageChannels'] },
  cooldowns: { guild: 10000, user: 1000 },
  category: 'Moderation',
  slashCommand: true,
  prefixCommand: false,
  options: [
    {
      name: 'confirmation',
      description: 'Write "DELETE CHANNEL" for confirmation.',
      type: 'String',
      required: true
    },
    {
      name: 'channel',
      description: 'the channel to nuke',
      type: 'Channel',
      required: false,
      channelTypes: ['GuildText', 'GuildVoice']
    }
  ],

  run: async interaction => {
    if (interaction.options.getString('confirmation')?.toLowerCase() != 'delete channel') return interaction.editReply('You need to confirm this action by writing `DELETE CHANNEL` as the confirm option!');

    const channel = interaction.options?.getChannel('channel') || interaction.channel;
    const cloned = await channel.clone({ parent: channel.parentId });
    embed.data.footer.text = `Nuked by ${interaction.user.tag}`;

    await channel.delete(`nukechannel command, member ${interaction.user.tag}`);

    cloned.send({ embeds: [embed] });
  }
})