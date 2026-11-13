# Preparing and verifying the real Mika Vue application

Manager: npm (existing setup/dev commands). Observed Node 22.18.0 / npm 11.10.0.
Other package managers installed on the host do not change this project's choice.
No package-lock.json, npm-shrinkwrap.json, pnpm-lock.yaml or yarn.lock currently exists.
vue-tsc 3.0.6 is declared in package.json but is not installed or represented in a lockfile.

Keep the existing exact pins: Vue 3.5.45, Vite 7.3.1, plugin-vue 6.0.1, vue-tsc 3.0.6,
TypeScript 5.9.3 and Electron 45.3.0. Do not replace these with latest to avoid an error.

## Installation availability

The project-local .cache/npm directory passes a real temporary write test. Registry DNS
resolution succeeds, but TCP connection to registry.npmjs.org:443 is denied with Windows
socket error 10013 in the coding-agent context. npm reports FetchError/EACCES. This is
not evidence that a project-cache ACL grant is needed. No permission/security changes.

An actual npm install --package-lock-only --ignore-scripts with retries disabled also
failed on registry access, creating no lockfile and changing no installed packages.
Raw commands/output: test-artifacts/electron-startup/dependency-install-diagnosis.json.

## First preparation in ordinary Windows PowerShell

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
