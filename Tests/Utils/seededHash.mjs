import assert from 'node:assert/strict';
import { test as topLvlTest } from 'node:test';

import seededHash from '#Utils/seededHash.js';


await topLvlTest('seededHash', { concurrency: true }, async t => Promise.allSettled([
  t.test('should return a number', () => {
    assert.equal(typeof seededHash(''), 'number');
    assert.equal(typeof seededHash('abcdefg'), 'number');
  }),
  t.test('should return the same value given the same seed and input', () => {
    assert.equal(seededHash('', 123), seededHash('', 123));
  }),
  t.test('should return a known, specific value (snapshot test)', () => {
    // These values should not be changed unless the algorithm itself is intentionally changed.
    assert.equal(seededHash('test', 123), 3_101_739_001_716_980);
    assert.equal(seededHash('hello world', 42), 8_598_010_756_496_894);
  }),
  t.test('should handle the default seed correctly', () => {
    assert.equal(seededHash(''), seededHash('', 0));
    assert.notEqual(seededHash(''), seededHash('', 1));
  }),
  t.test('should handle unicode characters correctly', () => {
    assert.equal(seededHash('😊', 1), 1_044_191_984_208_322);
    assert.notEqual(seededHash('😊', 1), seededHash('xx', 1)); // Different from a simple 2-char string
  }),
  t.test('should have no collisions with generated inputs', () => {
    const
      testIterations = 500_000,
      generatedHashes = new Set();

    for (let i = 0; i < testIterations; i++) {
      /* eslint-disable sonarjs/pseudo-random */
      // Generate random string with random length
      const
        randomString = Array.from(
          { length: Math.floor(Math.random() * 50) + 1 },
          () => String.fromCodePoint(Math.floor(Math.random() * (0xD7FF - 0x20)) + 0x20) // Wide range of characters
        ).join(''),
        randomSeed = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);

      generatedHashes.add(seededHash(randomString, randomSeed));
      /* eslint-enable sonarjs/pseudo-random */
    }

    assert.equal(
      generatedHashes.size, testIterations,
      `Found ${testIterations - generatedHashes.size} collisions in ${testIterations} iterations.`
    );
  })
]));