// Reserved key for overlay UI state (position + collapsed). It is namespaced
// with a colon so it can never collide with an 11-char YouTube video id, and
// it is filtered out of getAllLabels so it never lands in the CSV or the count.
const UI_KEY = 'labello:ui';

async function getAllLabels() {
  const all = await chrome.storage.local.get(null);
  delete all[UI_KEY];
  return all;
}

async function setLabel(videoId, entry) {
  await chrome.storage.local.set({ [videoId]: entry });
}

async function removeLabel(videoId) {
  await chrome.storage.local.remove(videoId);
}

async function countLabels() {
  const all = await getAllLabels();
  return Object.keys(all).length;
}

async function getUiState() {
  const res = await chrome.storage.local.get(UI_KEY);
  return res[UI_KEY] || null;
}

async function setUiState(state) {
  await chrome.storage.local.set({ [UI_KEY]: state });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { getAllLabels, setLabel, removeLabel, countLabels, getUiState, setUiState, UI_KEY };
}
