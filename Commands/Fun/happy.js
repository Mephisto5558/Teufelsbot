const { Command } = require("reconlx");

module.exports = new Command({
  name: 'happy',
  aliases: [],
  description: `make the bot send a happy message`,
  userPermissions: [],
  category : "Fun",
  slashCommand: false,
  run: async (client, message, interaction) => {

    responseList = ['c:', 'C:', ':D', 'uwu', '<:gucken:725670318164672543>', 'https://tenor.com/view/yell-shout-excited-happy-so-happy-gif-17583147']
    client.functions.reply(responseList[Math.floor(Math.random() * responseList.length)], message)
    
  }
})