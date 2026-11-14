const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { resolveElectronRuntime, platformExecutable, describeLaunchError } = require('../../scripts/electron-runtime.cjs');

// Synthetic files exercise discovery, not native runtime or window acceptance.
function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'mika-runtime-'));
  const pkg = path.join(root, 'node_modules/electron');
  fs.mkdirSync(path.join(pkg, 'dist'), { recursive: true });
  fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify({ devDependencies: { electron: '45.3.0' } }));
  fs.writeFileSync(path.join(pkg, 'package.json'), JSON.stringify({ name: 'electron', version: '45.3.0' }));
  fs.writeFileSync(path.join(pkg, 'install.js'), "throw new Error('Discovery must not run the installer')");
  t.after(() => {
    const resolved = path.resolve(root);
    assert.equal(path.dirname(resolved), path.resolve(os.tmpdir()));
    assert.ok(path.basename(resolved).startsWith('mika-runtime-'));
    fs.rmSync(resolved, { recursive: true });
  });
  function binary(relative, directory = path.join(pkg, 'dist')) {
    fs.mkdirSync(path.dirname(path.join(directory, relative)), { recursive: true });
    fs.writeFileSync(path.join(directory, relative), 'fixture only');
    fs.writeFileSync(path.join(directory, 'version'), '45.3.0');
  }
  return { root, pkg, binary };
}

test('missing binary reports explicit pinned recovery without auto-installing', t => {
  const { root, pkg } = fixture(t);
  assert.throws(() => resolveElectronRuntime(root, { platform: 'win32', env: {} }),
    error => error.code === 'ELECTRON_BINARY_MISSING' && /npm run electron:install/.test(error.message));
  assert.equal(fs.existsSync(path.join(pkg, 'path.txt')), false);
});
test('Windows path marker and verified version resolve the installed binary', t => {
  const { root, pkg, binary } = fixture(t); binary('electron.exe');
  fs.writeFileSync(path.join(pkg, 'path.txt'), 'electron.exe\r\n');
  const result = resolveElectronRuntime(root, { platform: 'win32', env: {} });
  assert.equal(result.executable, path.join(pkg, 'dist/electron.exe'));
  assert.equal(result.version, '45.3.0'); assert.equal(result.pathMarkerPresent, true);
});
test('platform mappings support Linux and macOS without Windows hardcoding', t => {
  const { root, binary } = fixture(t);
  for (const platform of ['linux', 'darwin']) {
    const relative = platformExecutable(platform); binary(relative);
    assert.ok(resolveElectronRuntime(root, { platform, env: {} }).executable.endsWith(path.normalize(relative)));
  }
  assert.throws(() => platformExecutable('unknown'), { code: 'UNSUPPORTED_PLATFORM' });
});
test('explicit alternate dist is respected and the environment is preserved', t => {
  const { root, binary } = fixture(t);
  binary('electron.exe', path.join(root, 'alternate'));
  const env = { ELECTRON_OVERRIDE_DIST_PATH: 'alternate', MIKA_PYTHON: 'keep-me' };
  const before = { ...env };
  const result = resolveElectronRuntime(root, { platform: 'win32', env });
  assert.equal(result.executable, path.join(root, 'alternate/electron.exe'));
  assert.equal(result.source, 'ELECTRON_OVERRIDE_DIST_PATH'); assert.deepEqual(env, before);
  env.ELECTRON_OVERRIDE_DIST_PATH = 'absent';
  assert.throws(() => resolveElectronRuntime(root, { platform: 'win32', env }), { code: 'ELECTRON_BINARY_MISSING' });
});
test('stale platform or escaping path markers cannot select unrelated executables', t => {
  const { root, pkg, binary } = fixture(t); binary('electron.exe');
  for (const marker of ['electron', '../../other.exe']) {
    fs.writeFileSync(path.join(pkg, 'path.txt'), marker);
    assert.throws(() => resolveElectronRuntime(root, { platform: 'win32', env: {} }), { code: 'ELECTRON_PLATFORM_MISMATCH' });
  }
});
test('stale runtime and package versions are rejected instead of silently launched', t => {
  const { root, pkg, binary } = fixture(t); binary('electron.exe');
  fs.writeFileSync(path.join(pkg, 'dist/version'), '44.0.0');
  assert.throws(() => resolveElectronRuntime(root, { platform: 'win32', env: {} }), { code: 'ELECTRON_RUNTIME_VERSION' });
  fs.writeFileSync(path.join(pkg, 'package.json'), JSON.stringify({ name: 'electron', version: '44.0.0' }));
  assert.throws(() => resolveElectronRuntime(root, { platform: 'win32', env: {} }), { code: 'ELECTRON_PACKAGE_VERSION' });
});
test('native access failures stay distinct from missing-runtime recovery', () => {
  const denied = describeLaunchError(Object.assign(new Error('denied'), { code: 'EACCES' }), 'runtime');
  assert.match(denied, /native spawn failed \(EACCES\)/);
  assert.match(denied, /not proof that the binary is missing/);
  assert.match(describeLaunchError(Object.assign(new Error(), { code: 'ENOENT' }), 'runtime'), /electron:install/);
});
test('development preflight fails before Vite starts when the runtime is missing', t => {
  const { root } = fixture(t);
  const scripts = path.join(root, 'scripts'); fs.mkdirSync(scripts);
  for (const name of ['dev.cjs', 'electron-runtime.cjs'])
    fs.copyFileSync(path.join(__dirname, '../../scripts', name), path.join(scripts, name));
  const vite = path.join(root, 'node_modules/vite/bin'); fs.mkdirSync(vite, { recursive: true });
  fs.writeFileSync(path.join(vite, 'vite.js'), "require('node:fs').writeFileSync('unexpected-vite-start', 'started')");
  const result = spawnSync(process.execPath, [path.join(scripts, 'dev.cjs')],
    { cwd: root, encoding: 'utf8', timeout: 5000, env: { ...process.env, ELECTRON_OVERRIDE_DIST_PATH: '' } });
  assert.equal(result.status, 1); assert.match(result.stderr, /ELECTRON_BINARY_MISSING/);
  assert.equal(fs.existsSync(path.join(root, 'unexpected-vite-start')), false);
});
