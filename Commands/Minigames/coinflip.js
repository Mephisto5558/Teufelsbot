const { randomInt } = require('crypto');

module.exports = {
  name: 'coinflip',
  aliases: { prefix: [], slash: [] },
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 100 },
  category: 'Minigames',
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,

  run: function (lang) { this.customReply(lang(randomInt(3001) == 0 ? 'side' : 'response')); }
};
