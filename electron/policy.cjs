const { pathToFileURL, fileURLToPath } = require('node:url');
const path = require('node:path');
/** @param {string} candidate @param {string[]} files @param {boolean} dev */
function trustedDocument(candidate, files, dev = false) {
  try {
    const url = new URL(candidate);
    if (dev && url.origin === 'http://127.0.0.1:5173' &&
        ['/', '/index.html', '/overlay.html'].includes(url.pathname)) return true;
    if (url.protocol !== 'file:') return false;
    url.hash = ''; url.search = '';
    return files.some(file => url.href === pathToFileURL(file).href);
  } catch { return false; }
}
/** @param {string} url @param {boolean} dev @param {string[]} roots */
function allowedResource(url, dev = false, roots = []) {
  try {
    const value = new URL(url);
    if (value.protocol === 'file:') {
      const filename = fileURLToPath(value);
      return roots.some(root => {
        const relative = path.relative(root, filename);
        return relative !== '' && !relative.startsWith('..') && !path.isAbsolute(relative);
      });
    }
    return value.protocol === 'data:' ||
      (dev && ['http://127.0.0.1:5173', 'ws://127.0.0.1:5173'].includes(value.origin));
  } catch { return false; }
}
module.exports = { trustedDocument, allowedResource };
