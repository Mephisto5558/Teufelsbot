const { Command } = require("reconlx");

module.exports = new Command({
  name: 'bistduda',
  aliases: [],
  description: 'the bot will answer you if it is online',
  category: 'Fun',
  permissions: { client: [], user: [] },
  cooldowns: { global: '', user: '' },
  slashCommand: false,
  prefixCommand: true,
  disabled: false,

  run: (client, message) => {

    client.functions.reply('ICH BIN DAAAA :D', message)

  }
})