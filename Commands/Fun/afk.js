const { Command } = require("reconlx");

module.exports = new Command({
  name: 'afk',
  aliases: [],
  description: 'sends an afk message if you get pinged until you write again',
  usage: '',
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 1000 },
  category: 'Fun',
  slashCommand: false,
  prefixCommand: true,
  disabled: true,
  run: async(client, message, interaction) => {



  }
})