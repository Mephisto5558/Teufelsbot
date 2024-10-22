const
  { randomInt } = require('node:crypto'),
  MAX = 3001;

module.exports = new MixedCommand({
  dmPermission: true,

  async run(lang) { return this.customReply(lang(randomInt(MAX) == 0 ? 'side' : 'response')); }
});