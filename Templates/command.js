const { Command } = require('reconlx');

module.exports = new Command({
  name: '',
  aliases: { prefix: [], slash: [] },
  description: '',
  usage: '',
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 0 },
  category: '',
  slashCommand: true,
  prefixCommand: true,
  disabled: false,
  showInHelp: true,
  noDefer: false,
  ephemeralDefer: false,
  options: [{
    name: '',
    description: '',
    type: '',
    required: false,
    choices: [
      { name: '', value: '' }
    ],
  }],

  run: async (message, lang, client) => {



  }
})