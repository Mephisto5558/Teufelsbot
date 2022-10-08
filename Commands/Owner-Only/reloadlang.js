const I18nProvider = require('../../Functions/private/I18nProvider.js');

module.exports = {
  name: 'reloadlang',
  aliases: { prefix: [], slash: [] },
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 0 },
  category: 'Owner-Only',
  slashCommand: false,
  prefixCommand: true,
  beta: true,

  run: function (lang, { log }) {
    log(`Reloading language files, initiated by user ${this.user.tag}`);

    I18nProvider.loadAllLocales();

    this.customReply(lang('success'));
  }
};