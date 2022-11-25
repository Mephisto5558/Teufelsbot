const { I18nProvider } = require('../../Utils');

module.exports = {
  name: 'reloadlang',
  slashCommand: false,
  prefixCommand: true,
  dmPermission: true,
  beta: true,

  run: function (lang) {
    this.client.log(`Reloading language files, initiated by user ${this.user.tag}`);

    I18nProvider.loadAllLocales();

    this.customReply(lang('success'));
  }
};