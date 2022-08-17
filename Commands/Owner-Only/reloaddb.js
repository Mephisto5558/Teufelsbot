const { Command } = require('reconlx');

module.exports = new Command({
  name: 'reloaddb',
  aliases: { prefix: [], slash: [] },
  description: 'Reloads the database',
  usage: '',
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 0 },
  category: 'Owner-Only',
  slashCommand: false,
  prefixCommand: true,
  beta: true,

  run: async (message, lang, { log, db, functions }) => {
    log(`Reloading db, initiated by user ${message.user.tag}`);

    await db.ready();

    functions.reply(lang('success'), message);
  }
})