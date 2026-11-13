# Current Vue-unblock and shutdown reporting task — 2026-11-14

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
