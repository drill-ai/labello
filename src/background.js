// Clicking the toolbar icon toggles the overlay on the active tab. The message
// is ignored (caught) on tabs without the content script (non-YouTube pages).
chrome.action.onClicked.addListener((tab) => {
  if (!tab || !tab.id) return;
  chrome.tabs.sendMessage(tab.id, { type: 'labello-toggle' }).catch(() => {});
});
