const { randomInt } = require('crypto');

module.exports = {
  name: 'coinflip',
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,

  /**@this Interaction|Message @param {lang}lang*/
  run: function (lang) { return this.customReply(lang(randomInt(3001) == 0 ? 'side' : 'response')); }
};
