/* eslint-disable id-length */

import assert from 'node:assert/strict';
import { test as topLvlTest } from 'node:test';

import filterEmptyEntries from '#Utils/filterEmptyEntries.js';

await topLvlTest('filterEmptyEntries', { concurrency: true }, async t => Promise.allSettled([
  t.test('should remove null, undefined, empty objects, and empty arrays recursively', () => {
    const
      obj = {
        a: 1,
        b: null,
        c: undefined,
        d: 'test',
        e: {},
        f: [],
        g: { h: null, i: undefined, j: [], k: {} },
        l: { m: 1, n: null },
        o: [1, null, undefined, {}, []],
        p: { q: { r: null } },
        s: { t: 'value', u: null },
        v: [null, undefined, {}, []]
      },
      expected = {
        a: 1,
        d: 'test',
        l: { m: 1 },
        o: [1],
        s: { t: 'value' }
      };

    assert.deepEqual(filterEmptyEntries(obj), expected);
  }),

  t.test('should return an empty object if all entries are empty or null/undefined', () => {
    const obj = {
      a: null,
      b: undefined,
      c: {},
      d: [],
      e: { f: null, g: {}, h: [] },
      i: [null, undefined, {}, []]
    };
    assert.deepEqual(filterEmptyEntries(obj), {});
  }),

  t.test('should return the object unchanged if no empty entries', () => {
    const obj = { a: 1, b: 'test', c: { d: 2 }, e: [3, 4] };
    assert.deepEqual(filterEmptyEntries(obj), { a: 1, b: 'test', c: { d: 2 }, e: [3, 4] });
  }),

  t.test('should handle arrays containing only empty values', () => {
    const obj = { arr: [null, undefined, {}, []] };
    assert.deepEqual(filterEmptyEntries(obj), {});
  }),

  t.test('should handle empty input object', () => {
    assert.deepEqual(filterEmptyEntries({}), {});
  }),

  t.test('should return an empty object for non-object inputs', () => {
    assert.deepEqual(filterEmptyEntries('string'), {});
    assert.deepEqual(filterEmptyEntries(123), {});
    assert.deepEqual(filterEmptyEntries(true), {});
    assert.deepEqual(filterEmptyEntries(), {}); // undefined
    assert.deepEqual(filterEmptyEntries(null), {});
  })
]));