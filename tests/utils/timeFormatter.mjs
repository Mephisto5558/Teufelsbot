import assert from 'node:assert/strict';
import { test as topLvlTest } from 'node:test';
import { I18nProvider } from '@mephisto5558/i18n';

import { timeFormatter, timestamp } from '#utils/timeFormatter.ts';

const
  i18n = await new I18nProvider({
    defaultLocale: 'de',
    localesPath: './Locales',
    errorNotFound: true
  }).init(),
  lang = i18n.getTranslator('de');

await topLvlTest('timeFormatter', { concurrency: true }, async secondLevel => {
  const
    nowInstant = Temporal.Instant.from('2023-11-14T22:13:20Z'),

    /** @type {(durationObj: Temporal.DurationLikeObject) => number} */
    getPastOrFutureMs = durationObj => nowInstant.add(Temporal.Duration.from(durationObj)).epochMilliseconds;

  return Promise.allSettled([
    secondLevel.test('timeFormatter without lang()', async t => Promise.allSettled([
      t.test('should format future dates correctly', () => {
        const futureMs = getPastOrFutureMs({ years: 1, days: 2 }),
          result = timeFormatter(futureMs);

        assert.equal(result.negative, false);
        assert.equal(result.formatted, '2024-11-16, 22:13:20');
      }),
      t.test('should format past dates correctly', () => {
        // Exakt 32 Tage in die Vergangenheit
        const pastMs = getPastOrFutureMs({ days: -32 }),
          result = timeFormatter(pastMs);

        assert.equal(result.negative, true);
        assert.equal(result.formatted, '2023-10-13, 22:13:20');
      }),
      t.test('should handle current time', () => {
        const result = timeFormatter(Temporal.Now.instant().epochMilliseconds);
        assert.equal(result.negative, false);
      })
    ])),

    secondLevel.test('timeFormatter with lang()', async t => Promise.allSettled([
      t.test('should use correct lang key for years', () => {
        const result = timeFormatter(getPastOrFutureMs({ years: 1, hours: 2 }), lang);
        assert.ok(result.formatted.includes('Jahr'));
      }),
      t.test('should use correct lang key for months', () => {
        const result = timeFormatter(getPastOrFutureMs({ months: 1 }), lang);
        assert.ok(result.formatted.includes('Monat'));
      }),
      t.test('should use correct lang key for days', () => {
        const result = timeFormatter(getPastOrFutureMs({ days: 1 }), lang);
        assert.ok(result.formatted.includes('Tag'));
      }),
      t.test('should use correct lang key for hours', () => {
        const result = timeFormatter(getPastOrFutureMs({ hours: 1, minutes: 5 }), lang);
        assert.ok(result.formatted.includes('Stunde'));
      }),
      t.test('should use correct lang key for minutes', () => {
        const result = timeFormatter(getPastOrFutureMs({ minutes: 1, seconds: 5 }), lang);
        assert.ok(result.formatted.includes('Minute'));
      }),
      t.test('should use correct lang key for seconds', () => {
        const result = timeFormatter(getPastOrFutureMs({ seconds: 5 }), lang);
        assert.ok(result.formatted.includes('Sekunde'));
      })
    ])),

    secondLevel.test('timestamp', async t => {
      const
        testInstant = Temporal.Instant.from('2023-10-27T10:00:00Z'),
        epochSeconds = testInstant.epochMilliseconds / 1000;

      return Promise.allSettled([
        t.test('should return a default timestamp without a style code', () => {
          assert.equal(timestamp(testInstant), `<t:${epochSeconds}>`);
        }),
        t.test('should return timestamps with different style codes', () => {
          for (const code of ['t', 'T', 'd', 'D', 'f', 'F', 'R'])
            assert.equal(timestamp(testInstant, code), `<t:${epochSeconds}:${code}>`);
        })
      ]);
    })
  ]);
});