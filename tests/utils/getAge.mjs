import assert from 'node:assert/strict';
import { test as topLvlTest } from 'node:test';
import getAge from '#utils/getAge.ts';

await topLvlTest('getAge', async t => {
  await t.test('should return correct age if birthday has passed', () => {
    assert.equal(getAge(Temporal.Now.plainDateISO().subtract({ years: 20 })), 20);
  });

  await t.test('should return correct age if birthday is tomorrow', () => {
    const tomorrowBirth = Temporal.Now.plainDateISO().subtract({ years: 20 }).add({ days: 1 });
    assert.equal(getAge(tomorrowBirth), 19);
  });
});