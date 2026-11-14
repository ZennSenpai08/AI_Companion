# Development progress — 2026-11-14

## Latest: Qwen2.5 readiness and native bubble acceptance preparation

Continued verified 2f82c3f bundle without replacing source or original Git metadata.
Qwen2.5 remains uninstalled; fresh readiness also measured less than its 3 GiB RAM floor.
No download/default change. Fresh Qwen0.8 generated one English greeting, then the guard
refused the Tagalog case at 1.621 GiB free. No new bilingual score or model winner.
Actual authenticated unload removed residency, returned about 1.05 GiB RAM and reduced
whole-GPU use 1822→150 MiB; test backend cleanup PASS. No user process was terminated.

Added smoke-only native bubble verification for streaming DOM updates, 360x560/240x300
geometry, wrapping/scrolling, contrast, transparent host, no chatbox and native movement.
Synthetic test captions are labelled, never inference; original bounds restored even on
failure. Acceptance now requires the report. Agent native startup and browser access remain
blocked, so these new physical/layout checks are NOT VERIFIED on native Windows.

69 Node / 70 Python tests, type checks, JS lint PASS. Native-loader production Vue build
PASS; ordinary build still denied in agent esbuild. Desktop and real-chat native tests
BLOCKED; real API preflight correctly rejected low RAM. Report and exact next commands:
docs/QWEN25_BUBBLE_VERIFICATION.md. Stop here; no microphone/TTS/Live2D implementation.

## Latest: bilingual understanding / English response policy and avatar-first presentation

Continued and verified complete checkpoint 529de0d; preserved all intervening source.
Implemented protected English-only instructions for mixed-language input, input-language
UI hints, a bounded relevant-only editable Filipino-expression glossary, and shared-policy
support for qwen2.5:1.5b. Existing saved models/history and memory protections remain intact.
No downloads, ACL changes, dependency upgrades or audio activation. Requested Qwen2.5,
Gemma1B and optional Qwen3 1.7B are absent; no comparative winner can be claimed.

Retained and finished the pending main-owned response presentation and overlay bubble,
optional controls/history startup, caption timing and stale-response cancellation. This is
text beneath a placeholder, not speech or Live2D. Type/build/unit tests do not establish
physical Windows click-through or bubble visual acceptance. Native agent launch remains
blocked independently of preserved successful normal-Windows evidence.

Fresh real Qwen0.8 testing: eight Mika+glossary cases completed, then the unchanged RAM
guard stopped the suite. Several replies ignore English-only policy, misunderstand slang
or give bad debugging advice. **Conversational quality FAILED; implementation is not a
quality guarantee.** Other attempts crossed below 2 GiB after cold loading. See
docs/BILINGUAL_ENGLISH_RESPONSES.md and TEST_RESULTS.md for actual artifacts and limits.
Final regression: 66 Node / 70 Python PASS, 70 guarded Python tests PASS with zero
unexpected external attempts; types/lint PASS, production Vue build via native loader PASS.
An expanded API fixture's stale expected message count was repaired and rerun. Full
firewall-isolated real inference and native bubble QA remain open.
Next gate: free sufficient RAM and evaluate one approved installed candidate with the
bilingual matrix, stability suite and actual native streaming. No STT/TTS/Live2D work yet.

## Latest: safe model switching and memory repair — implemented, native UI QA pending

Continued aa0bb05 and all intervening changes; verified its full bundle/ref. Saved normal
Windows real-UI transport/persistence/interrupt PASS is preserved. Agent native remains
separately restricted. No ACL changes, model downloads/removals or sandbox bypass.

Confirmed the recurring message is the intentional per-turn available-RAM guard. Saved
Windows snapshots crossed below 2 GiB (1.78/1.81 GiB); preflight approval is not a memory
reservation. Node/Windows available-physical-RAM measurements agree within snapshot drift.
Thresholds remain intact. Error now shows actual availability and selected model.

Centralized compatibility/default/threshold policy; Vue selectors use installed models;
backend validates local GGUF availability before switching and real chat. Explicit model
unload retains weights/history and is denied during generation. Shared settings persist
in SQLite; no new AI/speech/avatar framework. Context truncation now retains complete
user-led turns after a reproduced orphan-assistant regression.

Fresh real five-turn API trace + authenticated unload + backend restart PASS. Qwen 0.8B
still fails language/instruction quality; direct-vs-Mika controlled experiments show model
and persona sensitivity, not stream corruption. Gemma/Qwen 1.7B absent, no comparison or
download claimed. 62 Node/65 Python tests, types and JS lint PASS. Native-loader production
Vue build PASS (22 modules); default config bundling still denied in agent. Updated visible
selectors/unload need normal-Windows verification. See docs/MODEL_SWITCHING_AND_MEMORY.md
for commands, real timings, source changes, artifacts and limitations. Earlier sections
below are historical and superseded where they describe unavailable Ollama/native evidence.

## Current local-request/chat repair

Continued from verified 04cf812. Reproduced the Invalid local request mechanism: normal
launch selected .venv Python 3.9 lacking FastAPI/Uvicorn, while smoke selected the working
.venv-runtime Python 3.10.11. Failed startup clears port/token before Vue requests valid
/preferences and /messages. Unified development interpreter selection, retained explicit
override, centralized ready-gated authenticated requests and preserved/strengthened the
low-level loopback/credential/route/body guard. No security bypass or dependency upgrade.

Old native real-chat failure reached user-message persistence; Ollama HTTP metadata shows
two client-closed requests (499, 41.91 s/29.02 s), shorter than the 90-second provider
deadline. Actor unconfirmed; a second non-runner prompt is present. Old evidence wait
ignored interruption/replacement and discarded its failed turn. New runner records stages,
typed failures, timestamps, bootstrap/Vue readiness, actual Send and DOM evidence, and
fails interruptions/interference immediately without extending inference deadlines.

Added development-only sanitized backend stage forwarding; arbitrary stderr/extra fields
stay private. Provider errors distinguish missing model, unavailable connection, response
wait and inference timeout. New renderer/tray action messages aid future lifecycle review;
normal close-to-hide/Quit behavior unchanged. docs/LOCAL_REQUEST_CHAT_REPAIR.md has detail.

Real backend/Ollama verification now PASS (two runs): existing 0.40.16 + installed 0.8B
Q8_0, actual generated English/Taglish/context/persona responses, exact SQLite history
restored after backend restart, supervised child stopped. Cold first delta 72.343 s;
second run first 5.394 s, warm 0.114–0.151 s. Language/context quality is poor/inconsistent,
not accepted as finished. No additional weights downloaded. These are headless real
backend tests, not actual Vue-model acceptance. Current agent native/build restrictions
still block that gate; normal Windows rebuild/retest commands provided and requested.

Fresh source/protocol verification recorded in TEST_RESULTS.md: full types/lint, expanded
Node/Python suites pass. Regression cases cover failed/default startup, valid/invalid
requests, auth, privacy-filtered diagnostics, failed-case retention and interrupted waits.
Next: updated normal-session native real-chat run, review stage/result and quality before
declaring this desktop AI milestone resolved. No voice/avatar/additional-model work.

## Current real Ollama integration attempt — IN PROGRESS / real inference BLOCKED

Verified f1dfce0 full-history bundle/ref; retained all working source, Git metadata and
checkpoints. Existing Vue/preload/IPC/FastAPI/provider/persona/SQLite path is connected and
covered by fixture and real-loopback protocol tests; no duplicate provider/brain created.

Readiness: Ollama absent on current PATH/common install locations; no 11434 listener.
Python metadata calls timed out; new Node preflight reports ECONNREFUSED. Version/models
are unknown. 15.31 GiB usable RAM, initially 0.58 GiB free (later 0.39 GiB), RTX 2050 4 GiB,
driver 595.79, 113.95 GiB disk free initially. The unchanged 2 GiB Lite admission fails.
No installer, model download, forced inference or unrelated process termination performed.

Implemented read-only preflight and explicit real Vue conversation acceptance mode using
the existing provider. It records real outputs, server/client timing, loaded-model memory,
system samples, SQLite/backend restart + Vue restore and Stop/recovery when prerequisites
are met. Protected persona/hash and no-partial-assistant persistence are checked; semantic
identity/language quality, full Electron restart and network isolation need separate review.
Ordinary default desktop smoke does not enable this mode. Added sanitized optional done
metrics and fixed HTTP read-timeout classification; no persona rewrite or security change.

Verification: full types/JS lint PASS; 50 Node and 55 Python tests PASS, no skips. New tests
are explicitly fixtures/protocol, not model results. Initial TypeScript annotation error
was fixed and checks rerun. Ruff is unavailable in .venv-runtime. Build and default native
regression remain blocked by agent esbuild/runtime ACL restrictions, with logs preserved.
Actual test:chat-real stops at preflight, inferenceAttempted=false. No real language output,
model latency, token rate or real-model restart acceptance is claimed. Exact procedure:
docs/REAL_OLLAMA_TEST.md. Next: ordinary-session Ollama setup + one 0.8B model, reclaim RAM,
run real acceptance and review outputs before any larger-model/voice/avatar milestone.

## Current desktop foundation review and Ollama preparation

Verified 26ad2b2 with bundle verify/list-heads; all pre-existing work and checkpoints retained.
Accepted the user's current native smoke PASS and inspected its newer saved 23:20 UTC
artifact: two secure Vue windows, preload/IPC/backend/native control checks and graceful
backend/process/socket cleanup PASS. Interactive dwell, dragging, tray use and restart
placement remain manual gates. The reported bare dev code-0 line does not identify its
cause: explicit Quit, single-instance forwarding or an inherited smoke flag are possible.

Added dev/smoke-only lifecycle console facts and an inherited-smoke warning. No change to
quit ordering, close-to-hide behavior, timers, credentials or security policy. Normal dev
has no automatic exit timer; Settings X hides the panel, while Quit stops the backend and
closes both windows. No genuine shutdown defect was demonstrated or patched.

Reviewed actual desktop controls and full existing text/persona/SQLite/provider path;
see docs/DESKTOP_FOUNDATION_VERIFICATION.md for source mapping and pending manual cases.
Microphone remains off with enable/PTT disabled. The overlay is diagnostic, not Live2D.
Created docs/OLLAMA_INTEGRATION_READINESS.md: reuse existing streaming adapter and profile,
start future evaluation with 0.8B, compare 4B only with headroom. No Ollama integration
implementation or download was performed. Local catalog unavailable, no Ollama on PATH,
15.31 GiB usable RAM / 0.32 GiB free at inspection; even the Lite admission guard is unmet.

Fresh verification: 48 Node and 50 backend passes (zero skips), full Vue/Electron/core
types and JS lint PASS. Build fails in the agent at esbuild's parent read restriction;
fresh native attempt resolves runtime and logs main-start but aborts at ACL check before
app-ready. No permission repair attempted. User normal-session passes remain valid.
Next task: identify the interactive exit reason from the new trace/user observation and
finish manual desktop sign-off, then separately authorize/execute real-model acceptance.
Stop after this review; no speech, avatar, memory feature or model changes.

## Current runtime recovery task

Continued from a4a470a; verified its full-history bundle. The user's newer working HEAD
1dee2c7 and untracked package-lock.json were preserved. Pre-change recoverable checkpoint:
bfc2a0b. No protected Git writes, dependency upgrades, runtime ACL changes or sandbox bypass.

Root cause: Electron 45.3.0 no longer has a binary-downloading postinstall. Mika directly
spawned dist/electron.exe, bypassing the package's lazy installer. npm installation success
therefore did not ensure a native runtime. At current inspection the runtime/path/version
are present. Exact prior acquisition command is unknown; current official install and
read-only resolver commands both pass without downloading a replacement.

Implemented shared metadata-only platform/override/version-aware resolution, explicit
npm run electron:install/check, early dev preflight, distinct native/Vite error messages,
and independent renderer/shutdown reporting in actual-app logs. Setup explicitly prepares
the pinned binary. Eight runtime regressions include a real child preflight that verifies
Vite is not started on a missing runtime. No application architecture or AI features changed.

Found and inspected the existing genuine Mika success artifact from 22:41 UTC: both Vue
windows/secure renderers, preload/IPC, backend health, native controls, screenshot and
normal process/socket cleanup pass. Graceful automated native shutdown is verified for
that run. The updated launchers still require ordinary-session retest; current agent
native execution is blocked at Electron's runtime ACL check, left untouched. User build
success is accepted; agent build/dev fail at a separate esbuild parent read restriction.
Source typecheck/lint, 48 Node and 50 backend regression checks pass; no tests skipped.
Next: normal-session updated launcher/dev acceptance and manual desktop controls review.
No AI/speech/memory/Live2D feature work begins in this scoped recovery task.

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
