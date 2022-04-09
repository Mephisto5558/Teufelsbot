const { Command } = require("reconlx");

module.exports = new Command({
  name: 'easteregg',
  aliases: [],
  description: `just a little easter egg`,
  userPermissions: [],
  category : "Fun",
  slashCommand: false,
  run: async (client, message, interaction) => {
    
    client.functions.reply(':eyes:', message)
    
  }
})