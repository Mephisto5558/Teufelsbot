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

  run: async (message, lang, { log }) => {
    const msg = await message.reply(lang('global.loading'));
    log(`Reloading language files, initiated by user ${message.user.tag}`);

    I18nProvider.loadAllLocales();

    msg.edit(lang('success'));
  }
}