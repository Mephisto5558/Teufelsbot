/** @type {import('.').permissionTranslator} */
module.exports = function permissionTranslator(perms, locale, i18n) {
  if (typeof perms == 'string') return i18n.__({ locale, undefinedNotFound: true }, `others.Perms.${perms}`) ?? perms;
  return perms.map(perm => i18n.__({ locale, undefinedNotFound: true }, `others.Perms.${perm}`) ?? perm);
};