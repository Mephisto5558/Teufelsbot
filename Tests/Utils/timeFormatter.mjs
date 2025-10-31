import assert from 'node:assert/strict';
import { test as topLvlTest } from 'node:test';
import { I18nProvider } from '@mephisto5558/i18n';

import { timeFormatter, timestamp } from '#Utils/timeFormatter.js';

const
  i18n = await new I18nProvider({
    defaultLocale: 'de',
    localePath: './Locales',
    errorNotFound: true
  }).init(),
  lang = i18n.getTranslator('de'),
  date = new Date('2023-10-27T10:00:00Z'),
  epochSeconds = Math.round(date.getTime() / 1000);

await topLvlTest('timeFormatter', { concurrency: true }, async secondLevel => {
  secondLevel.mock.timers.enable({ apis: ['Date'], now: 1_700_000_000_000 });

  const now = Date.now();
  return Promise.allSettled([
    secondLevel.test('timeFormatter without lang()', async t => Promise.allSettled([
      t.test('should format future dates correctly', () => {
        const result = timeFormatter(now + 1000 * 60 * 60 * 24 * 367); // ~1 year and 2 days in the future

        assert.equal(result.negative, false, 'should not be negative for future dates');
        assert.equal(result.formatted, '0001-00-01, 00:00:00', 'formatted string should be correct for ~1 year difference');
      }),
      t.test('should format past dates correctly', () => {
        const result = timeFormatter(now - 1000 * 60 * 60 * 24 * 32); // 32 days in the past

        assert.equal(result.negative, true, 'should be negative for past dates');
        assert.equal(result.formatted, '0000-01-01, 00:00:00', 'formatted string should be correct for ~1 month difference');
      }),
      t.test('should handle current time', () => {
        const result = timeFormatter(now);

        assert.equal(result.negative, false, 'should not be negative for current time');
        assert.equal(result.formatted, '0000-00-00, 00:00:00', 'formatted string for now should be all zeros');
      }),
      t.test('should handle no input', () => {
        const result = timeFormatter();
        assert.deepEqual(result, { negative: false, total: undefined, formatted: '0000-00-00, 00:00:00' });
      })
    ])),
    secondLevel.test('timeFormatter with lang()', async t => Promise.allSettled([
      t.test('should use correct lang key for years', () => {
        const result = timeFormatter(now + 1000 * 60 * 60 * 24 * 370, lang); // > 1 year
        assert.ok(result.formatted.includes('Jahr'), 'should use ymdhms for years');
      }),
      t.test('should use correct lang key for months', () => {
        const result = timeFormatter(now + 1000 * 60 * 60 * 24 * 35, lang); // > 1 month
        assert.ok(result.formatted.includes('Monat'), 'should use mdhms for months');
      }),
      t.test('should use correct lang key for days', () => {
        const result = timeFormatter(now + 1000 * 60 * 60 * 25, lang); // > 1 day
        assert.ok(result.formatted.includes('Tag'), 'should use dhms for days');
      }),
      t.test('should use correct lang key for hours', () => {
        const result = timeFormatter(now + 1000 * 60 * 65, lang); // > 1 hour
        assert.ok(result.formatted.includes('Stunde'), 'should use hms for hours');
      }),
      t.test('should use correct lang key for minutes', () => {
        const result = timeFormatter(now + 1000 * 65, lang); // > 1 minute
        assert.ok(result.formatted.includes('Minute'), 'should use ms for minutes');
      }),
      t.test('should use correct lang key for seconds', () => {
        const result = timeFormatter(now + 1000 * 5, lang); // > 1 second
        assert.ok(result.formatted.includes('Sekunde'), 'should use s for seconds');
      })
    ])),
    secondLevel.test('timestamp', async t => Promise.allSettled([
      t.test('should return a default timestamp without a style code', () => {
        assert.equal(timestamp(date), `<t:${epochSeconds}>`);
      }),
      t.test('should return timestamps with different style codes', () => {
        const testCases = [
          { input: 't', expected: `<t:${epochSeconds}:t>` }, { input: 'T', expected: `<t:${epochSeconds}:T>` },
          { input: 'd', expected: `<t:${epochSeconds}:d>` }, { input: 'D', expected: `<t:${epochSeconds}:D>` },
          { input: 'f', expected: `<t:${epochSeconds}:f>` }, { input: 'F', expected: `<t:${epochSeconds}:F>` },
          { input: 'R', expected: `<t:${epochSeconds}:R>` }
        ];

        for (const { input, expected } of testCases)
          assert.equal(timestamp(date, input), expected, `Failed for style code: ${input}`);
      }),
      t.test('should handle number input for time', () => {
        assert.equal(timestamp(date.getTime()), `<t:${epochSeconds}>`);
      })
    ]))
  ]);
});