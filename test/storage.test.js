const { test, beforeEach } = require('node:test');
const assert = require('node:assert');

let store = {};
global.chrome = {
  storage: {
    local: {
      async get(keys) {
        if (keys === null || keys === undefined) return { ...store };
        if (typeof keys === 'string') return { [keys]: store[keys] };
        return {};
      },
      async set(obj) {
        Object.assign(store, obj);
      },
      async remove(key) {
        delete store[key];
      },
    },
  },
};

const { getAllLabels, setLabel, removeLabel, countLabels, getUiState, setUiState } = require('../src/storage.js');

beforeEach(() => {
  store = {};
});

test('setLabel writes an entry that getAllLabels returns', async () => {
  await setLabel('abc', { url: 'u', title: 't', label: 1 });
  assert.deepStrictEqual(await getAllLabels(), { abc: { url: 'u', title: 't', label: 1 } });
});
test('setLabel on an existing id overwrites the entry', async () => {
  await setLabel('abc', { url: 'u', title: 't', label: 1 });
  await setLabel('abc', { url: 'u', title: 't', label: 0 });
  assert.deepStrictEqual(await getAllLabels(), { abc: { url: 'u', title: 't', label: 0 } });
});
test('removeLabel deletes an entry', async () => {
  await setLabel('a', { url: 'u', title: 't', label: 1 });
  await setLabel('b', { url: 'u', title: 't', label: 0 });
  await removeLabel('a');
  assert.deepStrictEqual(await getAllLabels(), { b: { url: 'u', title: 't', label: 0 } });
});
test('removeLabel on a missing id is a no-op', async () => {
  await setLabel('a', { url: 'u', title: 't', label: 1 });
  await removeLabel('nope');
  assert.deepStrictEqual(await getAllLabels(), { a: { url: 'u', title: 't', label: 1 } });
});
test('countLabels returns the number of stored entries', async () => {
  assert.strictEqual(await countLabels(), 0);
  await setLabel('a', { url: 'u', title: 't', label: 1 });
  await setLabel('b', { url: 'u', title: 't', label: 0 });
  assert.strictEqual(await countLabels(), 2);
});
test('getUiState returns null when nothing is stored', async () => {
  assert.strictEqual(await getUiState(), null);
});
test('setUiState then getUiState round-trips the state', async () => {
  await setUiState({ x: 12, y: 340, collapsed: true });
  assert.deepStrictEqual(await getUiState(), { x: 12, y: 340, collapsed: true });
});
test('UI state does not leak into getAllLabels or countLabels', async () => {
  await setLabel('a', { url: 'u', title: 't', label: 1 });
  await setUiState({ x: 1, y: 2, collapsed: false });
  assert.deepStrictEqual(await getAllLabels(), { a: { url: 'u', title: 't', label: 1 } });
  assert.strictEqual(await countLabels(), 1);
});
