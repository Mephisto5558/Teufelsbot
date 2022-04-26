const { Command } = require("reconlx");

module.exports = new Command({
  name: 'bistduda',
  aliases: [],
  description: 'the bot will answer you if it is online',
  permissions: {client: [], user: []},
  category : 'Fun',
  slashCommand: false,
  disabled: false,
  
  run: async (client, message) => {
    
    client.functions.reply('ICH BIN DAAAA :D', message)
    
  }
})