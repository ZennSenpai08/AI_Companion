# Mika — offline Windows desktop companion

**Status: development preview; not a finished speaking Live2D product.**
Fresh original source; no personal repositories or third-party application source reused.
See [development report](docs/DEVELOPMENT_REPORT.md), [progress](DEVELOPMENT_PROGRESS.md),
[test evidence](TEST_RESULTS.md) and [known issues](KNOWN_ISSUES.md).

The source contains a secure Electron shell, Vue/TypeScript panels, supervised FastAPI
bootstrap, local Ollama text adapter, original protected Mika profile, and SQLite
conversation/explicit-memory services. Real FastAPI and supervised-backend checks now pass on the recovered Python 3.10.11
runtime. Normal-session native startup, visibility and sandboxed rendering pass. The real
Mika Vue interface, graceful shutdown and real-model acceptance remain unverified.
STT/TTS/Live2D are not enabled.

## Setup on Windows

For this existing checkout's missing Vue dependencies, use the exact pinned-install and
actual-application verification commands in [frontend preparation](docs/FRONTEND_BUILD.md).

1. Use working Python 3.12 x64 and Node >=22.12.0. Check `scripts/doctor.ps1`.
2. In PowerShell from this directory, install development dependencies:

   ```powershell
   ./scripts/setup.ps1 -Python 'C:\Path\To\Python312\python.exe'
   ./scripts/test.ps1
   ./scripts/dev.ps1
   ```

   Setup does not install Ollama, voices, weights or Live2D assets. It needs package-registry
   access. The current sandbox denies that access; do not treat failed setup as success.
3. For a local production renderer build use `npm run build`, then `npm start`.
   If `dist` is absent, the native recovery panel offers diagnostics/window recovery only.
4. Install/configure Ollama separately with cloud disabled and a loopback binding. Prepare
   a permitted model only after checking RAM/disk. See [model setup](docs/MODEL_SETUP_GUIDE.md).
5. Runtime uses anonymous parent stdin for credentials, authenticated 127.0.0.1 HTTP, no
   hosted inference fallback and no automatic model downloads. External firewall-isolated
   speech acceptance is still pending.

## Checks available in this workspace

The user-run ordinary Windows PowerShell probe verifies Electron 45.3.0 and sandboxed
rendering. For a separate window you can actually inspect and close manually, run:

```powershell
cd C:\Users\Romcill\Desktop\AI-PROJECT
node scripts/run-visible-native-probe.cjs
```

It stays open until you close it and saves per-run visibility/security/exit logs. User
appearance is confirmed by the user; graceful shutdown and the built Vue/Mika interface
remain pending. This
diagnostic is separate from the original automated probe; ACLs need no further changes.

The active project now lives at the workspace root after user commit fa5871e. The
frontend remains Vue; it has not been migrated to React. See [identity audit](docs/PROJECT_IDENTITY.md).
Latest executed Node suite: 40 passes; the earlier Python suite has 50 passes and was not
rerun in this task. These do not establish actual Mika UI, model inference or spoken
conversation. [Native investigation](docs/ELECTRON_STARTUP_INVESTIGATION.md) separates the
successful normal-session startup from restricted-agent limitations and shutdown evidence.

To preserve current source without writing the restricted main .git:

```powershell
./.venv-runtime/Scripts/python.exe scripts/checkpoint.py
```

This creates a fresh ignored bare clone/ref/full-history bundle and adjacent verification
manifest; it retains previous archives and compares the original branch/index/status.
Recovery instructions: [checkpoint audit](docs/CHECKPOINT_AUDIT.md). Dependencies/models
are not bundled. Optional Windows voice discovery works, but actual synthesis is denied
here; [voice evaluation](docs/VOICE_EVALUATION.md) records the unsuccessful benchmark.

Run `./.venv/Scripts/python.exe scripts/verify_foundation.py` for the available foundation
suite. It saves each command, exit code and output under `test-artifacts/verification/`.
Use `.venv-runtime/Scripts/python.exe` for the recovered API environment. Full results
are recorded in TEST_RESULTS.md; the earlier Python 3.9 environment lacks FastAPI.
This does not verify a real model, built Vue UI, native desktop or spoken offline product.


```powershell
./.venv/Scripts/python.exe -m unittest discover -s backend/tests -v
node --test tests/node/*.test.cjs
node node_modules/typescript/bin/tsc -p tsconfig.electron.json --pretty false
npm run lint:js
npm run typecheck:core
./.venv/Scripts/python.exe scripts/offline_smoke.py
```

The existing `node_modules` is a partial developer-only extraction from public dependency
caches, not a resolved install. It is ignored by Git. Vue/Vite/vue-tsc/Ruff are missing. The separate .venv-runtime now has the tested API stack; no full
lockfile or reproducible release build has been produced. Core tests are not desktop or
real-model acceptance tests. The actual httpx socket adapter is tested against an explicit
local protocol fixture; no fixture text is presented as model inference.


## Recovered backend development runtime

A separate ignored `.venv-runtime` uses the newly discovered Python 3.10.11. It was installed
entirely from compatible cached wheels. The tested text stack is FastAPI 0.140.13,
Starlette 1.3.1, Uvicorn 0.52.0, Pydantic 2.12.5 and httpx 0.28.1. Direct pins are in
requirements.txt; the executed dependency set is in requirements-runtime-lock.txt.
Python 3.12 remains the release target and has not been tested here.

```powershell
./.venv-runtime/Scripts/python.exe scripts/verify_foundation.py
./scripts/test.ps1 -CoreOnly -Python './.venv-runtime/Scripts/python.exe'
```

The runner passes its selected Python to Node subprocess tests and records actual outputs.
To use this backend with the desktop development command once Vue dependencies are available:

```powershell
./scripts/dev.ps1 -Python './.venv-runtime/Scripts/python.exe'
```

Native Electron still exits at its sandbox ACL check. No sandbox bypass or system/profile
ACL edits are included. Core API tests can run without launching Electron or a model.

## Layout and privacy

`electron/` owns windows, tray, narrow IPC and supervised local backend. `frontend/` contains
Vue text, memory and settings panels. `backend/` contains FastAPI and testable local core.
`character/persona.yaml` is original JSON-compatible YAML, reloaded each LLM request.
`docs/` records sources, licenses, architecture and ordered gates. `scripts/` has setup,
doctor, testing and build commands.

Application data uses Electron's per-user `userData` directory. Conversations and approved
facts are readable SQLite (`assistant.sqlite`); `desktop.json` stores only geometry/topmost.
No raw microphone audio is captured. There is no encryption or desktop command execution.
Memory controls support explicit facts, correction, deletion and JSON export; UI runtime
verification remains pending. Prompt memory is lexical, bounded, and never model training.

Current shortcuts/tray controls in source: Show/Hide, Always on Top, Click Through,
Reset Position, Settings and Quit. Ctrl+Shift+M restores the overlay and disables click
through when registration succeeds. Mic/PTT entries stay disabled until speech exists.

No installer is available. `scripts/build.ps1` refuses packaging without a packaged Python
backend. Model/voice/Live2D redistribution and full offline QA must be resolved before release.
