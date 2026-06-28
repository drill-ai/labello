const { test } = require('node:test');
const assert = require('node:assert');
const { csvEscape, buildCsv, exportFilename } = require('../src/csv.js');

test('csvEscape leaves a plain field unchanged', () => {
  assert.strictEqual(csvEscape('hello'), 'hello');
});
test('csvEscape quotes a field containing a comma', () => {
  assert.strictEqual(csvEscape('a,b'), '"a,b"');
});
test('csvEscape quotes and doubles embedded quotes', () => {
  assert.strictEqual(csvEscape('she said "hi"'), '"she said ""hi"""');
});
test('csvEscape quotes a field containing a newline', () => {
  assert.strictEqual(csvEscape('line1\nline2'), '"line1\nline2"');
});
test('buildCsv produces a header and one row per entry', () => {
  const entries = { dQw4w9WgXcQ: { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', title: 'Some Track', label: 1 } };
  assert.strictEqual(buildCsv(entries), 'video_id,url,title,label\n' + 'dQw4w9WgXcQ,https://www.youtube.com/watch?v=dQw4w9WgXcQ,Some Track,1\n');
});
test('buildCsv escapes a title with a comma', () => {
  const entries = { abc: { url: 'https://www.youtube.com/watch?v=abc', title: 'Artist - Track, Pt. 2', label: 0 } };
  assert.strictEqual(buildCsv(entries), 'video_id,url,title,label\n' + 'abc,https://www.youtube.com/watch?v=abc,"Artist - Track, Pt. 2",0\n');
});
test('buildCsv with no entries returns just the header', () => {
  assert.strictEqual(buildCsv({}), 'video_id,url,title,label\n');
});
test('buildCsv emits one row per entry in insertion order', () => {
  const entries = {
    aaa: { url: 'https://www.youtube.com/watch?v=aaa', title: 'First', label: 1 },
    bbb: { url: 'https://www.youtube.com/watch?v=bbb', title: 'Second', label: 0 },
  };
  assert.strictEqual(
    buildCsv(entries),
    'video_id,url,title,label\n' +
      'aaa,https://www.youtube.com/watch?v=aaa,First,1\n' +
      'bbb,https://www.youtube.com/watch?v=bbb,Second,0\n'
  );
});
test('exportFilename formats the date as labello-YYYY-MM-DD-HHMM.csv', () => {
  const d = new Date(2026, 5, 28, 9, 5);
  assert.strictEqual(exportFilename(d), 'labello-2026-06-28-0905.csv');
});
