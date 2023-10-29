const { I18nProvider } = require('../../Utils');

module.exports = {
  name: 'reloadlang',
  slashCommand: false,
  prefixCommand: true,
  dmPermission: true,
  beta: true,

  /**@this Message @param {lang}lang*/
  run: function (lang) {
    log.debug(`Reloading language files, initiated by user ${this.user.tag}`);

    I18nProvider.loadAllLocales();
    return this.customReply(lang('success'));
  }
};