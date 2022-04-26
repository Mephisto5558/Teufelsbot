const { Command } = require("reconlx");

module.exports = new Command({
  name: 'afk',
  aliases: [],
  description: `sends an afk message if you get pinged until you write again`,
  permissions: {client: [], user: []},
  category : "Others",
  slashCommand: false,
  disabled: true,
  run: async (client, message, interaction) => {


    
  }
})