import assert from 'node:assert/strict';
import { test as topLvlTest } from 'node:test';

import checkTargetManageable from '#Utils/checkTargetManageable.js';

/* eslint-disable @typescript-eslint/no-unsafe-assignment -- not gonna type all that */
const
  mockUser = (id, highestRolePosition) => ({
    id,
    roles: { highest: { position: highestRolePosition } },
    manageable: true
  }),

  mockThisContext = (guildOwnerId, user, member) => ({
    guild: { ownerId: guildOwnerId },
    user,
    member
  });
/* eslint-enable @typescript-eslint/no-unsafe-assignment */


await topLvlTest('checkTargetManageable', { concurrency: true }, async t => Promise.allSettled([
  t.test('should return "cantPunishSelf" if target is the author', () => {
    const
      author = mockUser('1', 10),
      thisContext = mockThisContext('100', author, author);

    assert.equal(checkTargetManageable.call(thisContext, author), 'cantPunishSelf');
  }),

  t.test('should return "global.noPermBot" if target is not manageable', () => {
    const
      author = mockUser('1', 10),
      target = { ...mockUser('2', 5), manageable: false },
      thisContext = mockThisContext('100', author, author);

    assert.equal(checkTargetManageable.call(thisContext, target), 'global.noPermBot');
  }),

  t.test('should return "global.noPermUser" if target has a higher or equal role', () => {
    const author = mockUser('1', 10),
      targetHigher = mockUser('2', 11),
      targetEqual = mockUser('3', 10),
      thisContext = mockThisContext('100', author, author);

    assert.equal(checkTargetManageable.call(thisContext, targetHigher), 'global.noPermUser');
    assert.equal(checkTargetManageable.call(thisContext, targetEqual), 'global.noPermUser');
  }),

  t.test('should return undefined if target is manageable', () => {
    const author = mockUser('1', 10),
      target = mockUser('2', 5),
      thisContext = mockThisContext('100', author, author);

    assert.equal(checkTargetManageable.call(thisContext, target), undefined);
  }),

  t.test('should return "global.noPermBot" even if author is guild owner when target is not manageable', () => {
    const
      owner = mockUser('1', 10), // Owner has a low role position
      target = { ...mockUser('2', 15), manageable: false }, // Target has a high role and is not manageable
      thisContext = mockThisContext('1', owner, owner); // The author of the command is the guild owner

    assert.equal(checkTargetManageable.call(thisContext, target), 'global.noPermBot');
  }),

  t.test('should return undefined if author is guild owner and target has higher role but is manageable', () => {
    const
      owner = mockUser('1', 10), // Owner has a low role position
      target = mockUser('2', 15), // Target has a high role but is manageable
      thisContext = mockThisContext('1', owner, owner); // The author of the command is the guild owner

    assert.equal(checkTargetManageable.call(thisContext, target), undefined);
  })
]));