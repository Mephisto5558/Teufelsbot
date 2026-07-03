import assert from 'node:assert/strict';
import { test as topLvlTest } from 'node:test';

import toMs from '#Utils/toMs.js';

await topLvlTest('toMs', { concurrency: true }, async t => Promise.allSettled([
  t.test('secToMs', () => {
    const testCases = [
      { input: 0, expected: 0 },
      { input: 1, expected: 1000 },
      { input: -1, expected: -1000 },
      { input: 0.1, expected: 100 },
      { input: 0.001, expected: 1 },
      { input: 100, expected: 100_000 }
    ];

    for (const { input, expected } of testCases) assert.equal(toMs.secToMs(input), expected);
  }),

  t.test('minToMs', () => {
    const testCases = [
      { input: 0, expected: 0 },
      { input: 1, expected: 60_000 },
      { input: -1, expected: -60_000 },
      { input: 0.5, expected: 30_000 },
      { input: 10, expected: 600_000 }
    ];

    for (const { input, expected } of testCases) assert.equal(toMs.minToMs(input), expected);
  }),

  t.test('hourToMs', () => {
    const testCases = [
      { input: 0, expected: 0 },
      { input: 1, expected: 3_600_000 },
      { input: -1, expected: -3_600_000 },
      { input: 0.5, expected: 1_800_000 },
      { input: 24, expected: 86_400_000 }
    ];

    for (const { input, expected } of testCases) assert.equal(toMs.hourToMs(input), expected);
  }),

  t.test('dayToMs', () => {
    const testCases = [
      { input: 0, expected: 0 },
      { input: 1, expected: 86_400_000 },
      { input: -1, expected: -86_400_000 },
      { input: 0.5, expected: 43_200_000 },
      { input: 365, expected: 31_536_000_000 }
    ];

    for (const { input, expected } of testCases) assert.equal(toMs.dayToMs(input), expected);
  }),

  t.test('yearToMs', () => {
    const testCases = [
      { input: 0, expected: 0 },
      { input: 1, expected: 31_536_000_000 },
      { input: -1, expected: -31_536_000_000 },
      { input: 0.5, expected: 15_768_000_000 }
    ];

    for (const { input, expected } of testCases) assert.equal(toMs.yearToMs(input), expected);
  })
]));