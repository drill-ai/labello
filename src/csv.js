function csvEscape(field) {
  const s = String(field);
  if (/[",\n]/.test(s)) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function buildCsv(entries) {
  const rows = [['video_id', 'url', 'title', 'label']];
  for (const [id, e] of Object.entries(entries)) {
    rows.push([id, e.url, e.title, String(e.label)]);
  }
  return rows.map((r) => r.map(csvEscape).join(',')).join('\n') + '\n';
}

function exportFilename(date) {
  const d = date || new Date();
  const p = (n) => String(n).padStart(2, '0');
  return (
    `labello-${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}` +
    `-${p(d.getHours())}${p(d.getMinutes())}.csv`
  );
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { csvEscape, buildCsv, exportFilename };
}
