const
  { randomInt } = require('node:crypto'),
  MAX = 3001;

/** @type {command<'both', false>}*/
module.exports = {
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,

  async run(lang) { return this.customReply(lang(randomInt(MAX) == 0 ? 'side' : 'response')); }
};