const { test } = require('node:test');
const assert = require('node:assert/strict');
const { assessDesktopReport } = require('../../scripts/desktop-acceptance.cjs');
function evidence() {
  const frame = { nodeExposed: false, bridgePresent: true, vueMounted: true };
  const win = { visible: true, sandbox: true, contextIsolation: true,
    nodeIntegration: false, rendererSandboxed: true };
  return { build: 'vue', windows: 2, renderer: frame, panelRenderer: frame,
    presentationHost: { mounted: true, bridge: true },
    bubbleLayout: { passed: true },
    nativeWindows: { overlay: win, panel: win }, backend: { status: 'ready' },
    health: { service: 'mika-assistant', status: 'ok', offline: true, microphone: 'off' },
    ipc: { backendReachable: true, topmostToggled: true, clickThroughRecovered: true,
      invalidActionRejected: true, secretExposed: false } };
}
// Report-validation fixtures are not native UI/backend acceptance evidence.
test('actual-app acceptance requires Vue mounts and rejects a recovery page', () => {
  assert.ok(Object.values(assessDesktopReport(evidence())).every(Boolean));
  const recovery = evidence(); recovery.build = 'recovery'; recovery.panelRenderer.vueMounted = false;
  const checks = assessDesktopReport(recovery);
  assert.equal(checks.builtVue, false); assert.equal(checks.panelVueAndPreload, false);
});
test('visible secure frames cannot substitute for actual backend IPC/health', () => {
  const broken = evidence(); broken.backend.status = 'error'; broken.ipc.backendReachable = false;
  const checks = assessDesktopReport(broken);
  assert.equal(checks.backendHealthy, false); assert.equal(checks.rendererBackendIPC, false);
  assert.equal(checks.panelVisibleAndSecure, true);
});
test('missing evidence and unsafe renderer preferences never pass desktop acceptance', () => {
  assert.ok(Object.values(assessDesktopReport(null)).every(value => value === false));
  const unsafe = evidence(); unsafe.nativeWindows.panel.nodeIntegration = true;
  assert.equal(assessDesktopReport(unsafe).panelVisibleAndSecure, false);
  const missingHost = evidence(); missingHost.presentationHost.mounted = false;
  assert.equal(assessDesktopReport(missingHost).responsePresentationHost, false);
});
