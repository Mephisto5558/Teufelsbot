const { Command } = require('reconlx');
const responseList = ['D:', ':c', 'qwq', ':C', 'q_q', ':/']

module.exports = new Command({
  name: 'sad',
  aliases: [],
  description: 'sends a sad emojicon',
  usage: 'sad',
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 0 },
  category: 'Fun',
  slashCommand: false,
  prefixCommand: true,

  run: (client, message) => {
    const response = responseList[Math.round(Math.random() * responseList.length)];
    client.functions.reply(response, message)
  }
})