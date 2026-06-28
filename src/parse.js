function getVideoId(href) {
  try {
    return new URL(href).searchParams.get('v');
  } catch (e) {
    return null;
  }
}

function cleanTitle(docTitle) {
  return String(docTitle)
    .replace(/^\(\d+\)\s*/, '')
    .replace(/\s*-\s*YouTube\s*$/, '')
    .trim();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { getVideoId, cleanTitle };
}
