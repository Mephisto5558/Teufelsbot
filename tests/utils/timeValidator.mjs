import assert from 'node:assert/strict';
import { test as topLvlTest } from 'node:test';

import timeValidator from '#Utils/timeValidator.js';

await topLvlTest('timeValidator', { concurrency: true }, async t => Promise.allSettled([
  t.test('should return an empty array for invalid input types', () => {
    const testCases = [
      { input: undefined, expected: [] },
      { input: null, expected: [] },
      { input: 0, expected: [] },
      { input: 123, expected: [] },
      { input: {}, expected: [] },
      { input: [], expected: [] },
      { input: true, expected: [] }
    ];

    for (const { input, expected } of testCases) assert.deepEqual(timeValidator(input), expected);
  }),

  t.test('should return an empty array for invalid strings', () => {
    const testCases = [
      { input: '', expected: [] },
      { input: '-', expected: [] },
      { input: '+', expected: [] },
      { input: '1a', expected: [] },
      { input: '1y2b', expected: [] },
      { input: 'y', expected: [] }
    ];

    for (const { input, expected } of testCases) assert.deepEqual(timeValidator(input), expected);
  }),

  t.test('should return all valid units if only a number is provided', () => {
    const testCases = [
      { input: '1', expected: ['1y', '1mth', '1w', '1d', '1h', '1min', '1s', '1ms'] },
      { input: '10', expected: ['10y', '10mth', '10w', '10d', '10h', '10min', '10s', '10ms'] },
      { input: '-5', expected: ['-5y', '-5mth', '-5w', '-5d', '-5h', '-5min', '-5s', '-5ms'] },
      { input: '+20', expected: ['+20y', '+20mth', '+20w', '+20d', '+20h', '+20min', '+20s', '+20ms'] }
    ];

    for (const { input, expected } of testCases) assert.deepEqual(timeValidator(input), expected);
  }),

  t.test('should return the full time string if a valid unit is provided', () => {
    const testCases = [
      { input: '1y', expected: ['1y'] },
      { input: '2mth', expected: ['2mth'] },
      { input: '3w', expected: ['3w'] },
      { input: '4d', expected: ['4d'] },
      { input: '5h', expected: ['5h'] },
      { input: '6min', expected: ['6min'] },
      { input: '7s', expected: ['7s'] },
      { input: '8ms', expected: ['8ms'] },
      { input: '+10d', expected: ['+10d'] }
    ];

    for (const { input, expected } of testCases) assert.deepEqual(timeValidator(input), expected);
  }),

  t.test('should return suggestions for partial units', () => {
    const testCases = [
      { input: '1m', expected: ['1mth', '1min', '1ms'] },
      { input: '10mi', expected: ['10min'] },
      { input: '1s', expected: ['1s'] } // full match
    ];

    for (const { input, expected } of testCases) assert.deepEqual(timeValidator(input), expected);
  }),

  t.test('should handle complex valid time strings and suggest next part without duplicates', () => {
    const testCases = [
      { input: '1w3', expected: ['1w3y', '1w3mth', '1w3d', '1w3h', '1w3min', '1w3s', '1w3ms'] },
      { input: '1w3d2h5', expected: ['1w3d2h5y', '1w3d2h5mth', '1w3d2h5min', '1w3d2h5s', '1w3d2h5ms'] },
      { input: '1y2mth3w4d5h6min7s8', expected: ['1y2mth3w4d5h6min7s8ms'] }
    ];

    for (const { input, expected } of testCases) assert.deepEqual(timeValidator(input), expected);
  }),

  t.test('should handle complex valid time strings with partial unit and suggest completions', () => {
    const testCases = [
      { input: '1w3m', expected: ['1w3mth', '1w3min', '1w3ms'] },
      { input: '2h10mi', expected: ['2h10min'] }
    ];

    for (const { input, expected } of testCases) assert.deepEqual(timeValidator(input), expected);
  }),

  t.test('should return an empty array for invalid complex strings', () => {
    const testCases = [
      { input: '1w3w', expected: [] }, // Duplicate unit
      { input: '1y2b3d', expected: [] }, // Invalid unit in the middle
      { input: '1d-2h', expected: [] }, // Sign in the middle
      { input: '1a2d', expected: [] }, // Invalid unit followed by a number
      { input: '1day2h', expected: [] } // Invalid unit ('day' instead of 'd') followed by a number
    ];

    for (const { input, expected } of testCases) assert.deepEqual(timeValidator(input), expected);
  })
]));