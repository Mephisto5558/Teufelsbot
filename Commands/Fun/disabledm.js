const { Command } = require("reconlx");

module.exports = new Command({
  name: 'disabledm',
  aliases: [],
  description: 'Disables user-made bot dms',
  permissions: { client: [], user: [] },
  cooldowns: { global: '', user: '' },
  category: 'Fun',
  slashCommand: false,
  prefixCommand: true,
  disabled: true,

  run: async(client, message, interaction) => {



  }
})