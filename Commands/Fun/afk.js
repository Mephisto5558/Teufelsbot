const
  { Command } = require('reconlx'),
  { Message } = require('discord.js');

module.exports = new Command({
  name: 'afk',
  aliases: { prefix: [], slash: [] },
  description: 'sends an afk message if you get pinged until you write again',
  usage: '',
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 1000 },
  category: 'Fun',
  slashCommand: false,
  prefixCommand: true,
  disabled: true,
  run: async (message, client) => {
    if(message instanceof Message) {}


  }
})