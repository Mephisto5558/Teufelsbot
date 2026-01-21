const
  { randomInt } = require('node:crypto'),
  { Command, commandTypes } = require('@mephisto5558/command'),

  SIDE_CHANCE = 3000; // 1 in 3000

module.exports = new Command({
  types: [commandTypes.slash, commandTypes.prefix],
  dmPermission: true,

  async run(lang) { return this.customReply(lang(randomInt(SIDE_CHANCE) == 0 ? 'side' : 'response')); }
});