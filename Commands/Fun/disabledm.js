const { Command } = require("reconlx");

module.exports = new Command({
  name: 'disabledm',
  aliases: [],
  description: 'Disables user-made bot dms',
  permissions: {client: [], user: []},
  category : 'Fun',
  slashCommand: false,
  prefiCommand: true,
  disabled: true,
  
  run: async (client, message, interaction) => {


    
  }
})