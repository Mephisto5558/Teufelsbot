module.exports = {
  name: 'reloadlang',
  slashCommand: false,
  prefixCommand: true,
  dmPermission: true,
  beta: true,

  /**@this Message @param {lang}lang*/
  run: async function (lang) {
    log.debug(`Reloading language files, initiated by user ${this.user.username}`);

    await this.client.i18n.loadAllLocales();
    return this.customReply(lang('success'));
  }
};