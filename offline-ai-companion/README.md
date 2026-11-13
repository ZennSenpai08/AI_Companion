# Mika — offline Windows desktop companion

**Status: development preview; not a finished speaking Live2D product.**
Fresh original source; no personal repositories or third-party application source reused.
See [development report](docs/DEVELOPMENT_REPORT.md), [progress](DEVELOPMENT_PROGRESS.md),
[test evidence](TEST_RESULTS.md) and [known issues](KNOWN_ISSUES.md).

The source contains a secure Electron shell, Vue/TypeScript panels, supervised FastAPI
bootstrap, local Ollama text adapter, original protected Mika profile, and SQLite
conversation/explicit-memory services. Native desktop, Vue build and real FastAPI/model
acceptance are blocked in the current managed environment. STT/TTS/Live2D are not enabled.

## Setup on Windows

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

```powershell
./.venv/Scripts/python.exe -m unittest discover -s backend/tests -v
node --test tests/node/*.test.cjs
node node_modules/typescript/bin/tsc -p tsconfig.electron.json --pretty false
node node_modules/eslint/bin/eslint.js electron scripts tests/node
./.venv/Scripts/python.exe scripts/offline_smoke.py
```

The existing `node_modules` is a partial developer-only extraction from public dependency
caches, not a resolved install. It is ignored by Git. Vue/FastAPI/Ruff are missing; no full
lockfile or reproducible release build has been produced. Core tests are not desktop or
real-model acceptance tests.

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
