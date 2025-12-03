import assert from 'node:assert/strict';
import { test as topLvlTest } from 'node:test';
import { I18nProvider } from '@mephisto5558/i18n';

import permissionTranslator from '#Utils/permissionTranslator.js';

const
  SEND_MESSAGES_PERM = 'Nachrichten versenden und Posts erstellen',

  i18nProvider = await new I18nProvider({
    localesPath: './Locales',
    defaultLocale: 'de',
    warnLoggingFunction: () => void 0 // Suppress warnings about missing locales during tests
  }).init();


await topLvlTest('permissionTranslator', { concurrency: true }, async t => Promise.allSettled([
  t.test('should return an empty array for falsy input', () => {
    assert.deepEqual(permissionTranslator(undefined, 'de', i18nProvider), []);
    assert.deepEqual(permissionTranslator(null, 'de', i18nProvider), []);
  }),

  t.test('should translate a single known permission string', () => {
    const result = permissionTranslator('SendMessages', 'de', i18nProvider);
    assert.equal(result, SEND_MESSAGES_PERM);
  }),

  t.test('should return the original string if translation is not found', () => {
    const result = permissionTranslator('UnknownPermission', 'de', i18nProvider);
    assert.equal(result, 'UnknownPermission');
  }),

  t.test('should translate an array of known permissions', () => {
    const result = permissionTranslator(['SendMessages', 'ViewChannel'], 'de', i18nProvider);
    assert.deepEqual(result, [SEND_MESSAGES_PERM, 'Kanäle ansehen']);
  }),

  t.test('should handle an array with mixed known and unknown permissions', () => {
    const result = permissionTranslator(['SendMessages', 'UnknownPermission', 'ViewChannel'], 'de', i18nProvider);
    assert.deepEqual(result, [SEND_MESSAGES_PERM, 'UnknownPermission', 'Kanäle ansehen']);
  }),

  t.test('should return an empty array for an empty array input', () => {
    assert.deepEqual(permissionTranslator([], 'de', i18nProvider), []);
  }),

  t.test('should handle different locales', () => {
    assert.equal(permissionTranslator('SendMessages', 'en', i18nProvider), 'Send Messages and Create Posts');
  }),

  t.test('should fall back to default locale if translation is missing in target locale', () => {
    delete i18nProvider.localeData.en['others.Perms.ManageMessages'];
    assert.equal(permissionTranslator('ManageMessages', 'en', i18nProvider), 'Nachrichten verwalten');
  })
]));