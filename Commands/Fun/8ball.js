const { Message } = require('discord.js');

module.exports = {
  name: '8ball',
  aliases: { prefix: [], slash: [] },
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 0 },
  category: 'Fun',
  slashCommand: true,
  prefixCommand: true,
  options: [{
    name: 'question',
    type: 'String',
    required: true
  }],

  run: function (lang) { this.customReply(this instanceof Message && !this.content ? lang('noQuestion') : lang('responseList')) }
}