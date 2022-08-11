const
  { readdirSync } = require('fs'),
  I18n = require('@eartharoid/i18n'),
  toImport = require('../Locales/import.json'),
  locales = {};

for (const lang of readdirSync('./Locales', { withFileTypes: true }).filter(({ name }) => toImport.includes(name)).map(e => e.name.split('.')[0])) {
  for (const e of readdirSync(`./Locales/${lang}`, { withFileTypes: true })) {
    if (!locales[lang]) locales[lang] = {};
    e.name = e.name.split('.')[0];

    if (e.isDirectory()) {
      for (const e2 of readdirSync(`./Locales/${lang}/${e.name}`).map(e2 => e2.split('.')[0])) {
        if (!locales[lang][e.name]) locales[lang][e.name] = {};
        locales[lang][e.name][e2] = require(`../Locales/${lang}/${e.name}/${e2}`);
      }
    }
    else locales[lang][e.name] = require(`../Locales/${lang}/${e.name}`);
  }
}

module.exports = async client => client.lang = new I18n(client.db.get('guildSettings').default.lang, locales);