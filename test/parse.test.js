const { test } = require('node:test');
const assert = require('node:assert');
const { getVideoId, cleanTitle } = require('../src/parse.js');

test('getVideoId extracts v param from a standard watch URL', () => {
  assert.strictEqual(getVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ'), 'dQw4w9WgXcQ');
});
test('getVideoId extracts v param when other params are present', () => {
  assert.strictEqual(getVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=ABC&t=42s'), 'dQw4w9WgXcQ');
});
test('getVideoId returns null when there is no v param', () => {
  assert.strictEqual(getVideoId('https://www.youtube.com/feed/subscriptions'), null);
});
test('getVideoId returns null for an unparseable input', () => {
  assert.strictEqual(getVideoId('not a url'), null);
});
test('cleanTitle strips the trailing " - YouTube"', () => {
  assert.strictEqual(cleanTitle('Some Artist - Some Track - YouTube'), 'Some Artist - Some Track');
});
test('cleanTitle strips a leading unread-count prefix', () => {
  assert.strictEqual(cleanTitle('(3) Some Track - YouTube'), 'Some Track');
});
test('cleanTitle leaves a clean title unchanged', () => {
  assert.strictEqual(cleanTitle('Some Track'), 'Some Track');
});
