module.exports = {
  name: 'reloaddb',
  aliases: { prefix: [], slash: [] },
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 0 },
  category: 'Owner-Only',
  slashCommand: false,
  prefixCommand: true,
  beta: true,

  run: async function (lang, { log, db }) {
    log(`Reloading db, initiated by user ${this.user.tag}`);

    await db.fetchAll();

    this.customReply(lang('success'));
  }
};