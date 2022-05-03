const { Command } = require("reconlx");
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');

module.exports = new Command({
  name: 'test',
  aliases: [],
  description: 'Let me say something',
  permissions: { client: [], user: [] },
  cooldowns: { global: '', user: '' },
  category: 'Fun',
  slashCommand: true,
  prefixCommand: true,
  disabled: true,

  run: async(client, _, interaction) => {
       
  }
})