import assert from 'node:assert/strict';
import { test as topLvlTest } from 'node:test';

import filename from '#Utils/filename.js';

await topLvlTest('filename', { concurrency: true }, async t => Promise.allSettled([
  t.test('should return the filename without extension from a full path', () => {
    assert.equal(filename('/path/to/file.js'), 'file');
    assert.equal(filename(String.raw`C:\path\to\file.txt`), 'file');
  }),

  t.test('should return the filename without extension when there are multiple dots', () => {
    assert.equal(filename('/path/to/archive.tar.gz'), 'archive.tar');
  }),

  t.test('should return the full filename if there is no extension', () => {
    assert.equal(filename('/path/to/file'), 'file');
  }),

  t.test('should handle filenames starting with a dot (hidden files)', () => {
    assert.equal(filename('.env.example'), '.env');
    assert.equal(filename('.gitignore'), '.gitignore');
  }),

  t.test('should handle paths ending with a directory', () => {
    assert.equal(filename('/path/to/directory/'), 'directory');
    assert.equal(filename('/path/to/directory'), 'directory');
  }),

  t.test('should handle edge cases like empty strings or dots', () => {
    assert.equal(filename(''), '');
    assert.equal(filename('.'), '.');
    assert.equal(filename('..'), '..');
  }),

  t.test('should handle filename only without path', () => {
    assert.equal(filename('file.js'), 'file');
    assert.equal(filename('file'), 'file');
  }),

  t.test('should throw a TypeError for non-string inputs', () => {
    assert.throws(() => filename(null), TypeError);
    assert.throws(() => filename(), TypeError);
    assert.throws(() => filename(123), TypeError);
    assert.throws(() => filename({}), TypeError);
  })
]));