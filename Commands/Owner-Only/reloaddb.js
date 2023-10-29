module.exports = {
  name: 'reloaddb',
  slashCommand: false,
  prefixCommand: true,
  dmPermission: true,
  beta: true,

  /**@this Message @param {lang}lang*/
  run: async function (lang) {
    log.debug(`Reloading db, initiated by user ${this.user.tag}`);

    await this.client.db.fetchAll();
    return this.customReply(lang('success'));
  }
};