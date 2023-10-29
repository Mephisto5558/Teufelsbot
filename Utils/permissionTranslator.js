const I18nProvider = require('./I18nProvider.js');

/**
 * @template {string|string[]} T
 * @param {T}perms @param {string}locale @returns {T}*/
module.exports = (perms, locale) => {
  if (typeof perms == 'string') return I18nProvider.__({ locale, undefinedNotFound: true }, `others.Perms.${perms}`) || perms;
  return perms?.length ? perms.map(perm => I18nProvider.__({ locale, undefinedNotFound: true }, `others.Perms.${perm}`) || perm) : [];
};