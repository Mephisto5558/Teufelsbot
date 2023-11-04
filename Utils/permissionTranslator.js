/**
 * @template {string|string[]} T
 * @param {T}perms @param {string}locale @param {import('@mephisto5558/i18n')}i18n @returns {T}*/
module.exports = (perms, locale, i18n) => {
  if (typeof perms == 'string') return i18n.__({ locale, undefinedNotFound: true }, `others.Perms.${perms}`) || perms;
  return perms?.length ? perms.map(perm => i18n.__({ locale, undefinedNotFound: true }, `others.Perms.${perm}`) || perm) : [];
};