const { Command } = require("reconlx");

module.exports = new Command({
  name: 'disabledm',
  aliases: [],
  description: `Disables user-made bot dms`,
  userPermissions: [],
  category : "Fun",
  slashCommand: false,
  disabled: true,
  run: async (client, message, interaction) => {
    
  }
})