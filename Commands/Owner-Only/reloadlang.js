const I18nProvider = require('../../Utils/I18nProvider.js');

module.exports = {
  name: 'reloadlang',
  category: 'Owner-Only',
  slashCommand: false,
  prefixCommand: true,
  dmPermission: true,
  beta: true,

  run: function (lang, { log }) {
    log(`Reloading language files, initiated by user ${this.user.tag}`);

    I18nProvider.loadAllLocales();

    this.customReply(lang('success'));
  }
};