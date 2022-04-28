const { Command } = require("reconlx");

module.exports = new Command({
  name: 'vinjagostinkt',
  aliases: [],
  description: `just a little easter egg`,
  permissions: { client: [], user: [] },
  cooldown: { global: '', user: '' },
  category: "Fun",
  hideInHelp: true,
  slashCommand: false,
  prefixCommand: true,

  run: (client, message) => {

    client.functions.reply(':eyes:', message)

  }
})