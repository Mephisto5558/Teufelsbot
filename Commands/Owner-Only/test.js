const { Command } = require('reconlx');

module.exports = new Command({
  name: 'test',
  aliases: { prefix: [], slash: [] },
  description: 'testing',
  usage: 'PREFIX Command: test',
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 0 },
  category: 'Owner-Only',
  slashCommand: true,
  prefixCommand: true,
  beta: true,
  disabled: true,

  run: async (message, lang, client) => {

  }
})
