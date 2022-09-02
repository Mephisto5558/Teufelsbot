const
  { Collection } = require('discord.js'),
  { readdirSync } = require('fs'),
  path = require('path');

class I18nProvider {
  constructor({
    localesPath = './locales', defaultLocale = 'en',
    separator = '.', notFoundMessage
  }) {
    this.config = { separator, notFoundMessage, defaultLocale };
    this.availableLocales = new Collection(readdirSync(localesPath)
      .map(e => [path.basename(e, '.json'), path.resolve(localesPath, e)])
    );

    this.loadAllLocales();
  }

  loadLocale(locale) {
    if (!locale) return;

    const data = {};
    const filePath = this.availableLocales.get(locale);

    if (filePath) {
      for (const item of readdirSync(filePath, { withFileTypes: true })) {
        if (item.isFile() && item.name.endsWith('.json')) data[item.name.replace('.json', '')] = require(`${filePath}/${item.name}`);
        else {
          data[item.name] = {};
          for (const file of readdirSync(`${filePath}/${item.name}`).filter(e => e.endsWith('.json')))
            data[item.name][file.replace('.json', '')] = require(`${filePath}/${item.name}/${file}`);
        }
      }

      this.localeData[locale] = this.flatten(data);
    }
  }

  loadAllLocales() {
    this.localeData = {};
    for (const [key] of this.availableLocales) this.loadLocale(key);
  }

  __({ locale = this.config.defaultLocale, backUpPath } = {}, key, replacements = {}) {
    let message = this.localeData[locale][key] || this.localeData[this.config.defaultLocale][key];
    if (!message && backUpPath) message = this.localeData[locale][`${backUpPath}.${key}`] || this.localeData[this.config.defaultLocale][`${backUpPath}.${key}`];

    if (!message) return this.config.notFoundMessage?.replaceAll('{key}', key) ?? key;
    if(Array.isArray(message)) message = message.random();
    
    if (typeof replacements != 'object') message = message.replace(/{\w+}/, replacements.toString());
    else {
      for (const [key, value] of Object.entries(replacements))
        message = message.replaceAll(`{${key}}`, value.toString());
    }

    return message;
  }

  flatten(object, objectPath) {
    return Object.keys(object).reduce((acc, key) => {
      const newObjectPath = [objectPath, key].filter(Boolean).join(this.config.separator);

      return Object.assign(Object.assign({}, acc), typeof object?.[key] == 'object'
        ? this.flatten(object[key], newObjectPath)
        : { [newObjectPath]: object[key] }
      );
    }, {});
  }
}

const provider = new I18nProvider({
  defaultLocale: 'en', notFoundMessage: 'TEXT_NOT_FOUND: {key}', localesPath: path.join(__dirname, '../../Locales')
});

module.exports = provider;