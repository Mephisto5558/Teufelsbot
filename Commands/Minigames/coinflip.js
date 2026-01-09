const
  { randomInt } = require('node:crypto'),
  { Command } = require('@mephisto5558/command'),

  SIDE_CHANCE = 3000; // 1 in 3000

module.exports = new Command({
  types: ['slash', 'prefix'],
  dmPermission: true,

  async run(lang) { return this.customReply(lang(randomInt(SIDE_CHANCE) == 0 ? 'side' : 'response')); }
});