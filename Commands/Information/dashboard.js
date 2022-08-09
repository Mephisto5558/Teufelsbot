const
  { Command } = require('reconlx'),
  { EmbedBuilder, Colors, Message } = require('discord.js'),
  { Dashboard } = require('../../config.json').Website,
  embed = new EmbedBuilder({
    title: 'Dashboard',
    description: `Click [here](${Dashboard}) to open the dashboard.`,
    color: Colors.Blurple
  });

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

  run: async (message, { functions }) => message instanceof Message ? functions.reply({ embeds: [embed] }, message) : interaction.editReply({ embeds: [embed] })
})