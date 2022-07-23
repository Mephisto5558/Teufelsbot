const { Command } = require('reconlx');
const responseList = ['D:', ':c', 'qwq', ':C', 'q_q', ':/']

module.exports = new Command({
  name: 'sad',
  aliases: { prefix: [], slash: [] },
  description: 'sends a sad emojicon',
  usage: 'sad',
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 0 },
  category: 'Fun',
  slashCommand: false,
  prefixCommand: true,

  run: ({ functions }, message) => {
    const response = responseList[Math.round(Math.random() * (responseList.length - 1))];
    functions.reply(response, message)
  }
})