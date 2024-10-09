module.exports = new PrefixCommand({
  dmPermission: true,
  beta: true,

  run: async function (lang) {
    log.debug(`Reloading db, initiated by user ${this.user.tag}`);

    await this.client.db.fetchAll();
    return this.customReply(lang('success'));
  }
});