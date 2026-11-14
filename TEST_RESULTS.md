# Latest: Qwen2.5 and bubble checks — 2026-11-14

| Executed command/check | Actual result |
|---|---|
| git bundle verify / list-heads, 2f82c3f | PASS, complete history retained |
| npm test with working MIKA_PYTHON | 69 PASS, 0 skipped/failed, 7.713 s |
| .venv-runtime/Scripts/python.exe -m unittest discover -s backend/tests -v | 70 PASS, 0 skipped/failed, 13.320 s |
| npm run typecheck; npm run lint:js | PASS |
| npm run build | FAIL: agent esbuild directory access; preceding types passed |
| node node_modules/vite/bin/vite.js build --configLoader native | PASS, 28 modules, 1.83 s |
| Qwen2.5 readiness / bilingual evaluator | BLOCKED: absent weights, 2.635 GiB free below 3 GiB policy; no inference |
| Qwen0.8 bilingual evaluator | One real English greeting; next case refused at 1.621 GiB free; incomplete |
| npm run test:chat-api -- --verify-unload | BLOCKED at low-memory preflight; no turns |
| Separate authenticated model-unload / cleanup check | PASS with a resident real Qwen0.8 model, catalog empty afterward; empty test history unchanged, backend stopped |
| npm run test:desktop; npm run test:chat-real | BLOCKED before app-ready by restricted-agent runtime ACL check; no permission changes |
| Browser layout fixture attempt | BLOCKED: browser access host unavailable; temporary local server stopped/listener closed |

Three new Node tests validate geometry/contrast rejection and smoke-helper cleanup with
fixtures. They are **not executed native layout evidence**. New helper is integrated into
ordinary-Windows smoke, captures two screenshots and requires real DOM/bounds evidence;
manual compositing/drag/pass-through remains open. No English-only bilingual success rate
or model-comparison winner was fabricated. Exact artifacts, outputs, measurements and
commands: docs/QWEN25_BUBBLE_VERIFICATION.md; logs: test-artifacts/qwen25-bubble/checks.

# Previous bilingual English replies and presentation verification — 2026-11-14

| Executed check | Actual result |
|---|---|
| 529de0d bundle verify/list-heads | PASS, complete history preserved |
| npm test, MIKA_PYTHON=.venv-runtime/Scripts/python.exe | 66 PASS, zero skips/failures; final run 7.523 s |
| Python unittest discovery | Final 70 PASS, zero skips/failures, 13.135 s. An intermediate expanded fixture failed its obsolete count (6 vs 8); corrected to two messages per selected model and rerun |
| .venv-runtime/Scripts/python.exe scripts/offline_smoke.py | 70 PASS, 12.439 s; zero unexpected external attempts in guarded Python test process only |
| npm run typecheck / npm run lint:js | PASS, including final main/preload/report changes |
| Python compileall backend + evaluator | PASS; Ruff remains unavailable |
| npm run build | FAIL: agent esbuild cannot read parent directories/config; types passed |
| Vite build --configLoader native | PASS, 28 modules, real production Vue assets, 2.61 s |
| npm run test:desktop | BLOCKED: agent runtime ACL fatal before app-ready; no security changes |
| npm run test:chat-real | Preflight passed, native execution BLOCKED at same restriction |
| npm run test:chat-api -- --verify-unload | One real reply/presenter text match PASS; turn 2 rejected at 1.87 GiB RAM; overall FAIL, backend cleanup PASS, unload/restart not reached |
| bilingual evaluator, qwen3.5:0.8b | Eight fresh Mika+glossary cases generated before low-RAM rejection; quality FAIL, not English-only reliable |
| isolated direct Tagalog case | Completed real inference; broken mixed-language reply despite English-only system prompt, no Mika/glossary |
| qwen2.5:1.5b / gemma3:1b / qwen3:1.7b readiness/evaluator | Each BLOCKED: MODEL_NOT_INSTALLED, zero inference/downloads |

Command outputs are in `test-artifacts/bilingual/checks`. Synthetic real outputs, resource
snapshots and exact run IDs are documented in `docs/BILINGUAL_ENGLISH_RESPONSES.md`.
New regression coverage includes bounded relevant slang retrieval, malformed glossary
fallback, protected English policy across all legacy input hints, prompt size/hostile-data
boundaries, installed-policy Qwen2.5 continuity, persisted bubble timing, stale response
cancellation, text/no-audio presentation and overlay input rules. These are unit/fixture
tests, not model semantic success or physical desktop interaction.

No fresh full multi-turn/restart/personality quality pass: resource rejection prevented
those acceptance paths. Saved earlier normal-Windows native/real-model evidence is retained
but does not verify this new bubble or English-only policy. No system-wide external-network
block was applied; local endpoint-only inference is not full offline firewall certification.

# Historical safe model switching and memory verification — 2026-11-14

| Executed check | Actual result |
|---|---|
| aa0bb05 bundle verify/list-heads | PASS, complete history, preserved |
| npm test with MIKA_PYTHON=.venv-runtime/Scripts/python.exe | 62 PASS, no failures/skips, 8.433 s |
| .venv-runtime/Scripts/python.exe -m unittest discover -s backend/tests -v | 65 PASS, no failures/skips, 15.807 s |
| npm run typecheck | PASS Vue/Electron/core; initial resolveJsonModule failure fixed |
| npm run lint:js | PASS |
| Python compileall backend + evaluator | PASS; Ruff not installed, not claimed |
| npm run build | FAILED in agent, esbuild cannot read parent directories/config |
| node node_modules/vite/bin/vite.js build --configLoader native | PASS, 22 modules, 1.41 s; config ESM __dirname issue repaired |
| npm run test:desktop | BLOCKED in restricted agent, runtime ACL check before app-ready |
| npm run test:chat-real | Preflight passed, native launch BLOCKED at same agent restriction |
| npm run test:chat-api | PASS, five real Ollama turns, exact SQLite backend-restart restore, backend stopped |
| npm run test:chat-api -- --verify-unload | PASS, installed preference save + real authenticated unload + unchanged history + restart/cleanup |
| evaluator --stability-only | PASS transport/three-turn recall, real cancellation after delta and recovery; instruction/language quality not accepted |
| evaluator --model gemma3:1b --stability-only | BLOCKED before inference, model not installed; no download |

Logs are in test-artifacts/conversation-quality/checks. Full measurements and real synthetic
outputs are linked in docs/MODEL_SWITCHING_AND_MEMORY.md. Direct/stock/conservative/official
sampling comparisons reproduce Tagalog/Taglish failures without Mika; raw prompt replays
match Mika outputs. No claim of model-quality improvement. All model-switch/Gemma fixtures
are explicitly protocol/continuity tests, not Gemma inference. The latest real API trace is
test-artifacts/chat-trace/2026-11-14T05-39-45-874Z-5186e000/result.json.

Guard regression tests use simulated memory numbers: rejection below threshold, recovery
on later observations and no warm bypass. Actual Windows saved RAM crossed below 2 GiB;
fresh tests stayed above it. No artificial RAM exhaustion or weakened thresholds.
The orphan-assistant context regression was first observed failing, then repaired/passed.

Saved normal-Windows native real-chat evidence at 05:14 UTC remains PASS for transport,
renderer security, SQLite restart, profile unchanged and no interrupted assistant storage.
Fresh native UI switching/unload is not verified in this agent. Earlier results below are
historical and superseded by this section where they describe unavailable models/runtime.

---

# Local-request and real-chat repair — 2026-11-14

| Executed verification | Actual result |
|---|---|
| 04cf812 bundle verify | PASS, full-history ref preserved |
| Actual Python inspection | .venv 3.9.13 lacks FastAPI/Uvicorn; .venv-runtime 3.10.11 has both |
| Node suite with MIKA_PYTHON=.venv-runtime | 59/59 PASS, no skips/failures, 9.856 s |
| .venv-runtime Python unittest suite | 56/56 PASS, no skips, 11.207 s |
| Full Vue/Electron/core type checks | PASS; initial new trace-script annotations repaired before final checks |
| JavaScript lint | PASS |
| Focused request + failure-evidence regressions | PASS; includes real prepared-backend startup/read/write/auth/restart and failure-report fixtures |
| npm run test:chat-api (twice) | PASS, genuine installed Ollama output and exact SQLite backend-restart restoration; no Vue/native claim |
| npm run build | BLOCKED/exit 1: esbuild parent/config read denied in agent; log retained |
| npm run test:desktop | BLOCKED/exit 2147483651: existing agent runtime ACL check before app-ready |
| Updated npm run test:chat-real | Ordinary-Windows rebuild/retest pending; not attempted again after native prerequisite failed in agent |

Logs: test-artifacts/request-repair/{node-tests.log,backend-tests.log,typecheck.log,
lint.log,build.log}. Latest native regression: test-artifacts/electron-startup/
mika-2026-11-14T04-50-27-948Z-b3903898/launch.json. No ACL/security change attempted.
Normal-session native foundation PASS is preserved as separate saved/user evidence.

Actual inference evidence: test-artifacts/chat-trace/2026-11-14T00-55-32-329Z-dca02aec/
and 2026-11-14T01-03-20-079Z-ca765115/result.json. First cold delta 72.343 s (load 30.038 s,
prompt eval 42.114 s). Second-run first delta 5.394 s, warm deltas 0.114–0.151 s; generation
49.174–67.713 tokens/s in that run. Genuine output includes "I am Mika" but Taglish is
unnatural and code-word recall/spelling inaccurate. Do not equate transport PASS with
accepted language/persona quality. Complete actual outputs/metrics stay in these explicitly
generated test artifacts. No fixture inference was injected into either acceptance run.

Saved original failing native test inspected: 00:42 UTC run, submitted user rows but no
assistant completion. Filtered Ollama HTTP log records client-closed 499 requests at
08:43:06/08:44:05 local, 41.91/29.02 seconds. Both precede the 90-second provider deadline.
The old runner ignored interruption and lost failed-stage evidence. The actor/cancellation
cause is not established. Regression fixtures now prove interrupt/replacement terminates
immediately with CHAT_INTERRUPTED/TEST_INTERFERED, preserving the attempted turn.

New tests do not simulate model answers during real acceptance. VM/DOM failure fixtures
are labeled as report-classification tests. Actual Vue/rendered model answers after the
repair, full Electron restart and external-network-isolated behavior are NOT YET VERIFIED.
See docs/LOCAL_REQUEST_CHAT_REPAIR.md for exact Windows commands and interpretation.

---

# Earlier real Ollama integration attempt — 2026-11-14

| Executed check | Result |
|---|---|
| git bundle verify/list-heads f1dfce0 | PASS, complete-history checkpoint preserved |
| npm run typecheck | Initially FAILED (runtime annotation after async preflight); fixed, full Vue/Electron/core recheck PASS |
| npm run lint:js | PASS |
| npm test with MIKA_PYTHON=.venv-runtime | 50/50 PASS, no failures/skips, 9.471 s |
| .venv-runtime/Scripts/python.exe -m unittest discover -s backend/tests -v | 55/55 PASS, no skips, 14.938 s |
| Focused metrics/conversation suite | 11/11 PASS, fixtures/protocol only |
| Python Ruff | UNAVAILABLE: No module named ruff; not claimed passed |
| npm run ollama:check | BLOCKED: no verified listener, ECONNREFUSED, model unavailable, low free RAM |
| npm run test:chat-real | BLOCKED before Electron/inference, inferenceAttempted=false |
| npm run build | FAILED in agent: existing esbuild parent-directory access denial |
| npm run test:desktop | BLOCKED in agent at runtime ACL check, exit 2147483651; security unchanged |

Actual real-model gate: test-artifacts/electron-startup/
mika-2026-11-13T23-56-46-773Z-e5dd63ee/ollama-preflight.json. It records available=false,
modelInferenceAttempted=false, modelDownloaded=false, 0.39 GiB free RAM and no listener.
No real generated responses, language/personality scores, load time, TTFT, tokens/s or
inference memory measurements exist. Ambient GPU readings are not a model benchmark.
Latest read-only check in test-artifacts/ollama-integration/preflight.json at 00:05 UTC
still records no listener/model and insufficient RAM (1.50 GiB free); no inference/pull.
Rerun after readiness corrections is required; ordinary-Windows results were requested
asynchronously but not assumed. Real offline acceptance remains NOT YET VERIFIED.

Native regression artifact: mika-2026-11-13T23-59-47-522Z-6b9be1a2/launch.json. Runtime
resolved, realChatRequested=false, main-start, then fatal before app-ready. This does not
invalidate saved normal-Windows native acceptance or justify ACL changes.

Full Node/backend/typecheck/lint/build logs: test-artifacts/ollama-integration/. New tests
verify valid/invalid completion metrics, no stale metrics after failure, useful timeout
classification, metrics excluded from stored history and loopback-only admission. Fixture
token counts are explicitly not benchmark data. Existing tests verify real local API
restart/persistence/cancellation using fixture inference, not an actual Ollama model.
The new UI runner is executable/source checked; its DOM/language/cancellation/resource
branches await a real model/native session. Backend restart is not full Electron restart.

---

# Earlier desktop foundation review — 2026-11-14

| Evidence class | Executed check/result |
|---|---|
| Static | npm run typecheck PASS: full Vue/SFC, Electron/checkJs, renderer-core; yielded process completed exit 0 |
| Static | npm run lint:js PASS |
| Automated | npm test with MIKA_PYTHON=.venv-runtime: 48/48 PASS, no failures/skips, 11.331 s |
| Automated | .venv-runtime/Scripts/python.exe -m unittest discover -s backend/tests -v: 50/50 PASS, no skips, 19.138 s |
| Fresh build | npm run build exit 1: esbuild denied parent-directory read/config resolution; user's normal build success is a separate prior result |
| Fresh native | npm run test:desktop resolves 45.3.0, logs main-start, exits 2147483651 at runtime ACL check before app-ready; BLOCKED in agent |
| Saved current Windows | mika-2026-11-13T23-20-15-238Z-f5bce573: all ten actual Mika checks PASS, rendererStartup PASS, gracefulShutdown PASS |
| Manual | Interactive dwell, settings X/reopen, physical click-through/topmost/drag, tray and restart bounds: NOT YET VERIFIED by agent/user confirmation in this task |
| Read-only readiness | Ollama absent on current PATH; fixed-loopback installed_models unavailable; no model invocation or download |
| Archive | git bundle verify/list-heads 26ad2b2 PASS, complete-history ref preserved |

Fresh Node/backend/build outputs: test-artifacts/desktop-foundation/{node-tests.log,
backend-tests.log,build.log}. Native artifact: test-artifacts/electron-startup/
mika-2026-11-13T23-26-33-293Z-7b77eff0/launch.json. Its new lifecycle main-start is observed;
later diagnostic events are source/type checked, not falsely claimed as a new visible run.
No ACL changes, sandbox bypass, dependency update or model/speech/Live2D work.

The current Windows saved actual-app result independently records two visible secure
Vue/preload mounts, OS renderer sandbox, authenticated backend health, native IPC controls,
zero Node exposure, exit 0/no signal/no timeout, backend process gone and listener closed.
desktop.json contains actual saved bounds/topmost. This proves writing settings, not
manual dragging or restart restoration. Its Unknown desktop action stderr is the expected
permission-boundary rejection. The smoke source explicitly calls app.quit after capture.
Code 0 is expected there; the interactive dev exit cause remains unknown from the single
exit line. Tests using fixture inference do not demonstrate a real local model response.

The only executable changes in this task are lifecycle console diagnostics and an inherited
smoke-flag warning; shutdown behavior is preserved. No implementation-mirroring tests added.

---

# Earlier runtime recovery and actual Mika evidence — 2026-11-14

Commands actually executed in this task:

| Command/check | Result |
|---|---|
| git bundle verify / list-heads for a4a470a | PASS, complete history and exact ref |
| npm run electron:check | PASS, native Electron 45.3.0 in package dist |
| npm run electron:install | PASS, official pinned installer, already installed |
| npm run typecheck | PASS, full Vue/SFC + Electron + renderer-core |
| npm run lint:js | PASS |
| npm test with MIKA_PYTHON=.venv-runtime | Final 48/48 PASS, zero failures/skips, 13.803 s; includes eight runtime regressions |
| .venv-runtime/Scripts/python.exe -m unittest discover -s backend/tests -v | 50/50 PASS, no skips, 20.069 s |
| npm run build | FAIL in agent: esbuild parent-directory access denied; user reports normal-session PASS, 22 Vite modules |
| npm run dev | FAIL in agent with distinct Vite config error, exit 1; Electron not launched by dev |
| vite build --configLoader runner (diagnostic only) | FAIL: existing config uses __dirname; no config/architecture change made |
| npm run test:desktop | BLOCKED in agent after successful runtime resolution: native ACL fatal, exit 2147483651 |

Latest agent native artifact: mika-2026-11-13T23-09-53-879Z-4fa48457/launch.json, under
test-artifacts/electron-startup/. runtimeResolved=true, nativeSpawnError=null, no timeout;
rendererStartup and gracefulShutdown are NOT VERIFIED. No permission modifications.
Source command output: runtime-recovery/source-command-results.json. Node aggregate output:
runtime-recovery/node-tests.log. Typecheck's yielded process subsequently completed exit 0.
Python suite includes real loopback/backend tests and fixture model tests, not real inference.

**Saved actual application acceptance: PASS** for the existing real run at
test-artifacts/electron-startup/mika-2026-11-13T22-41-50-736Z-5c0ba0c6/. Inspected launch.json,
desktop-smoke.json and desktop-preview.png. All ten actual-app checks are true: built Vue,
two native windows, both Vue/preload mounts, both visible secure renderers, backend health,
renderer IPC, native controls and permission boundary. Exit 0/no signal/no timeout,
backend process gone and listener closed: gracefulShutdown=PASS. Screenshot actually shows
the Mika Vue settings panel. The stderr Unknown desktop action is the intentionally denied
permission test, not a startup failure. This saved run predates this task's launcher changes;
it is not represented as a new agent-side or manually observed desktop run. New-launcher
normal-session retest remains pending. Overlay alpha compositing/manual drag are not proven
by the panel screenshot. No avatar/AI/voice acceptance is implied.

---

# Earlier Vue-unblock and shutdown reporting task — 2026-11-14

Normal-session startup, secure renderer and visible native content are PASS, from saved
visible-2026-11-13T21-27-41-283Z-36de18b7 plus user appearance confirmation. Its SIGTERM/
interrupted:true outcome leaves graceful shutdown INCONCLUSIVE; it does not erase startup.
Original raw JSON is preserved. New independent assessment and future launcher output
separate startup, visibility and graceful shutdown. Five regression tests cover interrupted
startup, security violations, missing visibility/evidence and actual-close evidence rules.

Actual dependency diagnosis: npm 11.10.0 / Node 22.18.0, no lockfile. vue-tsc 3.0.6 is declared
but uninstalled. Project cache write and DNS succeed; direct registry TCP is rejected with
Windows 10013. Actual lockfile-only npm preparation returns FetchError/EACCES, creates no
lockfile and installs no packages. Versions/security settings unchanged. See
test-artifacts/electron-startup/dependency-install-diagnosis.json and docs/FRONTEND_BUILD.md.

Current executed checks: **40 Node tests PASS, zero skipped/failed**; strict Electron and
renderer-core TypeScript PASS; JS ESLint PASS. Exact commands/results:
test-artifacts/electron-startup/mika-integration-preparation-checks.json. The new desktop
report validators use fixtures, not native UI; existing backend lifecycle tests use real
FastAPI/Uvicorn processes. The old Python suite was not rerun as a complete suite here.

Actual-app smoke now requires built Vue pages, real Vue mounts, secure visible windows,
preload/IPC/backend health and verified backend process/listener cleanup. It currently
exits with an explicit missing-build prerequisite before launching Electron, so Mika launch
is NOT YET VERIFIED. Vue production build remains BLOCKED by dependency installation.
An unavailable API was caught by TypeScript and replaced by supported readonly preload
security facts. The backend-before-Vue ordering fix is source/type checked, not yet native
UI verified. No standalone probe or recovery screen is counted as the real application.

---

# Earlier visible-window task — 2026-11-14

| Verification | Actual status |
|---|---|
| Electron 45.3.0 in ordinary PowerShell | PASS: user run and saved artifact inspected |
| Sandboxed renderer/context isolation/no Node exposure | PASS in that normal-session result |
| Nonempty content capture / child exit / stderr | PASS: nonempty, exit 0, empty stderr |
| Old automated probe's visibility | false; original aggregate result left unchanged |
| New interactive visible diagnostic | Implemented; user appearance/manual-close verification pending |
| Agent-only Chromium error 49/87 | Separate execution-context limitation; no ACL retry |
| Actual Mika Vue/native interface | NOT VERIFIED; full Vue build is blocked |

Inspected real normal-session JSON under 2026-11-13T21-00-35-359Z-df405db0. Created a separate
subgate assessment, not a fabricated new run or changed status. Original automated probe
sources match checkpoint 7b493f9. Existing ACLs/backups were not modified in this task.

New run-visible-native-probe.cjs uses visible GUI startup and manual window lifetime.
Actual executed checks all passed: strict Electron types (including the new probe),
relevant JavaScript ESLint, 3 Node desktop policy tests and launcher --help. Exact command
arrays/exit codes/output: test-artifacts/electron-startup/visible-probe-verification.json.
These are source/CLI checks, not observed native visibility. No interactive agent run claimed.

Found and corrected windowsHide:true on Mika's Electron dev child; worker visibility is
unchanged. Dependency versions are unchanged and no lockfile was invented. Actual pinned
Vue metadata fetch fails with OS EACCES. Actual npm run build exits 1: vue-tsc not recognized.
Full Vue typecheck/build, Mika's visible Vue/preload/backend integration and normal shutdown
remain pending. Results: vue-registry-availability.json and vue-build-attempt.json.

---

# Earlier Electron repair results — 2026-11-14

**Approved RX repair: APPLIED and verified. Native UI acceptance: still BLOCKED.**

The exact approved offline SID/dist/(OI)(CI)(RX) command exited 0. The immediate secure
native probe passes the old install-directory check and reaches app-ready/window-created,
then fails renderer creation (sandbox 49, Windows 87) and GPU startup (0xC0000135). It
exits 1 without rendered content, preload or successful-close acceptance. Mika's actual
desktop smoke was executed and likewise exits 1 during renderer launch. Software rendering
with sandbox enabled also fails; no production setting was changed to bypass security.

| Executed verification | Actual result |
|---|---|
| Original backup validation | 76 valid descriptors match pre-change ACLs; backup hash retained |
| All original runtime ACLs after change | Only intended identity RX ACE added; owners/groups/original ACEs preserved |
| Readable parent ACLs | Unchanged; profile-root query denied, no bypass or mutation |
| Controlled restricted-token file I/O | Actual READ+EXECUTE open/read succeeds; CREATE_NEW write denied with Windows 5 |
| Active test thread | Verified same SID, LOW integrity and restricting SID list; reverted after test |
| Parent Write access | Preserved before/after, as explicitly authorized |
| Protected Git index | Original SHA-256 unchanged |
| Strict Electron type check / JavaScript lint | Passed |
| Desktop policy/bounds tests | 3 passed, zero skipped/failed |
| Actual backend lifecycle tests | 2 passed, zero skipped/failed; independent of native renderer |
| Python diagnostic style/import checks | Passed after repairing one overlong line; initial failure retained |

The backend tests run actual Uvicorn/FastAPI through the production supervisor, including
restart and cleanup. They do not prove Mika reached backend startup through its UI.
The earlier 32 Node/50 Python foundation results below were not rerun as a full suite.

New blocker was reproduced through actual disposable Windows token creation: requesting
Chromium-style NULL restricting SID from this already restricted agent token fails with
87; requesting existing Everyone succeeds, and NULL+Everyone is intersected to Everyone.
Chromium's own Process.Sandbox.Launch.Error histogram contains 87. These audit tokens
were never used to launch a process or change application security policy.

All 73 files in the cached Electron distribution are present with matching sizes; no
missing distribution file was established. The precise unavailable GPU dependency is
unresolved. No displayed native window, Vue/preload UI, normal-session or complete native
acceptance is claimed. The 2026-11-14 context recheck still reproduces the token failure;
no new normal-user session results exist. No further ACL changes were attempted.

Current raw evidence: test-artifacts/electron-startup/approved-repair-execution.json,
approved-repair-acl-comparison.json, approved-repair-verification.json,
controlled-runtime-access-86077318.json, token-audit-a7c857fa.json and
token-audit-53a2295e.json. Full commands/logs for both actual native runs are referenced
in docs/ELECTRON_STARTUP_INVESTIGATION.md. Normal-session probe was requested; its actual
results are required before native acceptance and automatic product-phase resumption.

---

# Earlier Electron-only investigation — 2026-11-13 (pre-repair)

Conditional-authorization preflight: exact documented RX command matches the approved
folder/SID/mask. All 76 saved SDDL entries parse and match current runtime ACLs. No grant
executed. Kernel checks reveal the parent CodexSandboxOffline token already has inherited
write access on dist and icudtl.dat, before repair. Prior write denial was specifically for
Electron's derived restricted/LOW token. Condition 9 therefore needs clarification before
mutation: preserving existing parent rights cannot also make that parent non-writable.
Actual JSON evidence: test-artifacts/electron-startup/authorized-repair-preflight.json.
Available parent ACL, backup and protected Git-index fingerprints saved read-only; the
denied profile-root ACL query is explicitly recorded. Native
probe/application success remains unverified; no AI/speech/Live2D/installer work performed.

Native status: **BLOCKED; condition 9 needs clarification for pre-existing parent write access**. Existing full-suite
results below are preserved; the model/speech/backend suites were not rerun in this session.

- Current 1ed5421 bundle verifies; actual fresh clone recovers that commit and a clean tree.
  Main/preload/package/frontend comparison and original protected index SHA-256 pass.
- New stage markers prove JS main runs; app-ready does not occur. Native probe still exits
  2147483651 at install_dir_access.cc:52 with complete argv/cwd/stdout/stderr/Chromium logs.
- Actual memory-only kernel AccessCheck reproduces the failure: existing ACL DENIED,
  simulated package grants DENIED, current identity RX ALLOWED, write remains DENIED.
  This is not a filesystem permission change or native-window success.
- Process observation sampled the browser only, no descendants, and no remaining observed
  PIDs. Short-lived children can be missed. Agent runs on a private CodexSandboxDesktop.
- ACL export succeeded for all 76 runtime entries, zero failures. No grant was executed.
- Five targeted commands passed: strict Electron checkJs, Electron/diagnostic ESLint,
  3 Node desktop/security policy tests, diagnostic Python style and import-order checks.

Artifacts: test-artifacts/electron-startup/verification.json, checkpoint-recovery.json,
window-station.json, acl-audit-*.json, acl-backup-e2673772/, and timestamped native-probe
directories. Investigative scripts initially had a buffer-method/context-manager mismatch
with pywin32 and formatting errors; these were corrected and actual diagnostics/checks
rerun successfully. Full investigation: docs/ELECTRON_STARTUP_INVESTIGATION.md.

---

# Earlier verification — relocated project, 2026-11-13

`./.venv-runtime/Scripts/python.exe scripts/verify_foundation.py` exited **0** from the
workspace root after user commit fa5871e. All eight checks passed: **32 Node tests,
50 Python tests, zero skips/failures**, strict Electron and renderer-core type checks,
ESLint, pycodestyle/isort, and pip check. Current command arrays/exit codes/raw output are
saved in test-artifacts/verification/report.json and adjacent text files.

Added actual SQLite preference persistence/validation/restart tests and API settings
authorization; Ollama catalog requests use a local protocol fixture. Two additional real
HTTP tests verify a 2000-fact Unicode export passes the bridge and an oversized response
is rejected. These are transport/persistence tests, not model inference or native UI tests.

Four TTS boundary tests pass: actual installed Windows COM voice enumeration, cancellation
of an actual COM helper child, explicitly fixture PCM-to-WAV conversion, and input rejection.
Actual Zira synthesis was separately attempted and is **BLOCKED**, with COM access denied
(inner HRESULT 0x80070005). No speech sample was generated. No pronunciation, speech
quality, audio latency or full spoken pipeline result is claimed. See
test-artifacts/voice/sapi-benchmark.json and docs/VOICE_EVALUATION.md.

The minimal secure Electron 45.3.0 probe fails before app readiness at both the original
subdirectory and relocated root: exit 2147483651, install_dir_access.cc:52. Read-only
token queries identify a restricted medium-integrity CodexSandboxOffline process, not an
AppContainer process. Existing pre-relocation runtime ACLs already showed ALL APPLICATION
PACKAGES RX; the fatal message alone does not identify a correct ACL repair. No ACL
mutation, sandbox bypass or normal interactive comparison was performed. Full error and
scope are in docs/ELECTRON_DIAGNOSTICS.md and native-probe.json.

Original bundle verification and ref listing succeeded for
73d28fe830664b6d2a1cc1aea38fd00ff0339d3a; import into a fresh isolated audit repository and
git fsck succeeded. No GitHub push is inferred. The new checkpoint command operates only
on fresh ignored metadata; its own invocation/verification is recorded beside its bundle.

Actual checkpoint invocation succeeded as 5018fbc (base fa5871e), including bundle verify,
list-heads, fsck and original repository state/index hash comparisons. A real clone into
a NEW ignored directory recovered the expected commit with a clean Git tree and matching
source text; dependencies are absent. Initial byte comparison differed only because Git
core.autocrlf=true creates CRLF checkout from LF Python source. Newline-normalized
comparison passed. Exact result: test-artifacts/checkpoints/recovery-smoke-5018fbc.json.

`npm run build` was actually retried and failed at missing vue-tsc. Vue compilation,
renderer component/native IPC tests, actual Ollama/STT/Live2D, OmniVoice benchmarking,
OS-wide offline spoken QA and installer acceptance remain **BLOCKED / NOT RUN**.
The Python-only guarded parent still records zero unexpected external attempts; this
does not cover native libraries or child-process networking. No complete product claim.

---

# Earlier verification — actual API runtime, 2026-11-13

Command: `./.venv-runtime/Scripts/python.exe scripts/verify_foundation.py` — **exit 0**.
Python 3.10.11, recovered compatible current stack. All eight available checks passed.

| Check | Actual executed result |
|---|---|
| Node tests | **30 passed; zero skipped/failed** |
| Python guarded suite | **39 passed; zero skipped/failed** |
| Strict Electron type checking | Passed |
| Strict renderer chat-core type checking | Passed; full Vue build not included |
| JavaScript ESLint | Passed |
| Python pycodestyle / isort | Passed; Ruff is still unavailable |
| pip dependency check | Passed |

The suite includes nine real FastAPI/httpx ASGI tests, two Node tests launching the actual
production bootstrap/Uvicorn server, and a Python TCP integration through the actual API
and Ollama HTTP adapter. SQLite memory survives service restart and can be deleted through
the actual API. Child and listener cleanup pass on normal shutdown and parent pipe closure.

The full text-path integration uses an explicit **model-protocol fixture**, not a real LLM.
It verifies protected persona/relevant memory construction, actual streaming, disconnect
cancellation, state/lock recovery, rejection of history deletion during generation, model
error sanitization and restart. No native UI or model capability is inferred from it.

The guarded Python parent process recorded **zero unexpected external attempts**. Guard
hooks do not cover subprocess/native networking. This is not firewall-isolated spoken QA.
Exact command arrays, exit codes and output are in `test-artifacts/verification/report.json`
and sibling .txt files. They are ignored local QA artifacts; this file preserves the results.

Runtime versions: FastAPI 0.140.13, Starlette 1.3.1, Uvicorn 0.52.0,
Pydantic 2.12.5/Core 2.41.5, httpx 0.28.1, websockets 15.0.1. Python 3.12 release target
remains untested. The old Python 3.9 .venv intentionally lacks the API stack and skips those
tests; use .venv-runtime for current evidence.

Native Electron smoke was retried with the working backend interpreter and still failed
before application code at its sandbox ACL check. Vue build, Ruff, actual Ollama/weights,
STT/TTS/microphone/Live2D, full offline speech and installer acceptance remain open.
No new system/profile ACL changes or sandbox bypass were performed.

---

# Earlier HTTP-only continuation evidence — 2026-11-13

`./.venv/Scripts/python.exe scripts/verify_foundation.py` exited 0. All eight available
foundation checks passed. Exact command arrays, exit codes and captured outputs are in
`test-artifacts/verification/report.json` and its sibling .txt files (ignored by Git).

| Check | Executed result | Scope |
|---|---|---|
| Node suite | 28 passed, no failures/skips | HTTP/subprocess fixtures, resource policy, typed renderer chat state |
| Guarded Python suite | 34 run: 29 passed, 5 skipped | Actual httpx sockets to local protocol fixture, memory, persona construction, states, guard self-tests |
| Electron strict type check | Passed | Main/preload/JS scripts |
| Renderer core strict type check | Passed | Framework-independent chat state and bridge types; not Vue compilation |
| JavaScript ESLint | Passed | Electron/scripts/Node tests/renderer services |
| Python pycodestyle | Passed, max line 100 | Backend and test harness scripts; not a Ruff replacement |
| Python isort check | Passed | Same Python scope |
| pip check | Passed | Installed partial test environment only |

The Python guard reported **zero unexpected external attempts** within its guarded process.
It covers Python DNS, TCP/connect_ex, UDP sendto and binding. It does not prove OS-wide
isolation or cover child processes/native networking. No spoken offline acceptance passed.

New protocol regressions were first reproduced: JSON list/null-message crashes, non-boolean
completion accepted, and a main-process terminal/error race. Fixes passed the real loopback
protocol tests. Other regressions cover an endless empty stream, coalesced packet cancellation,
missing completion, stale renderer events, Stop-before-admission, startup null/list JSON,
and a blocked shutdown callback. The production parent watchdog is tested with fixture servers.
A formatter initially moved the offline entrypoint import before its path setup; this was
repaired and the standalone guarded entrypoint passed. Final Python style check also passed.

The Ollama fixture is not a running model. No real Ollama, STT, TTS or Live2D test passed.
Five FastAPI integration tests remain skipped. Ruff is still unavailable, Vue build remains
blocked, and the saved native Electron ACL failure is unresolved. No installer was produced.

---

## Initial checkpoint evidence


| Command/check | Actual result | Scope |
|---|---|---|
| `node --test tests/node/*.test.cjs` | 15 passed; 0 failed/skipped | Real local HTTP/subprocess fixture tests plus policy/bounds validation |
| `.venv/Scripts/python.exe -m unittest discover -s backend/tests -v` | Earlier core run: 14 passed; 3 ASGI tests skipped. Two ASGI tests subsequently added; latest offline run below covers discovery | Python unit tests, not model behavior |
| `.venv/Scripts/python.exe scripts/offline_smoke.py` | 14 passed, 5 ASGI tests skipped; exit 0 | Python foundation with process-scoped external socket guard |
| `node node_modules/typescript/bin/tsc -p tsconfig.electron.json --pretty false` | Passed, exit 0 | Strict checkJs main/preload/scripts; not Vue typecheck |
| `node node_modules/eslint/bin/eslint.js electron scripts tests/node` | Passed, exit 0 | JavaScript lint only |
| `.venv/Scripts/python.exe -m compileall -q backend` | Passed | Python syntax, not Ruff or API runtime |
| `.venv/Scripts/python.exe -m ruff check backend` | Unavailable: No module named ruff | Not passed |
| `npm run build` | Failed: vue-tsc not recognized | Vue/Vite build unverified |
| `node scripts/desktop-smoke.cjs` | Failed twice: Electron sandbox ACL fatal error | No windows/IPC/tray transparency acceptance or screenshot |
| `node scripts/release-gate.cjs` | Expected exit 1: packaged backend absent | Installer not built |

Node tests cover exact local documents, remote-resource refusal, geometry recovery,
secret-bearing health requests, missing executable/dependencies, malformed startup,
timeout cleanup, crash/restart, cancellation, split NDJSON, and child exit after killed
supervising parent using the production stdin watchdog.

Python tests cover exact authorization, denied network/audio flags, safe bootstrap
failure, approved-fact persistence across reopened databases, correction/export/deletion,
SQL injection treated as data, bounded history/recall, 60-turn prompt identity placement,
provider cancellation, no partial assistant retention, and rejection of cloud model tags.
Conversation output in these tests is explicitly a fixture. The 60-turn test verifies
prompt construction only; actual LLM personality consistency has not been evaluated.

Five real FastAPI/httpx integration tests are present but skipped because dependencies
are unavailable. Ollama availability, real text inference, UI memory controls, mic,
STT/TTS, spoken Taglish, audio interruption, Live2D, firewall isolation, performance,
installer and clean-machine tests have **not** passed or been simulated as success.

Earlier failures repaired: initial checkJs annotations, missing AbortSignal ESLint global,
offline script import path, failed-spawn cleanup, and connection lifetime issues. Native
sandbox ACL and dependency availability remain blockers. No model speed or latency figures
are reported. Full acceptance procedure: docs/OFFLINE_TEST_PLAN.md.
