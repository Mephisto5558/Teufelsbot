const { Command } = require("reconlx");
    
let responseList = ['c:', 'C:', ':D', 'uwu', '<:gucken:725670318164672543>', 'https://tenor.com/view/yell-shout-excited-happy-so-happy-gif-17583147']

module.exports = new Command({
  name: 'happy',
  aliases: [],
  description: `make the bot send a happy message`,
  usage: '',
  permissions: { client: [], user: [] },
  cooldowns: { global: '', user: '' },
  category: "Fun",
  slashCommand: false,
  prefixCommand: true,

  run: (client, message) => {
    
    let response = responseList[Math.floor(Math.random() * responseList.length)];
    client.functions.reply(response, message)

  }
})