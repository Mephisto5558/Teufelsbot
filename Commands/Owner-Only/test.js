const { Command } = require("reconlx");
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const colorConfig = require('../../Settings/embed.json').colors;

module.exports = new Command({
  name: 'test',
  aliases: [],
  description: 'testing',
  usage: 'PREFIX Command: test\n',
  permissions: { client: [], user: [] },
  cooldowns: { global: '', user: '' },
  category: 'aOwner-Only',
  slashCommand: true,
  prefixCommand: true,
  beta: true,
  disabled: false,

  run: async (client, message, interaction) => {

  }
})
