import assert from 'node:assert/strict';
import { test as topLvlTest } from 'node:test';

import convertToMedal from '#Utils/convertToMedal.js';

await topLvlTest('convertToMedal', { concurrency: true }, async t => Promise.allSettled([
  t.test('should return the first place medal for input 0', () => {
    assert.equal(convertToMedal(0), ':first_place:');
  }),

  t.test('should return the second place medal for input 1', () => {
    assert.equal(convertToMedal(1), ':second_place:');
  }),

  t.test('should return the third place medal for input 2', () => {
    assert.equal(convertToMedal(2), ':third_place:');
  }),

  t.test('should return a numbered string for places greater than 2', () => {
    assert.equal(convertToMedal(3), '4.');
    assert.equal(convertToMedal(9), '10.');
    assert.equal(convertToMedal(99), '100.');
  }),

  t.test('should handle negative or out-of-bounds indices', () => {
    assert.equal(convertToMedal(-1), '0.');
  })
]));