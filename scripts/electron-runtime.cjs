const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const recovery = 'Run npm run electron:install in ordinary PowerShell to install only the pinned Electron binary. Do not reinstall all dependencies or change ACLs.';
/** @param {string} code @param {string} message */
function failure(code, message) { return Object.assign(new Error(`${code}: ${message}`), { code }); }

/** @param {string} platform */
function platformExecutable(platform) {
  switch (platform) {
    case 'win32': return 'electron.exe';
    case 'darwin': case 'mas': return 'Electron.app/Contents/MacOS/Electron';
    case 'linux': case 'freebsd': case 'openbsd': return 'electron';
    default: throw failure('UNSUPPORTED_PLATFORM', `No Electron executable mapping for ${platform}.`);
  }
}

/** Read metadata only: requiring electron/index.js can silently download a binary.
 * @param {string} root
 */
function electronPackage(root) {
  let filename;
  try { filename = require.resolve('electron/package.json', { paths: [root] }); }
  catch { throw failure('ELECTRON_PACKAGE_MISSING', 'Electron npm package is missing. Restore dependencies using npm ci and the existing lockfile.'); }
  const metadata = JSON.parse(fs.readFileSync(filename, 'utf8'));
  const configured = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  const pinned = configured.devDependencies?.electron;
  if (metadata.name !== 'electron' || typeof pinned !== 'string' || metadata.version !== pinned)
    throw failure('ELECTRON_PACKAGE_VERSION', 'Installed Electron package does not match the project pin. Restore the locked dependencies using npm ci.');
  return { directory: path.dirname(filename), version: /** @type {string} */ (metadata.version) };
}

/** Resolve the local runtime without downloading, launching, or changing any environment.
 * @param {string} root
 * @param {{platform?:string,env?:NodeJS.ProcessEnv}} [options]
 */
function resolveElectronRuntime(root, { platform = process.platform, env = process.env } = {}) {
  const pkg = electronPackage(root);
  const relative = platformExecutable(platform);
  const marker = path.join(pkg.directory, 'path.txt');
  const recorded = fs.existsSync(marker) ? fs.readFileSync(marker, 'utf8').trim() : null;
  if (recorded && recorded !== relative)
    throw failure('ELECTRON_PLATFORM_MISMATCH', `path.txt records ${JSON.stringify(recorded)}, expected ${relative}. ${recovery}`);
  const directory = env.ELECTRON_OVERRIDE_DIST_PATH ? path.resolve(root, env.ELECTRON_OVERRIDE_DIST_PATH) : path.join(pkg.directory, 'dist');
  const executable = path.join(directory, relative);
  if (!fs.existsSync(executable) || !fs.statSync(executable).isFile())
    throw failure('ELECTRON_BINARY_MISSING', `Electron ${pkg.version} executable not found at ${executable}. Electron 42+ does not download its binary during npm install. ${recovery}`);
  const versionFile = path.join(directory, 'version');
  const version = fs.existsSync(versionFile) ? fs.readFileSync(versionFile, 'utf8').trim().replace(/^v/, '') : null;
  if (version !== pkg.version)
    throw failure('ELECTRON_RUNTIME_VERSION', `Runtime version ${version ?? '(missing version file)'} does not match ${pkg.version}. ${recovery}`);
  return { executable, version, packageDirectory: pkg.directory,
    source: env.ELECTRON_OVERRIDE_DIST_PATH ? 'ELECTRON_OVERRIDE_DIST_PATH' : 'package-dist', pathMarkerPresent: recorded !== null };
}

/** @param {unknown} error @param {string} executable */
function describeLaunchError(error, executable) {
  const code = error instanceof Error && 'code' in error ? String(error.code) : 'UNKNOWN';
  return `Electron native spawn failed (${code}) at ${executable}. ` +
    (code === 'ENOENT' ? recovery : 'The runtime was resolved; this is a native execution error, not proof that the binary is missing. Preserve the sandbox and inspect the launch logs.');
}

if (require.main === module) {
  const root = path.resolve(__dirname, '..');
  try {
    if (process.argv.includes('--install')) {
      const pkg = electronPackage(root);
      // Explicit setup only. Official pinned installer retains its checksum, cache,
      // architecture/proxy configuration and all inherited environment variables.
      const result = spawnSync(process.execPath, [path.join(pkg.directory, 'install.js')],
        { cwd: root, stdio: 'inherit', env: process.env, windowsHide: true, shell: false });
      if (result.error) throw result.error;
      if (result.status !== 0) throw new Error(`Pinned Electron installer exited ${result.status ?? result.signal}. Run this command in ordinary PowerShell if downloads are restricted here.`);
    }
    console.log(JSON.stringify(resolveElectronRuntime(root), null, 2));
  } catch (error) { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; }
}

module.exports = { resolveElectronRuntime, platformExecutable, describeLaunchError };
