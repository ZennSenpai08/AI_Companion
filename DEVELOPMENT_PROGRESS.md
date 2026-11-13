# Development progress — 2026-11-14

## Latest Vue-unblock and actual-app preparation

Accepted and inspected the user's genuine visible-native result: normal-session startup,
renderer security and visible content PASS. Graceful shutdown remains INCONCLUSIVE because
the launcher was interrupted/SIGTERM; no repeated ACL repair or security downgrade.

Implemented separate startup/visibility/shutdown report classification, preserving raw
evidence. Diagnosed missing Vue toolchain as an incomplete npm install, with no lockfile.
Npm is intended (11.10.0 observed); all exact pins retained. Cache is writable and DNS
works, but registry sockets are denied with Windows 10013. Actual safe lock-only preparation
fails EACCES; nothing was installed and no lockfile invented. Requested normal-session
dependency preparation with exact commands in docs/FRONTEND_BUILD.md.

Checkpoint d87e4d created before the actual-app integration changes. Strengthened the real
Mika desktop smoke: built Vue required, both mounts/preload/security/IPC/backend health
checked, then actual backend process/port cleanup after app.quit. Recovery/probe output
cannot satisfy it. Added readonly preload security flags; original isolation/no-Node
settings are preserved. Fixed backend startup ordering so immediate Vue settings IPC does
not race an unbound backend port. Existing retry behavior remains available on failure.

Verified 40 Node passes (zero skips/failures), Electron/core type checks and lint. These
include report fixtures and real backend tests; actual Vue UI is still NOT YET VERIFIED.
The full Vue production build is BLOCKED pending dependency files; the actual-app launcher
now reports that prerequisite without falsely testing a recovery page. Next authorized
work: full Vue checks/build, real Mika dev/native acceptance and independent graceful exit,
then resume later companion phases. No new ML/speech/avatar/installer feature claimed.

## Latest visible-window task

Normal Windows PowerShell Electron 45.3.0 runtime and sandboxed rendering are PASS.
Inspected the actual user-run JSON: app ready, native handle, secure renderer, nonempty
capture, empty stderr and exit 0. The recorded false visibility remains a separate open
criterion; original aggregate result and automated probe behavior were not changed.

Created a separate interactive visible-native-probe launcher/app with show-on-ready,
visible startup policy, exact requested title/text, readonly preload security proof and
manual close. It writes per-run logs and captures, with user appearance confirmation kept
separate. Strict TypeScript, relevant lint, 3 desktop security tests and CLI help passed.
The normal-user appearance check is pending; the agent has not pretended to see the window.

Source analysis found windowsHide:true mapping to Windows SW_HIDE as the likely reason
for the old false result. Preserved all original automated probe files (verified against
checkpoint 7b493f9). Corrected the same GUI hiding option only on Mika's actual Electron
dev child. No security settings, ACLs, framework, dependency pins or backend architecture
were changed. Optional npm alias test:native-visible added; no new dependency.

Inspected actual main/preload/Vue sources. Vue build toolchain and lockfile remain absent;
the registry rejects pinned Vue metadata with EACCES. Actual production build fails at
missing vue-tsc. These exact outcomes are recorded. Actual Mika Vue/native/preload/backend
acceptance is still open. Resume later product phases after that genuine desktop gate.

Files: scripts/run-visible-native-probe.cjs, scripts/visible-native-probe/*,
scripts/dev.cjs, tsconfig.electron.json, package.json and current reports. No repeat ACL
repair or agent token experiments in this task. Earlier findings below are historical.

## Approved RX repair (prior checkpoint evidence)

The user accepted preserving inherited parent Write access and requiring derived Electron
sandbox-token write denial. Applied only the approved offline-user RX ACE to project
node_modules/electron/dist. Validated all 76 backup entries before mutation. Comparison
shows only the intended RX additions, original ACEs/owners/groups preserved, readable
parent ACLs unchanged and backup/Git-index hashes intact. No rollback condition occurred.

Actual controlled LOW/restricted-thread I/O opens/reads the runtime with execute access
and receives ACCESS_DENIED on a nonce-named CREATE_NEW write attempt. Parent rights are
unchanged. The helper reverts its temporary thread token immediately; no primary token
or application sandbox policy changes. This is stronger evidence than memory-only checks,
but is not a running renderer or native-window acceptance.

Immediate native probe now reaches app readiness and creates a native handle: original
ACL fatal is removed. Renderer launch then fails with sandbox 49 / Windows 87 and GPU
0xC0000135. Actual Mika smoke and a sandboxed software-rendering probe also failed.
New token-creation blocker was reproduced independently and matches Chromium's Windows
error histogram. Current agent context remains restricted on a private desktop; no normal
user-session results have arrived. No displayed UI/preload/Vue success is claimed.

Added reproducible token audit and controlled-I/O diagnostic; kept software rendering as
an explicit probe-only option. Targeted verification passed all six commands: strict
Electron types, relevant ESLint, 3 desktop security tests, 2 real backend lifecycle tests,
Python diagnostic style and import checks. Fixed a single line-length failure and retained
its original result. No new dependency, framework migration or unrelated feature added.

User's resume-after-genuine-native-acceptance condition remains open. Model/speech/Live2D/
installer development has not resumed. Vue dependencies remain unavailable and no Vue
cache entry was found during the continuation. The next required acceptance evidence is
the normal-session probe and actual Mika launch; existing commands collect it securely.
All commands/outcomes and artifact paths are in TEST_RESULTS.md and the focused report.

## Earlier focused Electron-only session (before repair)

Conditional repair authorization received. Before execution, verified the exact command
matches runtime-only RX and offline SID; parsed/validated all 76 backup ACLs against the
live tree. Effective-access preflight showed existing inherited parent-account Write
access, whereas only the derived Electron sandbox token denies writes. Asked to clarify
condition 9 before changing permissions; making the parent non-writable would require
additional unapproved changes. Grant/probe deferred pending that clarification. All ACLs
remain untouched; exact evidence is in authorized-repair-preflight.json and the focused
investigation report. No unrelated development during this authorization turn.

See docs/ELECTRON_STARTUP_INVESTIGATION.md. Preserved/recovered 1ed5421 from its exact
bundle and verified original protected index hash unchanged. No unrelated functionality
was developed. Instrumented native probe now proves JavaScript main runs, then fails
before app readiness; earlier "before application code" descriptions are superseded.

Actual kernel AccessCheck on disposable low/restricted token and memory descriptor copies
reproduces the read failure. Existing AAP read and simulated ARAP read do not fix it;
the current offline identity's simulated RX ACE allows read, with write still denied.
Cause is the derived token's restricting-SID intersection losing workspace SID access.
All 76 runtime ACL entries exported before proposing the minimum identity RX grant on
node_modules/electron/dist. Approval requested; **no filesystem ACL has been changed**.

Added read-only ACL audit/process observer, opt-in scoped repair helper and stage/logging/
visible-window/security/capture evidence in native probe; desktop smoke now preserves
per-run logs instead of overwriting earlier evidence. Five targeted verification commands
passed: strict Electron types, Electron/diagnostic lint, 3 desktop policy tests, Python
diagnostic style/import checks. Native launch remains BLOCKED until authorized repair
and actual retest. No sandbox bypass, private-desktop escape or normal-session comparison.

## Current status

- **Phase 0: IN PROGRESS.** Hardware/source research reports and concrete roadmap exist.
  Final runtime versions, voice benchmark, exact checkpoint terms and Live2D/Core fit
  remain unresolved. No weights or character packages downloaded.
- **Phase 1: BLOCKED at runtime acceptance.** Foundation source and tests implemented.
  FastAPI passes actual API/subprocess checks in .venv-runtime. Normal PowerShell Electron
  runtime/security/rendering now PASS. Vue build and actual visible Mika UI integration
  remain open; the restricted-agent limitation is a separate context, not a general failure.
- **Phase 2: IN PROGRESS (independent code only).** Native overlay/tray/bounds/recovery
  controls written; pure bounds tests pass. Visual and real multi-monitor checks unrun.
- **Phase 3: BLOCKED.** Compatible licensed SDK/Core/model not provisioned; no Live2D render.
- **Phases 4, 5, 9: IN PROGRESS (independent core only).** Local Ollama adapter, persona
  assembly, streamed text orchestration and approved SQLite memory implemented. Unit/
  fixture and actual API tests pass; real LLM and UI acceptance remain unverified.
- **Phase 7: BLOCKED.** Optional Windows voice adapter enumerates real voices and cancels
  its helper safely, but actual Zira synthesis fails with access denied. OmniVoice is not
  installed or benchmarked. No voice is activated in the conversation pipeline.
- **Phase 15: IN PROGRESS (source only).** Persistent preferences, readiness/errors and
  memory search added to existing Vue settings. Full Vue/native QA remains blocked.
- **Phases 6, 8, 10–14, 16–18: NOT STARTED**, except evaluation/release planning and
  independent foundation tests. No mic capture, STT, playback, lip sync, real emotion
  pipeline, optional integrations, measured model performance or installer exists.

## Latest continuation — checkpoint audit and unblocked implementation

Original bundle 73d28fe verifies with complete history; ref listing and fresh isolated
import/fsck succeeded. Active inspected source is Mika/Vue; no inspected React/Zyrah
implementation or migration evidence. Remote branch enumeration was unavailable; the
published-description discrepancy remains explicit in docs/PROJECT_IDENTITY.md.

During this work user commit fa5871e relocated the app to the workspace root. That commit,
protected parent .git, existing sources and Git backup are preserved. No rewrite, reset,
branch checkout, parent staging or external publication was performed.

Added secure minimal Electron probe and read-only Win32 token inspection. Application and
minimal probe fail before app startup with Electron 45.3.0's install-directory sandbox
fatal error, including after relocation. AAP RX already exists in displayed runtime/file
ACLs. The process is a restricted CodexSandboxOffline token, not AppContainer. No minimum
effective repair is established; no ACL change or sandbox bypass was made. Normal
interactive session comparison is unavailable here. See docs/ELECTRON_DIAGNOSTICS.md.

Implemented strict SQLite preferences, bounded local Ollama catalog/readiness, Vue settings
and errors, chat defaults and memory search. Fixed Unicode export size accounting with a
bounded HTTP byte limit. Added optional isolated Windows SAPI adapter and benchmark;
actual Microsoft Zira synthesis returns access denied, so no audio/quality claim. Optional
pywin32 311 was installed only in .venv-runtime from a compatible verified cache wheel.

Commands executed: git bundle verify/list-heads and isolated fetch/fsck; whoami/icacls;
scripts/windows_context.py; node scripts/run-native-probe.cjs; npm run build;
scripts/benchmark_sapi.py; node --test tests/node/memory-export.test.cjs; and
./.venv-runtime/Scripts/python.exe scripts/verify_foundation.py. All eight available
foundation checks exit 0: **32 Node + 50 Python passes, no failures/skips**. Full Vue
build fails at missing vue-tsc. Native probe and actual TTS synthesis are BLOCKED.
Model output tests use an explicit fixture, never represented as real inference.

Main files added/changed: backend/core/preferences.py, backend/llm/readiness.py,
backend/tts/*, backend/api/app.py and tests; Electron main/preload/http and bridge types;
EngineSettings.vue/Chat.vue/Memory.vue/Panel.vue; scripts/native-probe/*,
windows_context.py, benchmark_sapi.py, checkpoint.py, verify_foundation.py;
tests/node/backend.test.cjs and memory-export.test.cjs; requirements-voice-windows.txt;
audit, architecture, progress, license and test documents. Some were captured by the
user's fa5871e relocation commit.

scripts/checkpoint.py creates uniquely named ignored bare metadata/ref/source bundles,
records commands/results and checks source HEAD/branch/status/index unchanged. Actual
export identity/verification is recorded in its adjacent JSON manifest; original 73d28fe
bundle is retained. Next gate: authorized ordinary-Windows native probe and permitted
frontend dependency preparation, then actual desktop QA. Downloads remain deferred for
critically low RAM and absent Ollama; no inference checkpoint or licensed avatar exists.

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
