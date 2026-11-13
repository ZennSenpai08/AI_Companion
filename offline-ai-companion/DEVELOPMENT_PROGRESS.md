# Development progress — 2026-11-13

## Current status

- **Phase 0: IN PROGRESS.** Hardware/source research reports and concrete roadmap exist.
  Final runtime versions, voice benchmark, exact checkpoint terms and Live2D/Core fit
  remain unresolved. No weights or character packages downloaded.
- **Phase 1: BLOCKED at runtime acceptance.** Foundation source and tests implemented.
  Registry/network restrictions prevent FastAPI/Vue installation. Electron sandbox exits
  before application code. No successful desktop/real-backend launch claimed.
- **Phase 2: IN PROGRESS (independent code only).** Native overlay/tray/bounds/recovery
  controls written; pure bounds tests pass. Visual and real multi-monitor checks unrun.
- **Phase 3: BLOCKED.** Compatible licensed SDK/Core/model not provisioned; no Live2D render.
- **Phases 4, 5, 9: IN PROGRESS (independent core only).** Local Ollama adapter, persona
  assembly, streamed text orchestration and approved SQLite memory implemented. Unit/
  fixture tests pass; real LLM, API and UI acceptance unverified.
- **Phases 6–8, 10–18: NOT STARTED**, except evaluation/release planning and foundation
  cancellation tests. No microphone, STT, TTS, audio playback, lip sync, emotional LLM
  schema, optional integrations, complete settings, optimization or installer exists.

Ordered acceptance gates have not been bypassed. Independent components were developed
while early environment blockers persisted, as authorized. No product phase marked complete.

## Files created

- Original root requirements/policy/progress/changelog/license/readme and reporting files.
- `docs/`: research, decisions, licenses, hardware, roadmap, architecture, offline plan,
  voice evaluation plan, model setup, user manual and development report.
- `electron/`: main/preload, supervision, authenticated HTTP/NDJSON stream, resource policy,
  geometry recovery, original icon, diagnostic recovery HTML/CSS/JS.
- `frontend/`: Vite multi-window Vue/TypeScript chat/memory/settings/diagnostic overlay.
- `backend/`: authenticated FastAPI endpoints/bootstrap, parent watchdog, runtime policy,
  protected persona manager, Ollama adapter, conversation orchestration and SQLite memory.
- `character/persona.yaml`: original Mika identity/style/boundaries, JSON-compatible YAML.
- `scripts/`: setup/doctor/dev/test/build, desktop smoke, offline core smoke, release gate.
- `tests/`, `backend/tests/`: security, process lifecycle, HTTP streaming/cancellation,
  persistence, deletion, context bounds and persona placement. Fixtures are test-only.
- Package/type/lint configuration and model/Live2D provisioning guides. No third-party
  application source, downloaded models, recordings or character artwork included.

## Commands executed and actual outcomes

- `rg --files`, `Get-Content AGENTS.md`, `Get-ChildItem`: empty initial workspace except policy.
- CIM OS/CPU/GPU queries: denied. Node OS/registry/nvidia-smi fallback: report recorded.
- `python --version`, `node --version`, `npm --version`, `git --version`, `py -0p`:
  Python 3.9.13 works; advertised 3.13 fails; Node 22.18.0/npm 11.10.0/Git 2.50.1.
- `wsl --status`: denied. Ollama/FFmpeg absent on PATH; no usable WSL verified.
- `git init offline-ai-companion`: fresh repository created.
- `python -m venv offline-ai-companion/.venv`: created successfully.
- `npm ping`: EACCES; direct Python external URL requests: WinError 10013.
- `.venv/Scripts/python.exe -m pip install ...`: failed, no compatible available distributions
  due inaccessible registry. No package installation success claimed.
- Offline npm attempts: ENOTCACHED/EPERM writing global cache; no global changes made.
- Public npm-cache artifacts for TypeScript 5.9.3, Electron 45.3.0, Node typings 22.18.12
  and ESLint 9.34.0 were integrity-checked/extracted into ignored workspace directories.
  This is a partial local verification toolchain, not `npm install` or a full lockfile.
- `node --test tests/node/*.test.cjs`: latest run 15 passed, zero failed/skipped.
- `.venv/Scripts/python.exe scripts/offline_smoke.py`: latest run 14 passed, 5 skipped;
  Python-only process guard, no spoken/model/system-wide offline acceptance.
- Strict Electron TypeScript check and JavaScript ESLint: passed after fixes.
- Python compileall: passed. Ruff unavailable. Vue build fails at missing vue-tsc.
- `node scripts/desktop-smoke.cjs`: two attempts failed before app startup with Electron
  sandbox install-directory ACL error; no screenshot/success report produced.
- Scoped `icacls ...node_modules/electron/dist /grant *S-1-15-2-1:(OI)(CI)(RX) /Q`:
  succeeded within workspace. Runtime still reports sandbox ACL error. Sandbox retained.
- `node scripts/release-gate.cjs`: expected failure, packaged backend absent.

## Repairs and limitations

Fixed a failed-spawn shutdown hang, original TypeScript/lint findings, offline-script
module path, local resource path policy, SQLite connection cleanup, stream cancellation,
protected prompt bounds and backend retry. Tests verify the production parent watchdog
exits a fixture service after its supervising process is killed. This does not validate
FastAPI's full shutdown path while dependencies are missing.

## Next task

On a Windows session that permits installed sandboxed Electron and dependency access:
install working Python 3.12 and full pinned dependencies, resolve lockfiles, run Ruff,
Vue typecheck/build, real ASGI tests and desktop smoke. Repair any runtime integration
findings before advancing the Live2D gate. Then provision permitted local model/voice/
SDK assets after capacity and rights checks, and continue ordered speech/offline QA.

## Local checkpoint

Source checkpoint committed locally with documented runtime blockers. No remote configured
or publishing performed. Commit identity is Codex with a local invalid-domain email; no
personal Git identity or credentials needed. `git diff --cached --check` passed before
checkpoint. Downloaded caches, private data and test databases are ignored.
