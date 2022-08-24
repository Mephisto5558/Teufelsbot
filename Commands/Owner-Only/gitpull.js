const { Command } = require('reconlx');

module.exports = new Command({
  name: 'gitpull',
  aliases: { prefix: [], slash: [] },
  description: 'Run a git pull',
  usage: '',
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 0 },
  category: 'Owner-Only',
  slashCommand: false,
  prefixCommand: true,
  beta: true,

  run: async (message, lang, { functions }) => {
    await require('../../Website/custom/git/pull.js').run();
    functions.reply(lang('success'), message);
  }
})

