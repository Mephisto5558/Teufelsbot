/* eslint-disable @typescript-eslint/no-empty-function */

import { Collection } from 'discord.js';
import assert from 'node:assert/strict';
import { test } from 'node:test';

import getTargetMembers from '#Utils/getTargetMembers.js';

await test('getTargetMembers', { concurrency: true }, async t => {
  const
    mockUser1 = { id: 'user1', username: 'UserOne', globalName: 'User One', displayName: 'UserOne' },
    mockUser2 = { id: 'user2', username: 'UserTwo', globalName: 'User Two', displayName: 'UserTwo' },
    mockUser3 = { id: 'user3', username: 'UserThree', globalName: 'User Three', displayName: 'UserThree' },
    mockInteractionUser = { id: 'interactionUser', username: 'InteractionUser', globalName: 'Interaction User', displayName: 'InteractionUser' },
    mockBotUser = { id: 'botId', username: 'BotUser', globalName: 'Bot User', displayName: 'BotUser' },

    mockMember1 = { id: 'user1', user: mockUser1, nickname: 'MemberOne', displayName: 'MemberOne' },
    mockMember2 = { id: 'user2', user: mockUser2, nickname: null, displayName: 'UserTwo' },
    mockMember3 = { id: 'user3', user: mockUser3, nickname: 'MemberThree', displayName: 'MemberThree' },
    mockInteractionMember = { id: 'interactionUser', user: mockInteractionUser, nickname: 'InteractionMember', displayName: 'InteractionMember' },
    mockBotMember = { id: 'botId', user: mockBotUser, nickname: 'TheBot', displayName: 'TheBot' },

    createMockInteraction = (isInGuild = true) => {
      const
        membersCache = new Collection([
          [mockMember1.id, mockMember1],
          [mockMember2.id, mockMember2],
          [mockMember3.id, mockMember3],
          [mockInteractionMember.id, mockInteractionMember],
          [mockBotMember.id, mockBotMember]
        ]),
        usersCache = new Collection([
          [mockUser1.id, mockUser1],
          [mockUser2.id, mockUser2],
          [mockUser3.id, mockUser3],
          [mockInteractionUser.id, mockInteractionUser],
          [mockBotUser.id, mockBotUser]
        ]);

      return {
        inGuild: () => isInGuild,
        options: { getMember: () => {}, getUser: () => {} },
        mentions: {
          members: new Collection(),
          users: new Collection()
        },
        guild: isInGuild ? { members: { cache: membersCache } } : null,
        client: { user: mockBotUser, users: { cache: usersCache } },
        user: mockInteractionUser,
        member: isInGuild ? mockInteractionMember : null,
        content: '',
        args: [],
        originalContent: ''
      };
    };

  return Promise.allSettled([
    // Single Target Tests
    t.test('should return a single member from options', () => {
      const mockInteraction = createMockInteraction();
      mockInteraction.options.getMember = name => {
        assert.strictEqual(name, 'target');
        return mockMember1;
      };

      const result = getTargetMembers(mockInteraction);
      assert.strictEqual(result, mockMember1);
    }),

    t.test('should return a single member from mentions', () => {
      const mockInteraction = createMockInteraction();
      mockInteraction.mentions.members = new Collection([[mockMember2.id, mockMember2]]);

      const result = getTargetMembers(mockInteraction);
      assert.strictEqual(result, mockMember2);
    }),

    t.test('should return a single member from content by ID', () => {
      const mockInteraction = createMockInteraction();
      mockInteraction.content = 'user1';

      const result = getTargetMembers(mockInteraction);
      assert.strictEqual(result, mockMember1);
    }),

    t.test('should return a single member from content by nickname', () => {
      const mockInteraction = createMockInteraction();
      mockInteraction.content = 'some text MemberThree more text';

      const result = getTargetMembers(mockInteraction);
      assert.strictEqual(result, mockMember3);
    }),

    t.test('should return a single member from content by username', () => {
      const mockInteraction = createMockInteraction();
      mockInteraction.content = 'UserTwo';

      const result = getTargetMembers(mockInteraction);
      assert.strictEqual(result, mockMember2);
    }),

    t.test('should return self if returnSelf is true and no target is found', () => {
      const mockInteraction = createMockInteraction();
      assert.strictEqual(getTargetMembers(mockInteraction, { returnSelf: true }), mockInteractionMember);
    }),

    t.test('should return undefined if no target is found', () => {
      const mockInteraction = createMockInteraction();
      assert.strictEqual(getTargetMembers(mockInteraction), undefined);
    }),

    t.test('should return a user when not in a guild', () => {
      const mockInteraction = createMockInteraction(false);
      mockInteraction.options.getUser = () => mockUser1;

      assert.strictEqual(getTargetMembers(mockInteraction), mockUser1);
    }),

    // Multiple Targets Tests
    t.test('should return multiple members from options', () => {
      const mockInteraction = createMockInteraction();
      mockInteraction.options.getMember = name => {
        if (name === 'target') return mockMember1;
        if (name === 'target1') return mockMember2;
        return null;
      };

      assert.deepStrictEqual(getTargetMembers(mockInteraction, [{ __count__: 1 }, {}]), [mockMember1, mockMember2]);
    }),

    t.test('should return multiple members from mentions', () => {
      const mockInteraction = createMockInteraction();
      mockInteraction.mentions.members = new Collection([
        [mockMember1.id, mockMember1],
        [mockMember2.id, mockMember2]
      ]);

      assert.deepStrictEqual(getTargetMembers(mockInteraction, [{ __count__: 1 }, {}]), [mockMember1, mockMember2]);
    }),

    t.test('should return multiple members from mixed sources (options, mentions, content)', () => {
      const mockInteraction = createMockInteraction();
      mockInteraction.options.getMember = name => (name === 'targetA' ? mockMember1 : null);
      mockInteraction.mentions.members = new Collection([[mockMember2.id, mockMember2]]);
      mockInteraction.content = 'also find MemberThree';

      const result = getTargetMembers(mockInteraction, [
        { targetOptionName: 'targetA' },
        {},
        {}
      ]);

      assert.deepStrictEqual(result, [mockMember1, mockMember2, mockMember3]);
    }),

    t.test('should not return duplicate members', () => {
      const mockInteraction = createMockInteraction();
      mockInteraction.options.getMember = () => mockMember1;
      mockInteraction.mentions.members = new Collection([[mockMember1.id, mockMember1]]);

      assert.deepStrictEqual(getTargetMembers(mockInteraction, [{ __count__: 1 }, {}]), [mockMember1, undefined]);
    }),

    t.test('should return self as one of multiple targets', () => {
      const mockInteraction = createMockInteraction();
      mockInteraction.options.getMember = () => mockMember1;

      assert.deepStrictEqual(getTargetMembers(mockInteraction, [{ __count__: 1 }, { returnSelf: true }]), [mockMember1, mockInteractionMember]);
    }),

    // Edge Cases
    t.test('should ignore bot mention if it is the only mention and at the start', () => {
      const mockInteraction = createMockInteraction();
      mockInteraction.originalContent = `<@${mockBotUser.id}> find UserOne`;
      mockInteraction.content = 'find UserOne';
      mockInteraction.mentions.members = new Collection([[mockBotMember.id, mockBotMember]]);

      assert.strictEqual(getTargetMembers(mockInteraction), mockMember1, 'It should find the next available member');
    }),

    t.test('should not ignore bot mention if there are other mentions', () => {
      const mockInteraction = createMockInteraction();
      mockInteraction.content = `<@${mockBotUser.id}> <@${mockUser1.id}>`;
      mockInteraction.mentions.members = new Collection([
        [mockBotMember.id, mockBotMember],
        [mockMember1.id, mockMember1]
      ]);

      assert.deepStrictEqual(
        getTargetMembers(mockInteraction, [{ __count__: 1 }, {}]),
        [mockBotMember, mockMember1], 'The bot should be the first result'
      );
    })
  ]);
});