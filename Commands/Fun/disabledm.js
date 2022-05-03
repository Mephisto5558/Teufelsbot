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
  disabled: false,

  run: async(client, message, interaction) => {

    client.functions.reply(
      'This feature will be added soon.\n' +
      'Please message the dev if you want to block someone.',
      message
    )

  }
})