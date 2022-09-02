const { Message } = require('discord.js');

module.exports = {
  name: '8ball',
  aliases: { prefix: [], slash: [] },
  description: 'Ask me a question',
  usage: '8ball <question>',
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 0 },
  category: 'Fun',
  slashCommand: true,
  prefixCommand: true,
  options: [{
    name: 'question',
    description: 'What do you want?',
    type: 'String',
    required: true
  }],

  run: async (message, lang) => message.customReply(message instanceof Message && !message.content ? lang('noQuestion') : lang('responseList'))
}