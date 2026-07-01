(function () {
  // Overlay position + collapsed state, persisted across reloads.
  let uiState = { x: null, y: null, collapsed: false };
  // Whether the overlay is hidden (closed). Per-page-session, not persisted:
  // a fresh page load shows it again; the toolbar icon toggles it.
  let hidden = false;

  const overlay = createOverlay({
    logoUrl: chrome.runtime.getURL('logo.svg'),
    onLabel: handleLabel,
    onExport: handleExport,
    onMove: ({ x, y }) => {
      uiState.x = x;
      uiState.y = y;
      setUiState(uiState);
    },
    onToggle: (collapsed) => {
      uiState.collapsed = collapsed;
      setUiState(uiState);
    },
    onClose: () => {
      hidden = true;
      overlay.setVisible(false);
    },
  });

  // Toolbar icon click (relayed by the background worker) toggles visibility.
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg && msg.type === 'labello-toggle') {
      hidden = !hidden;
      overlay.setVisible(!hidden);
    }
  });

  function mount() {
    if (!document.getElementById('labello-overlay')) {
      document.body.appendChild(overlay.el);
    }
  }

  async function restoreUi() {
    const ui = await getUiState();
    if (!ui) return;
    uiState = { x: ui.x ?? null, y: ui.y ?? null, collapsed: !!ui.collapsed };
    if (typeof uiState.x === 'number' && typeof uiState.y === 'number') {
      overlay.setPosition({ x: uiState.x, y: uiState.y });
    }
    if (uiState.collapsed) overlay.setCollapsed(true);
  }

  async function refresh() {
    const all = await getAllLabels();
    const id = getVideoId(location.href);
    const entry = id ? all[id] : null;
    overlay.render({
      title: id ? cleanTitle(document.title) : null,
      label: entry ? entry.label : null,
      count: Object.keys(all).length,
      onTrack: !!id,
    });
  }

  async function handleLabel(value) {
    const id = getVideoId(location.href);
    if (!id) return;
    const all = await getAllLabels();
    if (all[id] && all[id].label === value) {
      // clicking the already-active label clears it
      await removeLabel(id);
    } else {
      await setLabel(id, {
        url: `https://www.youtube.com/watch?v=${id}`,
        title: cleanTitle(document.title),
        label: value,
      });
    }
    await refresh();
  }

  async function handleExport() {
    const all = await getAllLabels();
    const csv = buildCsv(all);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = exportFilename();
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function isTyping(target) {
    if (!target) return false;
    const tag = target.tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable;
  }

  document.addEventListener('keydown', (e) => {
    if (isTyping(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === 'b') { e.preventDefault(); handleLabel(0); }
    else if (e.key === 'g') { e.preventDefault(); handleLabel(1); }
  });

  window.addEventListener('yt-navigate-finish', refresh);

  mount();
  restoreUi();
  refresh();
})();
