const { Command } = require("reconlx");

module.exports = new Command({
  name: 'afk',
  aliases: [],
  description: `sends an afk message if you get pinged until you write again`,
  usage: '',
  permissions: { client: [], user: [] },
  cooldowns: { global: '', user: '' },
  category: "FUN",
  slashCommand: false,
  prefixCommand: false,
  disabled: true,
  run: async(client, message, interaction) => {



  }
})