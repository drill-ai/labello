function createOverlay({ logoUrl, onLabel, onExport, onMove, onToggle, onClose }) {
  const DRAG_THRESHOLD = 4; // px of movement before a press counts as a drag, not a click

  const el = document.createElement('div');
  el.id = 'labello-overlay';
  el.innerHTML = `
    <div class="labello-header">
      <img class="labello-logo" alt="Labello" draggable="false" />
      <span class="labello-name">Labello</span>
      <span class="labello-caret">▾</span>
      <button class="labello-close" title="Close (reopen from the toolbar)">✕</button>
    </div>
    <div class="labello-body">
      <div class="labello-title"></div>
      <div class="labello-buttons">
        <button class="labello-bad">BAD</button>
        <button class="labello-good">GOOD</button>
      </div>
      <div class="labello-footer">
        <span class="labello-count">0 labeled</span>
        <button class="labello-export">Export CSV</button>
      </div>
    </div>
  `;

  el.querySelector('.labello-logo').src = logoUrl;

  const header = el.querySelector('.labello-header');
  const caretEl = el.querySelector('.labello-caret');
  const titleEl = el.querySelector('.labello-title');
  const badBtn = el.querySelector('.labello-bad');
  const goodBtn = el.querySelector('.labello-good');
  const countEl = el.querySelector('.labello-count');

  badBtn.addEventListener('click', () => onLabel(0));
  goodBtn.addEventListener('click', () => onLabel(1));
  el.querySelector('.labello-export').addEventListener('click', () => onExport());
  el.querySelector('.labello-close').addEventListener('click', () => onClose && onClose());

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function applyPosition(x, y) {
    el.style.left = clamp(x, 0, window.innerWidth - el.offsetWidth) + 'px';
    el.style.top = clamp(y, 0, window.innerHeight - el.offsetHeight) + 'px';
    el.style.right = 'auto';
  }

  function isCollapsed() {
    return el.classList.contains('labello-collapsed');
  }

  function setCollapsed(collapsed) {
    el.classList.toggle('labello-collapsed', collapsed);
    caretEl.textContent = collapsed ? '▸' : '▾';
  }

  // Public: place the panel at a stored position (top-left, viewport coords).
  function setPosition({ x, y }) {
    applyPosition(x, y);
  }

  // Public: hide/show the whole overlay (close button hides; toolbar reopens).
  function setVisible(visible) {
    el.style.display = visible ? '' : 'none';
  }

  // --- Drag-to-move, with a quick-click falling through to collapse/expand ---
  let pointerId = null;
  let startX = 0;
  let startY = 0;
  let originLeft = 0;
  let originTop = 0;
  let moved = false;

  header.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    if (e.target.closest('.labello-close')) return; // let the close button handle its own click
    pointerId = e.pointerId;
    const rect = el.getBoundingClientRect();
    originLeft = rect.left;
    originTop = rect.top;
    startX = e.clientX;
    startY = e.clientY;
    moved = false;
    header.setPointerCapture(pointerId);
    el.classList.add('labello-dragging');
    e.preventDefault();
  });

  header.addEventListener('pointermove', (e) => {
    if (pointerId === null) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (!moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
    moved = true;
    applyPosition(originLeft + dx, originTop + dy);
  });

  header.addEventListener('pointerup', () => {
    if (pointerId === null) return;
    header.releasePointerCapture(pointerId);
    pointerId = null;
    el.classList.remove('labello-dragging');
    if (moved) {
      const rect = el.getBoundingClientRect();
      if (onMove) onMove({ x: rect.left, y: rect.top });
    } else {
      const next = !isCollapsed();
      setCollapsed(next);
      if (onToggle) onToggle(next);
    }
  });

  function render({ title, label, count }) {
    titleEl.textContent = title || '(no track)';
    badBtn.classList.toggle('labello-active', label === 0);
    goodBtn.classList.toggle('labello-active', label === 1);
    countEl.textContent = `${count} labeled`;
  }

  return { el, render, setPosition, setCollapsed, setVisible };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { createOverlay };
}
