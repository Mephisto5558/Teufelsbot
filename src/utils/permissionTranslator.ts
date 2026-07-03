import { PermissionsBitField } from 'discord.js';
import { Permission } from '@mephisto5558/command';

import type { I18nProvider, Locale } from '@mephisto5558/i18n';

export default function permissionTranslator<T extends string | string[] | bigint | bigint[] | undefined>(
  perms?: T, locale?: Locale, i18n: I18nProvider
): T extends undefined ? [] : T extends unknown[] ? string[] : string {
  if (!perms) return [];

  if (typeof perms == 'bigint') perms = Object.entries(Permission).find(([_, v]) => v == perms)[0];
  if (Array.isArray(perms) && typeof perms[0] == 'bigint') perms = new PermissionsBitField(perms).toArray();

  if (typeof perms == 'string') return i18n.__({ locale, undefinedNotFound: true }, `others.Perms.${perms}`) ?? perms;
  return perms.map(perm => i18n.__({ locale, undefinedNotFound: true }, `others.Perms.${perm}`) ?? perm);
}