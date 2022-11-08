const { Message } = require('discord.js');

module.exports = {
  name: '8ball',
  category: 'Fun',
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,
  options: [{
    name: 'question',
    type: 'String',
    required: true
  }],

  run: function (lang) { this.customReply(this instanceof Message && !this.content ? lang('noQuestion') : lang('responseList')); }
};