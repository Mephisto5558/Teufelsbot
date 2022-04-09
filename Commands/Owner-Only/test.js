const { Command } = require("reconlx");

module.exports = new Command({
  name: 'test',
  aliases: [],
  description: `some testing`,
  userPermissions: [],
  category : "Owner-Only",
  slashCommand: true,
  options : [{
      name : "number",
      description : `Give me Number`,
      required : true,
      type : "NUMBER"
    }],
  run: async (client, message, interaction) => {
    
 number = interaction.options.getNumber('number')
    interaction.followUp(number)
    
  }
})