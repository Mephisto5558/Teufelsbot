const { Command } = require("reconlx");

module.exports = new Command({
  name: 'say',
  aliases: [],
  description: 'Let me say something',
  userPermissions: [],
  category: "Fun",
  slashCommand: true,
  disabled: true,
  options: [{
    name: 'msg',
    description: 'Type your message here',
    type: 'STRING',
    required: true
  }],

  run: async (client, interaction, message) => {
    
    let msg = interaction.options.getString('msg');
    interaction.channel.send(msg)
      .then(async msg => {
        await client.sleep(200)
        msg.delete().catch();
      })
    
  }
})