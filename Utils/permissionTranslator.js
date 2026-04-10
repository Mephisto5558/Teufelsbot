/** @import { permissionTranslator } from '.' */

const
  { PermissionsBitField } = require('discord.js'),
  { Permission } = require('@mephisto5558/command');

/** @type {permissionTranslator} */
module.exports = function permissionTranslator(perms, locale, i18n) {
  if (!perms) return [];

  if (typeof perms == 'bigint') perms = Object.entries(Permission).find(([_, v]) => v == perms)[0];
  if (Array.isArray(perms) && typeof perms[0] == 'bigint') perms = new PermissionsBitField(perms).toArray();

  if (typeof perms == 'string') return i18n.__({ locale, undefinedNotFound: true }, `others.Perms.${perms}`) ?? perms;
  return perms.map(perm => i18n.__({ locale, undefinedNotFound: true }, `others.Perms.${perm}`) ?? perm);
};