/* eslint-disable @typescript-eslint/no-empty-function */

/** @import { CommandInteractionOptionResolver } from 'discord.js' */


import { Collection } from 'discord.js';
import assert from 'node:assert/strict';
import { test } from 'node:test';

import getTargetChannel from '#Utils/getTargetChannel.js';


await test('getTargetChannel', { concurrency: true }, async t => {
  const
    mockChannel1 = { id: 'channel1', name: 'Channel-One' },
    /* eslint-disable-next-line sonarjs/no-duplicate-string */
    mockChannel2 = { id: 'channel2', name: 'Channel-Two' },
    mockInteractionChannel = { id: 'interactionChannel', name: 'Interaction-Channel' },

    createMockInteraction = () => {
      const cache = new Collection([
        [mockChannel1.id, mockChannel1],
        [mockChannel2.id, mockChannel2],
        [mockInteractionChannel.id, mockInteractionChannel]
      ]);

      return {
        /** @type {Partial<CommandInteractionOptionResolver>} */
        options: { getChannel: () => {} },
        mentions: {
          channels: {
          /** @type {Collection['first']} */
            first: () => {}
          }
        },
        guild: { channels: { cache } },
        channel: mockInteractionChannel,
        content: '',
        args: []
      };
    };

  return Promise.allSettled([
    t.test('should return a channel from interaction options', () => {
      const mockInteraction = createMockInteraction();
      let callCount = 0;

      mockInteraction.options.getChannel = (name, required) => {
        callCount++;
        assert.strictEqual(name, 'channel');
        assert.strictEqual(required, false);
        return mockChannel1;
      };

      const result = getTargetChannel(mockInteraction);
      assert.strictEqual(result, mockChannel1);
      assert.strictEqual(callCount, 1);
    }),

    t.test('should return a channel from mentions if not in options', () => {
      const mockInteraction = createMockInteraction();
      mockInteraction.mentions.channels.first = () => mockChannel2;

      const result = getTargetChannel(mockInteraction);
      assert.strictEqual(result, mockChannel2);
    }),

    t.test('should return a channel from content by ID', () => {
      const mockInteraction = createMockInteraction();
      mockInteraction.content = 'some command channel1';
      mockInteraction.args = ['channel1'];

      const result = getTargetChannel(mockInteraction);
      assert.strictEqual(result, mockChannel1);
    }),

    t.test('should return a channel from content by name', () => {
      const mockInteraction = createMockInteraction();
      mockInteraction.content = 'Channel-Two';
      mockInteraction.args = ['Channel-Two'];

      const result = getTargetChannel(mockInteraction);
      assert.strictEqual(result, mockChannel2);
    }),

    t.test('should return a channel from args by ID', () => {
      const mockInteraction = createMockInteraction();
      mockInteraction.content = 'channel1';
      mockInteraction.args = ['channel1'];

      const result = getTargetChannel(mockInteraction);
      assert.strictEqual(result, mockChannel1);
    }),

    t.test('should return a channel from args by name', () => {
      const mockInteraction = createMockInteraction();
      mockInteraction.content = 'Channel-Two';
      mockInteraction.args = ['Channel-Two'];

      const result = getTargetChannel(mockInteraction);
      assert.strictEqual(result, mockChannel2);
    }),

    t.test('should return the interaction channel if returnSelf is true and no other channel was found', () => {
      const result = getTargetChannel(createMockInteraction(), { returnSelf: true });
      assert.strictEqual(result, mockInteractionChannel);
    }),

    t.test('should return undefined if no channel was found and returnSelf is false', () => {
      const result = getTargetChannel(createMockInteraction());
      assert.strictEqual(result, undefined);
    }),

    t.test('should use a custom targetOptionName', () => {
      const mockInteraction = createMockInteraction();
      mockInteraction.options.getChannel = name => {
        assert.strictEqual(name, 'customChannel');
        return mockChannel1;
      };

      const result = getTargetChannel(mockInteraction, { targetOptionName: 'customChannel' });
      assert.strictEqual(result, mockChannel1);
    }),

    t.test('should return undefined for non-existent channel name', () => {
      const mockInteraction = createMockInteraction();
      mockInteraction.args = ['NonExistentChannel'];

      const result = getTargetChannel(mockInteraction);
      assert.strictEqual(result, undefined);
    })
  ]);
});