const { randomInt } = require('crypto');

/**@type {command}*/
module.exports = {
  name: 'coinflip',
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,

  run: function (lang) { return this.customReply(lang(randomInt(3001) == 0 ? 'side' : 'response')); }
};
