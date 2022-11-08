module.exports = {
  name: 'reloaddb',
  slashCommand: false,
  prefixCommand: true,
  dmPermission: true,
  beta: true,

  run: async function (lang, { log, db }) {
    log(`Reloading db, initiated by user ${this.user.tag}`);

    await db.fetchAll();

    this.customReply(lang('success'));
  }
};