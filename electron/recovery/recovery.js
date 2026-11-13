/* global window, document */
const byId = id => document.getElementById(id);
if (window.location.hash === '#overlay') {
  document.documentElement.classList.add('overlay');
  byId('panel').hidden = true; byId('avatar').hidden = false;
}
let snapshot;
async function refresh() {
  try {
    snapshot = await window.mika.status();
    byId('status').textContent = `Backend: ${snapshot.backend.status} · Microphone: off`;
    byId('error').textContent = snapshot.backend.error || '';
  } catch { byId('error').textContent = 'Desktop bridge unavailable. Restart Mika.'; }
}
function handle(id, action) {
  byId(id).addEventListener('click', async () => {
    const button = byId(id); button.disabled = true;
    try { await action(); await refresh(); }
    catch { byId('error').textContent = 'The action failed. Use the tray menu to recover.'; }
    finally { button.disabled = false; }
  });
}
handle('retry', () => window.mika.retryBackend());
handle('diagnostics', async () => {
  byId('details').textContent = JSON.stringify(await window.mika.diagnostics(), null, 2);
  byId('details').hidden = false;
});
handle('reset', () => window.mika.desktop('reset'));
handle('topmost', () => window.mika.desktop('topmost', !snapshot.desktop.topmost));
handle('click', () => window.mika.desktop('clickThrough', !snapshot.desktop.clickThrough));
handle('settings', () => window.mika.desktop('settings'));
handle('hide', () => window.mika.desktop('hide'));
handle('quit', () => window.mika.desktop('quit'));
void refresh();
