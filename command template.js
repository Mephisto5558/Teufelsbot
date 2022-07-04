const { Command } = require('reconlx');

module.exports = new Command({
  name: '',
  aliases: [],
  description: '',
  usage: '',
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 0 },
  category: '',
  slashCommand: true,
  prefixCommand: true,
  disabled: false,
  showInHelp: true,
  options: [{
    name: '',
    description: '',
    type: '',
    required: false,
    choices: [
      { name: '', value: '' }
    ],
  }],

  run: async(client, message, interaction) => {



  }
})