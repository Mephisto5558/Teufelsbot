const { Command } = require("reconlx");

let responseList = ['D:', ':c', 'qwq', ':C', 'q_q', ':/']

module.exports = new Command({
  name: 'sad',
  aliases: [],
  description: `sends a sad emojicon`,
  usage: 'sad',
  permissions: { client: [], user: [] },
  cooldowns: { global: '', user: '' },
  category: 'Fun',
  slashCommand: false,
  prefixCommand: true,

  run: (client, message) => {

    let response = responseList[Math.floor(Math.random() * responseList.length)];
    client.functions.reply(response, message)

  }
})