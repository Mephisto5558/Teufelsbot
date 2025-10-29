import assert from 'node:assert/strict';
import { test as topLvlTest } from 'node:test';

import getAge from '#Utils/getAge.js';

await topLvlTest('getAge', { concurrency: true }, async t => Promise.allSettled([
  t.test('should return the correct age when birthday is today', () => {
    const
      now = new Date(),
      birthDate = new Date(now.getFullYear() - 25, now.getMonth(), now.getDate());

    assert.equal(getAge(birthDate), 25);
  }),

  t.test('should return the correct age when birthday has passed this year', () => {
    const
      now = new Date(),
      birthDate = new Date(now.getFullYear() - 30, now.getMonth() - 1, now.getDate());

    assert.equal(getAge(birthDate), 30);
  }),

  t.test('should return the correct age when birthday is later this year', () => {
    const
      now = new Date(),
      birthDate = new Date(now.getFullYear() - 20, now.getMonth() + 1, now.getDate());

    assert.equal(getAge(birthDate), 19);
  }),

  t.test('should return the correct age when birthday is tomorrow', () => {
    const
      now = new Date(),
      birthDate = new Date(now.getFullYear() - 18, now.getMonth(), now.getDate() + 1);

    assert.equal(getAge(birthDate), 17);
  }),

  t.test('should return 0 for someone less than a year old', () => {
    const
      now = new Date(),
      birthDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());

    assert.equal(getAge(birthDate), 0);
  }),

  t.test('should handle leap years correctly', ({ mock }) => {
    // Test on a non-leap year, with a birthday on Feb 29
    const
      nonLeapYearNow = new Date('2023-03-01T12:00:00Z'),
      birthDateOnLeap = new Date('2000-02-29T12:00:00Z');

    mock.timers.enable({ apis: ['Date'], now: nonLeapYearNow });
    assert.equal(getAge(birthDateOnLeap), 23, 'should be 23 after Feb 28 on a non-leap year');
  })
]));