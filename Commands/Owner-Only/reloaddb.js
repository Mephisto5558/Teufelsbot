module.exports = {
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

  run: async (message, lang, { log, db }) => {
    log(`Reloading db, initiated by user ${message.user.tag}`);

    await db.ready();

    message.customreply(lang('success'));
  }
}