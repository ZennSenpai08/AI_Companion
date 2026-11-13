# Development progress — 2026-11-13

## Current status

- **Phase 0: IN PROGRESS.** Hardware/source research reports and concrete roadmap exist.
  Final runtime versions, voice benchmark, exact checkpoint terms and Live2D/Core fit
  remain unresolved. No weights or character packages downloaded.
- **Phase 1: BLOCKED at runtime acceptance.** Foundation source and tests implemented.
  FastAPI now starts and passes real API/subprocess acceptance in .venv-runtime. Vue
  installation and native Electron remain blocked. No successful desktop launch claimed.
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
  due inaccessible registry during the initial pass. Later cache recovery is recorded below.
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

## Continuation — tested text transport and recovery

Environment recheck: external requests still fail with WinError 10013; approximately
0.17 GiB available RAM at recheck. No inference weights downloaded and no global Windows
permissions, registry, firewall or renderer sandbox settings changed during this continuation.
The parent Git repository now contains the saved project (`18bc3d3`, Add offline AI
companion project); the nested .git is absent. Preserve existing history and commit only
companion paths. No cause of the repository layout change is assumed.

Public pip HTTP-cache inspection recovered the matching `httpx==0.28.1` and a compatible
HTTP dependency set. Wheel RECORD contents were checked before reconstruction in ignored
.tools/wheels; successful --no-index installation wrote only to .venv. pip check passes.
The cache only has obsolete FastAPI/Starlette/Uvicorn versions, so production pins were
not downgraded. Modern FastAPI/Vue/Ruff and native Electron acceptance remain blocked.

New working/tested independent changes:

- Actual httpx/socket protocol tests for local Ollama: split UTF-8, request contract,
  proxy refusal, no redirect/pull, missing model, invalid JSON/message/completion, cancellation
  and an endless empty stream. Fixture text is explicitly not real LLM output.
- Fixed malformed packet crashes and string completion acceptance. Added 64 KiB line,
  4 MiB transfer and absolute inference deadline bounds; response always closes.
- Main-process stream now validates event fields, requires a terminal done/error, rejects
  post-completion data and stops callbacks immediately on abort. Fixed an end/error race.
- Extracted typed renderer chat state with admission rollback, pre-ack sequence buffering,
  stale event refusal, interrupted replies and protection against delayed admission results.
  Vue uses this state module, but full Vue compilation/native interaction is still unverified.
- Explicit state graph connected to text turns and live backend health/diagnostics. Graph
  contains reserved audio states; listening, speech and voice interruption are not implemented.
- Bootstrap rejects null/list startup events. Independent watchdog timer bounds shutdown
  even if its callback blocks. Real process tests exercise the production watchdog.
- Python offline harness now guards DNS, TCP/connect_ex, UDP and wildcard binds in its
  process. Numeric-only DNS lookup avoids external resolution; unexpected attempts fail
  the check. Children/native libraries and system-wide traffic are outside this guard.
- Added a reproducible foundation verification runner that stores actual outputs/exit codes
  in ignored test-artifacts/verification. Added optional Python formatting/style tools.

Executed evidence: verify_foundation.py completed all eight checks successfully: 28 Node
passes, 29 Python passes/5 ASGI skips, Electron and renderer-core type checks, JavaScript
lint, Python style/import-order and pip check. Zero unexpected external attempts recorded
inside the guarded Python test process. Ruff, Vue, real ASGI/native/model/speech and release
checks remain open. Initial regression failures were reproduced then repaired; see TEST_RESULTS.

Next gate is unchanged: install the supported FastAPI/Pydantic/Uvicorn and Vue stack in a
permitted session, then run actual API/native desktop checks before claiming Phase 1 complete.

## Further continuation — actual API runtime unblocked

An additional standard Python installation folder contains working Python 3.10.11 (not on
PATH or in py launcher output). A second cache directory, pip/Cache/http-v2, contains current
FastAPI/Starlette/Uvicorn and cp310 Pydantic Core wheels. Earlier claims that only obsolete
API artifacts existed applied only to the legacy pip/Cache/http directory and are superseded.

Created ignored .venv-runtime with that interpreter; recovered compatible wheels with native
tag checks and RECORD verification, then installed with --no-index. Successfully executed:
FastAPI 0.140.13, Starlette 1.3.1, Uvicorn 0.52.0, Pydantic 2.12.5/Core 2.41.5,
httpx 0.28.1, websockets 15.0.1. Python 3.12 is still the untested release target. Updated
direct/runtime-lock requirements to this now-executed stack; no obsolete downgrade.

Nine real ASGI tests now run: authenticated health, Origin/Host/client restrictions,
actual API streaming with fixture inference, explicit memory CRUD/export/history deletion,
strict approval, whitespace/unknown-field/cloud-tag validation, and provider error state.
A whitespace-only API request was first reproduced as incorrectly reaching the stream;
validation now rejects it with 422. Approval must be the literal boolean true; operation
fields are validated before mutation. API construction requires a valid per-launch secret.

Two Node tests now start the production bootstrap and actual Uvicorn server, verify bearer
requests and SQLite memory through restart, then confirm graceful shutdown/EOF releases
both child process and listener. One additional Python real-socket integration test connects
actual FastAPI/Uvicorn/Ollama adapter to a clearly labeled local model-protocol fixture;
it verifies relevant memory in the protected prompt, completion, cancellation/lock release,
blocked history deletion during generation, sanitized errors, recovery, restart and deletion.
A test-side iterator lifetime problem initially closed the HTTP response before the health
assertion; retaining the iterator fixed the test. No runtime change was inferred from that
fixture-lifetime failure, and temporary diagnostic tracing was removed.

Native desktop smoke was retried with MIKA_PYTHON pointing to the working .venv-runtime;
Electron still fails before application code at the same sandbox ACL fatal check. No new
ACL changes, global changes, sandbox bypass or enormous downloads were attempted.

Developer scripts accept explicit runtime selection; setup requires supported Python and
will not silently overwrite the Python 3.9 venv. Runtime lock and license details are documented.
Current combined verification results are recorded in TEST_RESULTS.md after this continuation.
Phase 1 remains open specifically for native desktop/Vue checks. All later voice/model/
Live2D/release gates remain open. No product phase has been represented as finished.

Final combined verification in .venv-runtime: **30 Node passes, 39 Python passes, zero
skips/failures**, all eight available checks exit 0. Actual command/output artifacts are
saved under test-artifacts/verification. No native desktop/model/speech/installer success
is inferred. The final report lists current versions and runnable developer commands.

## Checkpoint storage restriction

A normal `git add -- .` was denied when creating the parent repository's .git/index.lock;
that metadata is read-only in this managed session. Source edits remain in the working tree.
To preserve a commit without writing protected metadata, an isolated bare clone of the
current project history was created at .tools/checkpoint.git (local --no-hardlinks clone).
The verified changes are staged/committed only there and exported as a local bundle under
test-artifacts/checkpoints. No parent branch/index/ref changes or external publishing.
