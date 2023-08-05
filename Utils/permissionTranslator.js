const I18nProvider = require('./I18nProvider.js');

/**@param {string|string[]}perms @returns {string|string[]}same type as `perms` param*/
module.exports = (perms, locale) => {
  if (typeof perms == 'string') return I18nProvider.__({ locale, undefinedNotFound: true }, `others.Perms.${perms}`) || perms;
  return perms?.length ? perms.map(perm => I18nProvider.__({ locale, undefinedNotFound: true }, `others.Perms.${perm}`) || perm) : [];
};