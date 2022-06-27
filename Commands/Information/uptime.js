const { Command } = require('reconlx');

module.exports = new Command({
  name: 'uptime',
  aliases: [],
  description: `shows the bot's uptime`,
  usage: 'PREFIX Command: uptime',
  permissions: { client: [], user: [] },
  cooldowns: { global: '', user: '' },
  category: 'Information',
  slashCommand: false,
  prefixCommand: true,

  run: async (client, message) => {
    client.functions.reply(`The bot has been online for exactly ${client.functions.uptime(client, true).formatted}.`, message);
  }
})