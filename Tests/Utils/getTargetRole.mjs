/* eslint-disable @typescript-eslint/no-empty-function */

/** @import { CommandInteractionOptionResolver } from 'discord.js' */


import { Collection } from 'discord.js';
import assert from 'node:assert/strict';
import { test } from 'node:test';

import getTargetRole from '#Utils/getTargetRole.js';

await test('getTargetRole', { concurrency: true }, async t => {
  const
    mockRole1 = { id: 'role1', name: 'Role One', position: 1 },
    mockRole2 = { id: 'role2', name: 'Role Two', position: 2 },
    mockHighestRole = { id: 'highestRole', name: 'Highest Role', position: 5 },

    createMockInteraction = () => {
      const cache = new Collection([
        [mockRole1.id, mockRole1],
        [mockRole2.id, mockRole2],
        [mockHighestRole.id, mockHighestRole]
      ]);

      return {
        /** @type {Partial<CommandInteractionOptionResolver>} */
        options: { getRole: () => {} },
        mentions: {
          roles: {
            /** @type {Collection['first']} */
            first: () => {}
          }
        },
        guild: { roles: { cache } },
        member: { roles: { highest: mockHighestRole } },
        content: '',
        args: []
      };
    };

  return Promise.allSettled([
    t.test('should return a role from interaction options', () => {
      const mockInteraction = createMockInteraction();
      let callCount = 0;

      mockInteraction.options.getRole = (name, required) => {
        callCount++;
        assert.strictEqual(name, 'target');
        assert.strictEqual(required, undefined);
        return mockRole1;
      };

      const result = getTargetRole(mockInteraction);
      assert.strictEqual(result, mockRole1);
      assert.strictEqual(callCount, 1);
    }),

    t.test('should return a role from mentions if not in options', () => {
      const mockInteraction = createMockInteraction();
      mockInteraction.mentions.roles.first = () => mockRole2;

      const result = getTargetRole(mockInteraction);
      assert.strictEqual(result, mockRole2);
    }),

    t.test('should return a role from content by ID', () => {
      const mockInteraction = createMockInteraction();
      mockInteraction.content = 'some command role1';
      mockInteraction.args = ['role1'];

      const result = getTargetRole(mockInteraction);
      assert.strictEqual(result, mockRole1);
    }),

    t.test('should return a role from content by name', () => {
      const mockInteraction = createMockInteraction();
      mockInteraction.content = 'Role Two';
      mockInteraction.args = ['Role', 'Two'];

      const result = getTargetRole(mockInteraction);
      assert.strictEqual(result, mockRole2);
    }),

    t.test('should return a role from args by ID', () => {
      const mockInteraction = createMockInteraction();
      mockInteraction.content = 'role1';
      mockInteraction.args = ['role1'];

      const result = getTargetRole(mockInteraction);
      assert.strictEqual(result, mockRole1);
    }),

    t.test('should return a role from args by name', () => {
      const mockInteraction = createMockInteraction();
      mockInteraction.content = 'Role Two';
      mockInteraction.args = ['Role', 'Two'];

      const result = getTargetRole(mockInteraction);
      assert.strictEqual(result, mockRole2);
    }),

    t.test('should return the member\'s highest role if returnSelf is true and no other role was found', () => {
      const result = getTargetRole(createMockInteraction(), { returnSelf: true });
      assert.strictEqual(result, mockHighestRole);
    }),

    t.test('should return undefined if no role was found and returnSelf is false', () => {
      const result = getTargetRole(createMockInteraction());
      assert.strictEqual(result, undefined);
    }),

    t.test('should use a custom targetOptionName', () => {
      const mockInteraction = createMockInteraction();
      mockInteraction.options.getRole = name => {
        assert.strictEqual(name, 'customRole');
        return mockRole1;
      };

      const result = getTargetRole(mockInteraction, { targetOptionName: 'customRole' });
      assert.strictEqual(result, mockRole1);
    }),

    t.test('should return undefined for non-existent role name', () => {
      const mockInteraction = createMockInteraction();
      mockInteraction.content = 'NonExistentRole';
      mockInteraction.args = ['NonExistentRole'];

      const result = getTargetRole(mockInteraction);
      assert.strictEqual(result, undefined);
    }),

    t.test('should return undefined for non-existent role ID', () => {
      const mockInteraction = createMockInteraction();
      mockInteraction.content = 'non-existent-id';
      mockInteraction.args = ['non-existent-id'];

      const result = getTargetRole(mockInteraction);
      assert.strictEqual(result, undefined);
    })
  ]);
});