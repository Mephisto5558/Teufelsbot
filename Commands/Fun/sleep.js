const { Command } = require("reconlx");

module.exports = new Command({
  name: 'sleep',
  aliases: [],
  description: `sends a sleep messsage`,
  userPermissions: [],
  category : "Fun",
  slashCommand: false,
  run: async (client, message, interaction) => {

  responseList = ['ist müde und geht jetzt schlafen :3', 'geht jetzt ins Bettchen <:engelchen:725458214044303371>', 'schläft jetzt, hoffentlich schnarcht er/sie nicht <:gucken:725670318164672543>']
  client.functions.reply(`${message.author.toString()} ${responseList[Math.floor(Math.random() * responseList.length)]}`, message)
    
  }
})