const { Command } = require('reconlx');
//const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
//const { colors } = require('../../Settings/embed.json');

module.exports = new Command({
  name: 'test',
  aliases: [],
  description: 'testing',
  usage: 'PREFIX Command: test',
  permissions: { client: [], user: [] },
  cooldowns: { guild: 1000, user: 100000 },
  category: 'Owner-Only',
  slashCommand: true,
  prefixCommand: true,
  beta: true,
  disabled: true,

  run: async (client, message, interaction) => {

  }
})
