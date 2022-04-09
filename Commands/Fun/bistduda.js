const { Command } = require("reconlx");

module.exports = new Command({
  name: 'bistduda',
  aliases: [],
  description: `the bot will answer you if it is online`,
  userPermissions: [],
  category : "Fun",
  slashCommand: false,
  run: async (client, message, interaction) => {
    if(interaction) return interaction.followUp('ICH BIN DAAAA :D');
    client.functions.reply('ICH BIN DAAAA :D', message)
    
  }
})