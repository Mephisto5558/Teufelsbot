import assert from 'node:assert/strict';
import { test as topLvlTest } from 'node:test';

import commandMention from '#Utils/commandMention.js';

await topLvlTest('commandMention', { concurrency: true }, async t => Promise.allSettled([
  t.test('should format a standard command name and ID correctly', () => {
    assert.equal(commandMention('ping', '123456789012345678'), '</ping:123456789012345678>');
  }),

  t.test('should handle command names with dashes or underscores', () => {
    assert.equal(commandMention('test-command', '123'), '</test-command:123>');
    assert.equal(commandMention('test_command', '456'), '</test_command:456>');
  }),

  t.test('should handle subcommand names', () => {
    assert.equal(commandMention('command subcommandgroup subcommand', '123'), '</command subcommandgroup subcommand:123>');
    assert.equal(commandMention('command subcommand', '456'), '</command subcommand:456>');
  }),

  t.test('should handle empty strings for name or id', () => {
    assert.equal(commandMention('', '123'), '</:123>');
    assert.equal(commandMention('test', ''), '</test:>');
    assert.equal(commandMention('', ''), '</:>');
  }),

  t.test('should handle non-string inputs by coercing them to strings', () => {
    assert.equal(commandMention('test', 12_345), '</test:12345>');
  })
]));