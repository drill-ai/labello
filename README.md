# Labello

A Chrome extension for labeling YouTube tracks good (1) or bad (0). It overlays a
small panel on YouTube watch pages, persists each label locally, and exports the
collected labels as CSV for a downstream tool to fetch the audio.

## Install

1. Open `chrome://extensions`.
2. Enable Developer mode (top right).
3. Click "Load unpacked" and select this `labello/` folder.

After changing any file, click the reload icon on the Labello card.

## Use

On a `youtube.com/watch?v=...` page a panel appears in the top-right corner.

- Click BAD or GOOD to label the current track. Keyboard: `b` = bad, `g` = good
  (ignored while typing in a text field).
- The active label is highlighted. Labeling again overwrites it.
- Drag the header to move the panel. Click the header to collapse/expand it.
  Position and collapsed state are remembered across reloads.
- Click the X to close the panel; click the toolbar icon to toggle it back.
- Click Export CSV to download a cumulative `labello-YYYY-MM-DD-HHMM.csv`.
  Storage is not cleared on export, so the newest file is the full dataset.

## CSV format

```
video_id,url,title,label
dQw4w9WgXcQ,https://www.youtube.com/watch?v=dQw4w9WgXcQ,Some Track,1
```

One row per labeled video. Titles are quote-escaped per RFC 4180.

## Layout

```
manifest.json        MV3 manifest (storage permission only)
logo.svg             panel logo
icons/               toolbar icons (16/48/128 px)
overlay.css          panel styling
src/parse.js         video id + title parsing
src/csv.js           CSV building
src/storage.js       chrome.storage.local wrappers
src/overlay.js       overlay view (buttons, drag, collapse, close)
src/content.js       page glue (labeling, keyboard, export, navigation)
src/background.js    toolbar click -> toggle overlay
test/                unit tests + overlay harness
```

## Tests

```
node --test 'test/*.test.js'
```

Covers the pure logic (parsing, CSV, storage wrappers). The overlay can be eyeballed
by opening `test/overlay-harness.html` in a browser.
