const { Command } = require("reconlx");

module.exports = new Command({
  name: 'say',
  aliases: [],
  description: 'Let me say something',
  userPermissions: [],
  category: "Fun",
  slashCommand: true,
  options: [{
    name: 'msg',
    description: 'Type your message here',
    type: 'STRING',
    required: true
  }],

  run: async (client, interaction, message) => {
    
    let msg = interaction.options.getString('msg');
    interaction.followUP({content: msg, ephemeral: true})
    
  }
})