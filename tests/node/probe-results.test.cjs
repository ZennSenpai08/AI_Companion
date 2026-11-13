const { test } = require('node:test');
const assert = require('node:assert/strict');
const { assessVisibleProbe } = require('../../scripts/native-probe-results.cjs');

// Evidence fixtures test report classification only, never actual window initialization.
const started = [
  { event: 'app-ready' },
  { event: 'renderer-ready', nodeExposed: false,
    security: { sandboxed: true, contextIsolated: true } },
  { event: 'window-visible', visible: true },
];
test('interruption preserves verified startup and leaves graceful shutdown inconclusive', () => {
  const result = assessVisibleProbe({ stages: started, exitCode: null,
    signal: 'SIGTERM', interrupted: true });
  assert.equal(result.startup, 'PASS');
  assert.equal(result.gracefulShutdown, 'INCONCLUSIVE');
  assert.equal(result.status, 'STARTUP_PASSED_SHUTDOWN_INCONCLUSIVE');
});
test('exit zero alone cannot prove graceful window closure', () => {
  const incomplete = assessVisibleProbe({ stages: started, exitCode: 0, signal: null, interrupted: false });
  assert.equal(incomplete.gracefulShutdown, 'INCONCLUSIVE');
  const complete = assessVisibleProbe({ stages: [...started, { event: 'window-closed' },
    { event: 'quit', exitCode: 0 }], exitCode: 0, signal: null, interrupted: false });
  assert.equal(complete.gracefulShutdown, 'PASS');
  assert.equal(complete.status, 'AUTOMATED_CHECKS_PASSED');
});
test('a visible renderer with Node exposure never passes security/startup', () => {
  const stages = started.map(stage => stage.event === 'renderer-ready' ?
    { ...stage, nodeExposed: true } : stage);
  const result = assessVisibleProbe({ stages, exitCode: 0, signal: null, interrupted: false });
  assert.equal(result.rendererSecure, false);
  assert.equal(result.startup, 'FAIL');
});
test('interrupting before any renderer evidence leaves startup unverified', () => {
  const result = assessVisibleProbe({ stages: [], exitCode: null, signal: 'SIGTERM', interrupted: true });
  assert.equal(result.startup, 'INCONCLUSIVE');
  assert.equal(result.rendererInitialized, false);
});
test('missing visibility does not erase initialized secure renderer evidence', () => {
  const stages = started.filter(stage => stage.event !== 'window-visible');
  const result = assessVisibleProbe({ stages, exitCode: null, signal: 'SIGTERM', interrupted: true });
  assert.equal(result.startup, 'PASS');
  assert.equal(result.visible, false);
  assert.equal(result.status, 'STARTUP_PASSED_VISIBILITY_UNVERIFIED_SHUTDOWN_INCONCLUSIVE');
});
