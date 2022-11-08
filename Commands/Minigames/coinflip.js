const { randomInt } = require('crypto');

module.exports = {
  name: 'coinflip',
  cooldowns: { user: 100 },
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,

  run: function (lang) { this.customReply(lang(randomInt(3001) == 0 ? 'side' : 'response')); }
};
