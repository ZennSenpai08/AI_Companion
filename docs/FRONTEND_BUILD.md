# Current bubble continuation — 2026-11-14

The new overlay response bubble/input-hint UI passes vue-tsc, Electron/core TypeScript and
JavaScript lint. Actual production assets build with:

```powershell
node node_modules/vite/bin/vite.js build --configLoader native
```

The default npm run build still hits the documented agent esbuild parent-directory read
restriction; no packages/security settings were changed. Native smoke still fails before
app-ready in the restricted agent. Normal-Windows startup PASS remains historical; run
the actual new build there to verify caption layout and physical input. No rendered
screenshot of this new UI was fabricated. See BILINGUAL_ENGLISH_RESPONSES.md.

# Preparing and verifying the real Mika Vue application

2026-11-14 update: current Vue selectors use installed compatible models; Settings includes
confirmed model unload. Types/lint pass. Production build compiled 22 modules using
`node node_modules/vite/bin/vite.js build --configLoader native` on Node 22.18.0.
The config now uses fileURLToPath(import.meta.url) instead of CommonJS __dirname.
The ordinary npm build still hits esbuild parent-directory access denial in this agent;
no ACL/permissions changed. Vite documents [native config loading](https://vite.dev/config/).
This compilation is not a visible Electron UI pass. Rebuild and test in normal PowerShell
as described in MODEL_SWITCHING_AND_MEMORY.md; no dependency upgrade/reinstall needed.

Current chat repair requires rebuilding dist for the new Vue initialization markers.
Use LOCAL_REQUEST_CHAT_REPAIR.md for normal-Windows commands; normal dev and smoke now
share prepared Python selection. Do not reinstall dependencies or model weights.

For the current interactive desktop lifecycle/control audit and code-0 interpretation,
see [desktop verification](DESKTOP_FOUNDATION_VERIFICATION.md). Normal-Windows automated
Mika acceptance passes; manual dwell/controls/restart placement are tracked separately.
Dev/smoke logs now identify Quit versus single-instance forwarding versus smoke mode.

Manager: npm (existing setup/dev commands). Observed Node 22.18.0 / npm 11.10.0.
Other package managers installed on the host do not change this project's choice.
The ordinary-PowerShell installation now supplies package-lock.json (lockfileVersion 3)
and the pinned Vue toolchain. Preserve that lockfile; clean installations use npm ci.

Keep the existing exact pins: Vue 3.5.45, Vite 7.3.1, plugin-vue 6.0.1, vue-tsc 3.0.6,
TypeScript 5.9.3 and Electron 45.3.0. Do not replace these with latest to avoid an error.

## Electron 45 native runtime recovery

Electron 42+ no longer downloads a native binary in npm postinstall. The installed 45.3.0
package has no postinstall entry and the lockfile has no install-script flag. Its official
index.js downloads lazily when imported; Mika's direct spawn bypassed that step. Thus npm
install can succeed while a native launcher still cannot find electron.exe. This is not
evidence of a sandbox failure. Sources: [Electron 42 announcement](https://www.electronjs.org/blog/electron-42-0)
and [official installation guide](https://www.electronjs.org/docs/latest/tutorial/installation).

Install only the existing pinned runtime, without changing dependencies, flags or ACLs:

```powershell
cd C:\Users\Romcill\Desktop\AI-PROJECT
npm run electron:install
if ($LASTEXITCODE -ne 0) { throw 'Electron binary preparation failed' }
npm run electron:check
```

The first command invokes this package's official install.js (equivalent to the documented
install-electron bin), retaining its checksum verification, version, cache and inherited
download settings. It may need GitHub access in ordinary PowerShell. It is explicit setup,
not an automatic runtime network fallback. No dependency-wide reinstall is necessary.
The executable and version file were already present when this task inspected them; both
commands actually succeeded here without a new download. Why they appeared after the
reported failed launches is not established from the supplied command history.

Both dev and desktop-smoke now resolve the installed package, host-platform path marker,
native file and matching version without importing its download-on-require entry point.
ELECTRON_OVERRIDE_DIST_PATH is respected and checked; no machine path is hardcoded.
Missing binary, stale version/platform and native spawn errors have distinct messages.
Dev performs this preflight before starting Vite; a failed Vite process reports a frontend
error and a nonzero exit. Existing renderer security and environment settings are retained.

## Actual verification evidence — 2026-11-14

The saved real Mika run at test-artifacts/electron-startup/
mika-2026-11-13T22-41-50-736Z-5c0ba0c6/ contains desktop-smoke.json, launch.json and a nonempty
desktop-preview.png. Inspection confirms two mounted Vue windows, visible secure renderers,
readonly preload/IPC, backend health, topmost/click-through recovery and rejection of an
unapproved action. Exit 0, backendProcessGone=true and backendListenerClosed=true establish
that run's graceful automated shutdown. The screenshot shows Mika's Vue settings panel;
it is not a diagnostic page. Manual observation of the user's desktop was not performed.

Current source type checks and JS lint pass in the agent. Its standard build/dev commands
are separately blocked by esbuild's denied parent-directory read. The user's ordinary-
PowerShell production build passed (22 transformed modules) and existing dist is present.
The agent desktop attempt resolves Electron but fails before the main process at the
runtime ACL check (2147483651); no ACL changes or sandbox bypass were attempted. This does
not invalidate the saved successful application run or the user's normal-session probe.
Run updated npm run test:desktop and npm run dev in ordinary PowerShell to confirm the
new launcher paths. Use Quit Mika for a normal manual dev shutdown.

## Earlier installation blocker (historical)

The project-local .cache/npm directory passes a real temporary write test. Registry DNS
resolution succeeds, but TCP connection to registry.npmjs.org:443 is denied with Windows
socket error 10013 in the coding-agent context. npm reports FetchError/EACCES. This is
not evidence that a project-cache ACL grant is needed. No permission/security changes.

An actual npm install --package-lock-only --ignore-scripts with retries disabled also
failed on registry access, creating no lockfile and changing no installed packages.
Raw commands/output: test-artifacts/electron-startup/dependency-install-diagnosis.json.

## First dependency preparation (already performed by user)

The first command resolves the graph into a real lockfile without dependency lifecycle
scripts or module installation. The next installs that locked graph into the existing
project. Both use project-local cache; no global installation or administrator is needed.

```powershell
cd C:\Users\Romcill\Desktop\AI-PROJECT
npm install --package-lock-only --ignore-scripts --cache .cache/npm --no-audit --no-fund
if ($LASTEXITCODE -ne 0) { throw 'Lockfile preparation failed' }
npm install --cache .cache/npm --no-audit --no-fund
if ($LASTEXITCODE -ne 0) { throw 'Dependency installation failed' }
```

Preserve the generated package-lock.json. Future clean/reproducible environments should
use npm ci with that lockfile, not re-resolve dependencies or delete the lock. Installation
completion is not claimed until actual package files and npm's result have been checked.
Do not alter the working Electron flags or revisit the ACL repair during setup.

## Checks after preparation

These can be run by the agent once the files are available, without registry access:

```powershell
npm run typecheck
npm run lint:js
npm run build
```

Full Vue/SFC type checking is distinct from the already runnable Electron and standalone
renderer-core type checks. A production build must create both dist/index.html and
dist/overlay.html. No recovery page is accepted as a Vue build.

## Real application acceptance in ordinary Windows PowerShell

```powershell
npm run test:desktop
$env:MIKA_PYTHON = (Resolve-Path '.venv-runtime\Scripts\python.exe').Path
npm run dev
```

The existing dev launcher starts Vite and Mika's actual Electron entry; it uses visible
GUI startup and the same sandbox/context-isolation/no-Node settings. No standalone probe
substitutes for this step. .venv-runtime is the tested local Python 3.10 development runtime;
Python 3.12 release compatibility remains a separate open requirement.

The actual-app smoke test requires both built Vue pages, checks real Vue mount markers,
readonly preload security facts, IPC controls and authenticated backend health, captures
the real panel, requests app.quit(), and checks backend process/listener cleanup after
Electron exits. Test artifacts are under test-artifacts/electron-startup/mika-*/.
This automated actual-app test closes itself after checks; the separate visible diagnostic
remains manual. A test being implemented is not a claim that it has passed.

For a manual dev session, use Mika's Quit button or tray Quit to verify normal shutdown.
Closing a panel hides it to the tray by design. Ctrl+C/SIGTERM is an interruption and does
not prove the application's graceful-close path. No model, voice or microphone is needed
for the basic Vue/preload/backend acceptance test.
