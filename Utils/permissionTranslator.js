/**@param {string|string[]}perms @param {string}locale @param {import('@mephisto5558/i18n')}i18n @returns {string|string[]} returned type depends on type of `perms` param*/
module.exports = function permissionTranslator (perms, locale, i18n) {
  if (typeof perms == 'string') return i18n.__({ locale, undefinedNotFound: true }, `others.Perms.${perms}`) || perms;
  return perms?.length ? perms.map(perm => i18n.__({ locale, undefinedNotFound: true }, `others.Perms.${perm}`) || perm) : [];
};