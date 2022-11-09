const I18nProvider = require('./I18nProvider.js');

/**@param {string|string[]}perms*/
module.exports = (perms, locale) => {
  if (!perms?.length) return perms;
  if (typeof perms == 'string') return I18nProvider.__({ locale, undefinedNotFound: true }`others.${perms}`) || perms;
  return perms.map(perm => I18nProvider.__({ locale, undefinedNotFound: true },`others.Perms.${perm}`) || perm);
};