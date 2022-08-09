const
  { Command } = require('reconlx'),
  { EmbedBuilder, Colors, Message } = require('discord.js'),
  { Website } = require('../../config.json');

module.exports = new Command({
  name: 'dashboard',
  aliases: { prefix: [], slash: [] },
  description: 'get the link to the dashboard',
  usage: '',
  permissions: { client: ['EmbedLinks'], user: [] },
  cooldowns: { guild: 0, user: 0 },
  category: 'Information',
  slashCommand: true,
  prefixCommand: true,

  run: async (message, { functions }) => {
    const embed = new EmbedBuilder({
      title: 'Dashboard',
      description: `Click [here](${Website.Dashboard}) to open the dashboard.`,
      color: Colors.Blurple
    })

    message instanceof Message ? functions.reply({ embeds: [embed] }, message) : interaction.editReply({ embeds: [embed] });
  }
})