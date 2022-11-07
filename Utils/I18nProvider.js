const
  { Collection } = require('discord.js'),
  { readdirSync, readFileSync } = require('fs'),
  path = require('path');

class I18nProvider {
  constructor({
    localesPath = './locales', defaultLocale = 'en',
    separator = '.', notFoundMessage = '',
    errorNotFound = false, undefinedNotFound = false
  }) {
    this.config = { defaultLocale, separator, errorNotFound, undefinedNotFound, notFoundMessage };
    this.availableLocales = new Collection(readdirSync(localesPath)
      .map(e => [path.basename(e, '.json'), path.resolve(localesPath, e)])
    );

    this.loadAllLocales();
  }

  /**@param {string}locale*/
  loadLocale(locale) {
    if (!locale) return;

    const data = {};
    const filePath = this.availableLocales.get(locale);

    if (!filePath) return;

    for (const item of readdirSync(filePath, { withFileTypes: true })) {
      if (item.isFile() && item.name.endsWith('.json')) data[item.name.replace('.json', '')] = JSON.parse(readFileSync(`${filePath}/${item.name}`, 'utf8'));
      else {
        data[item.name] = {};
        for (const file of readdirSync(`${filePath}/${item.name}`).filter(e => e.endsWith('.json')))
          data[item.name][file.replace('.json', '')] = JSON.parse(readFileSync(`${filePath}/${item.name}/${file}`, 'utf8'));
      }
    }

    this.localeData[locale] = this.flatten(data);
  }

  loadAllLocales() {
    this.localeData = {};
    for (const [key] of this.availableLocales) this.loadLocale(key);

    this.defaultLocaleData = this.localeData[this.config.defaultLocale];
    if (!this.defaultLocaleData)
      throw new Error(`There are no language files for the default locale (${this.config.defaultLocale}) in the supplied locales path!`);
  }

  /**@param {string}key @param {string|object}replacements @returns {string}the message*/
  __({ locale = this.config.defaultLocale, errorNotFound = this.config.errorNotFound, undefinedNotFound = this.config.undefinedNotFound, backupPath } = {}, key, replacements) {
    let message = this.localeData[locale]?.[key] ?? (backupPath && this.localeData[locale]?.[`${backupPath}.${key}`]);
    if (!message) {
      if (!undefinedNotFound) console.warn(`Missing "${locale}" localization for ${key}` + (backupPath ? ` (${backupPath}.${key})!` : '!'));
      message = this.defaultLocaleData[key] ?? (backupPath && this.defaultLocaleData[`${backupPath}.${key}`]);
    }

    if (Array.isArray(message)) message = message.random();
    if (!message) {
      if (errorNotFound) throw new Error(`Key not found: "${key}"` + (backupPath ? ` (${backupPath}.${key})` : ''));
      if (undefinedNotFound) return undefined;
      console.warn(`Missing "${this.config.defaultLocale}" localization for ${key}` + (backupPath ? ` (${backupPath}.${key})!` : '!'));
      return this.config.notFoundMessage?.replaceAll('{key}', key) ?? key;
    }

    if (!replacements?.toString()) return message;
    if (typeof replacements != 'object') return message.replace(/{\w+}/, replacements.toString());

    for (const [key, value] of Object.entries(replacements)) message = message.replaceAll(`{${key}}`, value?.toString());
    return message;
  }

  /**@param {{}}object@param {string}objectPath@returns {{}}flatted object*/
  flatten(object, objectPath) {
    return Object.keys(object).reduce((acc, key) => {
      const newObjectPath = [objectPath, key].filter(Boolean).join(this.config.separator);

      return Object.assign(Object.assign({}, acc), ({}).toString() == object?.[key]
        ? this.flatten(object[key], newObjectPath)
        : { [newObjectPath]: object[key] }
      );
    }, {});
  }

  /**@returns {{}}list of missing entries*/
  findMissing() {
    const defaultKeys = Object.keys(this.defaultLocaleData);
    const missing = {};

    for (const lang of this.availableLocales.keys()) missing[lang] = defaultKeys.filter(k => !this.localeData[lang][k]);
    return Object.fromEntries(Object.entries(missing).filter(([, e]) => e.length));
  }
}

const provider = new I18nProvider({
  notFoundMessage: 'TEXT_NOT_FOUND: {key}', localesPath: path.join(__dirname, '/../Locales')
});

module.exports = provider;