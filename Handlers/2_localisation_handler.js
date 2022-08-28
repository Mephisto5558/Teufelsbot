const
  { readdirSync } = require('fs'),
  { I18n } = require('i18n'),
  { languagesToImport } = require('../config.json'),
  staticCatalog = {};

for (const lang of readdirSync('./Locales', { withFileTypes: true }).filter(({ name }) => languagesToImport.includes(name)).map(e => e.name.split('.')[0])) {
  for (const e of readdirSync(`./Locales/${lang}`, { withFileTypes: true })) {
    if (!staticCatalog[lang]) staticCatalog[lang] = {};
    e.name = e.name.split('.')[0];

    if (e.isDirectory()) {
      for (const e2 of readdirSync(`./Locales/${lang}/${e.name}`).map(e => e.split('.')[0])) {
        if (!staticCatalog[lang][e.name]) staticCatalog[lang][e.name] = {};
        delete require.cache[require.resolve(`../Locales/${lang}/${e.name}/${e2}`)];
        staticCatalog[lang][e.name][e2] = require(`../Locales/${lang}/${e.name}/${e2}`);
      }
    }
    else {
      delete require.cache[require.resolve(`../Locales/${lang}/${e.name}`)];
      staticCatalog[lang][e.name] = require(`../Locales/${lang}/${e.name}`);
    }
  }
}

module.exports = client => client.lang = new I18n({
  defaultLocale: client.db.get('guildSettings').default.config.lang,
  missingKeyFn: (_, value) => value,
  staticCatalog,
  objectNotation: true,
  retryInDefaultLocale: true
});