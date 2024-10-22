/** @type {command<'prefix', false>}*/
module.exports = {
  slashCommand: false,
  prefixCommand: true,
  dmPermission: true,
  beta: true,

  async run(lang) {
    log.debug(`Reloading db, initiated by user ${this.user.tag}`);

    await this.client.db.fetchAll();
    return this.customReply(lang('success'));
  }
};