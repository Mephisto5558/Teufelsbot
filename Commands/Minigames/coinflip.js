const { randomInt } = require('node:crypto');

module.exports = new MixedCommand({
  dmPermission: true,

  run: async function (lang) { return this.customReply(lang(randomInt(3001) == 0 ? 'side' : 'response')); }
});