/* eslint-disable id-length */

import assert from 'node:assert/strict';
import { test as topLvlTest } from 'node:test';

import findAllEntries from '#Utils/findAllEntries.js';

await topLvlTest('findAllEntries', { concurrency: true }, async t => Promise.allSettled([
  t.test('should find a single entry in a flat object', () => {
    const obj = { a: 1, b: 'test', c: true };
    assert.deepEqual(findAllEntries(obj, 'b'), { b: 'test' });
  }),

  t.test('should return an empty object if key is not found', () => {
    const obj = { a: 1, b: 'test' };
    assert.deepEqual(findAllEntries(obj, 'c'), {});
  }),

  t.test('should find the first entry in a nested object', () => {
    const obj = {
      a: 1,
      b: {
        c: 2,
        target: 'first'
      },
      d: {
        e: {
          f: 3,
          target: 'last'
        }
      }
    };

    // The implementation overwrites keys, and due to the stack implementation (LIFO), the first entry in document order wins.
    assert.deepEqual(findAllEntries(obj, 'target'), { target: 'first' });
  }),

  t.test('should not search in arrays', () => {
    const obj = {
      a: [{ target: 'inArray' }],
      b: { target: 'inObject' }
    };
    assert.deepEqual(findAllEntries(obj, 'target'), { target: 'inObject' });
  }),

  t.test('should handle various value types', () => {
    const obj = {
      a: { target: null },
      b: { target: undefined },
      c: { target: 0 },
      d: { target: { nested: true } }
    };
    assert.deepEqual(findAllEntries(obj, 'target'), { target: null });
  }),

  t.test('should handle empty or non-object inputs gracefully', () => {
    assert.deepEqual(findAllEntries({}, 'a'), {});
    assert.deepEqual(findAllEntries([], 'a'), {});
    assert.deepEqual(findAllEntries('string', 'a'), {});
  }),

  t.test('should throw an error on missing object', () => {
    assert.throws(() => findAllEntries(null, 'a'), TypeError);
    assert.throws(() => findAllEntries(undefined, 'a'), TypeError);
  })
]));