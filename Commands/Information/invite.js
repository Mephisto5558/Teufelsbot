const
  { Command } = require('reconlx'),
  { Message, EmbedBuilder, Colors } = require('discord.js'),
  { Invite } = require('../../config.json').Website,
  embed = new EmbedBuilder({
    title: 'Invite',
    description: `Thank you for your interest! Click [here](${Invite}) to add me to your guild!`,
    Color: Colors.Blue
  });

module.exports = new Command({
  name: 'invite',
  aliases: { prefix: [], slash: [] },
  description: 'Sends a link to add the bot to your guild!',
  usage: '',
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 0 },
  category: 'Information',
  slashCommand: true,
  prefixCommand: true,

  run: async (message, { functions }) => message instanceof Message ? functions.reply({ embeds: [embed] }, message) : message.editReply({ embeds: [embed] })
})