const { Command } = require("reconlx");

module.exports = new Command({
  name: 'test',
  aliases: [],
  description: `some testing`,
  permissions: { client: [], user: [] },
  cooldowns: { global: '', user: '' },
  category: "Owner-Only",
  slashCommand: false,
  prefixCommand: true,
  disabled: true,

  run: async(client, message, interaction) => {

  }
})