const { Command } = require("reconlx");
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const colorConfig = require('../../Settings/embed.json').colors;

module.exports = new Command({
  name: 'test',
  aliases: [],
  description: 'testing',
  permissions: { client: [], user: [] },
  cooldowns: { global: '', user: '' },
  category: 'Owner-Only',
  slashCommand: true,
  prefixCommand: true,
  beta: true,
  disabled: true,

  run: async (client, _, interaction) => {
  

  }
})