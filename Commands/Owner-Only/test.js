const { Command } = require("reconlx");
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');

module.exports = new Command({
  name: 'test',
  aliases: [],
  description: '',
  permissions: { client: [], user: [] },
  cooldowns: { global: '', user: '' },
  category: '',
  slashCommand: true,
  prefixCommand: true,
  disabled: true,

  run: async(client, _, interaction) => {
       
  }
})