const { randomInt } = require('node:crypto');

/** @type {command<'both', false>}*/
module.exports = {
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,

  run: async function (lang) { return this.customReply(lang(randomInt(3001) == 0 ? 'side' : 'response')); }
};