const { Command } = require('reconlx');

module.exports = new Command({
  name: 'bistduda',
  aliases: [],
  description: 'the bot will answer you if it is online',
  usage: '',
  category: 'Fun',
  permissions: { client: [], user: [] },
  cooldowns: { global: '', user: '' },
  slashCommand: false,
  prefixCommand: true,

  run: (client, message) => {
    client.functions.reply('ICH BIN DAAAA :D', message);
  }
})