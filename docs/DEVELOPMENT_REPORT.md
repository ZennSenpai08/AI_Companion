# Latest continuation — Qwen2.5 readiness and bubble checks, 2026-11-14

Verified 2f82c3f archive. Qwen2.5 is not installed and current free RAM is below its 3 GiB
floor; no model comparison/default change. Fresh 0.8B English greeting succeeded, later
admission refused. Real authenticated unload and backend cleanup passed. Added main-only
native bubble evidence collection and acceptance gating, not new inference/UI architecture.
69 Node / 70 Python tests, types/lint and native-loader Vue build PASS. Agent-native and
browser visual verification BLOCKED. No new native layout or bilingual quality acceptance.
Full outputs/files/measurements and user commands:
[Qwen2.5 and bubble verification](QWEN25_BUBBLE_VERIFICATION.md).

# Previous continuation — bilingual input / English replies, 2026-11-14

Checkpoint 529de0d verified and preserved. Added protected English-only response style,
input-language hints, a relevant-only local expression glossary and qwen2.5:1.5b selection
policy. Finished pending response-presentation/bubble source without enabling audio or
claiming Live2D. No existing user database or original Git metadata replaced.

Real Qwen0.8 output still fails English-only/slang/usefulness requirements; the requested
alternatives are absent. Multi-case testing reached the legitimate low-memory guard.
No model winner or full new native verification is claimed. Detailed commands, actual
examples, RAM/VRAM, modified modules and remaining gates are in
[BILINGUAL_ENGLISH_RESPONSES.md](BILINGUAL_ENGLISH_RESPONSES.md); check TEST_RESULTS.md for
executed regression outcomes. Earlier reports below are historical.

# Development report — Mika source preview, 2026-11-13

Latest continuation (2026-11-14): safe installed-model selection, local GGUF verification,
active-generation switch/unload protection and explicit memory unload implemented on the
existing stack. Shared policy retains existing thresholds; error reports actual free RAM.
Saved failures crossed below 2 GiB; no measurement defect or permanent rejection latch
found. Fixed a demonstrated orphan-assistant history truncation defect.

Real five-turn backend/Ollama + authenticated unload + SQLite restart/cleanup PASS. Cold
client first token 6.356 s, warm 0.197–0.246 s; generation 52.5–70.9 tokens/s. Only 0.8B
installed; no Gemma comparison/download. Language/instruction quality remains unacceptable
in both raw and Mika tests; low sampling/publisher settings did not repair it.
62 Node/65 Python tests, types/lint PASS. Vue native-loader production build PASS after ESM
config correction; default bundling and agent native launch still restricted. Updated
visible controls need normal-session QA; preserved Windows real-UI evidence is separate.
Detailed deliverables/files/commands: [model and memory report](MODEL_SWITCHING_AND_MEMORY.md).
Historical sections below do not override this current status.

Latest local-request/chat repair: proved normal/smoke interpreter mismatch and repaired
shared Python selection, ready-gated requests and safe field errors without relaxing
loopback/auth/sandbox. Added sanitized stage tracing and interruption-aware native test
evidence; no inference deadline increased. Original failing test reached persistence,
then requests were client-closed before the provider timeout; the actor remains unknown.

Two genuine backend-model traces PASS with Ollama 0.40.16/installed 0.8B, actual outputs,
metrics and exact SQLite backend-restart restoration. Taglish/context quality is poor;
transport success is not quality acceptance. Fresh 59 Node/56 Python tests, types and JS
lint PASS. Agent build/native remain restricted; actual repaired Vue-model run awaits
ordinary-Windows rebuild/retest. See LOCAL_REQUEST_CHAT_REPAIR.md; no new models or voice.

Latest real-text integration attempt: existing streaming/persona/SQLite pipeline reused;
added read-only local readiness and explicit actual Vue real-chat acceptance with timing/
resource capture. Optional completion metrics are sanitized and not stored as history;
HTTP timeout errors are now specific. No model output fabricated or dependency upgraded.

Actual result is BLOCKED: Ollama not found/reachable, no weights confirmed, free RAM below
Lite admission. No runtime/model download or inference attempted. 50 Node/55 Python tests,
full type checks and JS lint pass; real model/language/performance, native UI runner and
whole-app/offline acceptance remain unverified. Agent build/native restrictions persist;
no security change. REAL_OLLAMA_TEST.md is the concrete ordinary-Windows execution guide.

Current desktop foundation review: the user confirms the updated normal-Windows actual
Mika smoke PASS; inspected saved 23:20 UTC run verifies both secure Vue mounts, IPC/backend
and graceful cleanup. Interactive dev code 0 alone does not identify the quit cause.
Added only lifecycle diagnostics/ambient smoke warning, preserving shutdown behavior.
DESKTOP_FOUNDATION_VERIFICATION.md separates verified controls from pending manual cases.

Fresh 48 Node/50 backend tests, full types and JS lint PASS. Agent build/native attempts
remain separately restricted; no ACL changes. OLLAMA_INTEGRATION_READINESS.md reviews
existing streaming/persona/SQLite modules and small-model selection, with current memory/
catalog blockers. No integration or model download was performed; stop at this review.
Manual desktop sign-off is pending, not fabricated from automated smoke/source inspection.

Latest recovery task, 2026-11-14: pinned Vue packages and the genuine lockfile now exist.
Electron 45 changed to on-demand binary download; added explicit setup and shared
metadata-only runtime resolution to dev/desktop tests, with no version/security/ACL change.
Runtime check/install, full typecheck, JS lint and backend tests pass. Standard agent
build/dev hit esbuild read restrictions and native desktop test hits its runtime ACL check.

Inspected the existing successful actual Mika artifact at 22:41 UTC: two visible secure
Vue mounts, preload/IPC/backend/native controls, actual settings screenshot and graceful
native/backend cleanup PASS. This is saved real-app evidence, not a new agent/manual run.
Updated-launcher normal-session retest remains pending. TEST_RESULTS.md records commands,
counts and current failures. No additional AI/voice/Live2D/memory feature work was done.
The historical uncertainty below is superseded only for these evidenced gates.

Current task update, 2026-11-14: normal-session Electron startup, secure renderer and visible
native content PASS, corroborated by the saved visible run and user confirmation. Graceful
shutdown is INCONCLUSIVE because that run was interrupted. Reporting now separates those
facts and preserves original evidence. No ACL/security modifications.

Npm 11.10.0 is intended; root lockfile and Vue toolchain are absent. Cache/DNS tests pass,
but registry TCP fails Windows 10013 and actual lock-only preparation fails npm EACCES.
Versions are unchanged. Exact preparation commands are in FRONTEND_BUILD.md. Actual Mika
Vue launch is NOT YET VERIFIED; full Vue build is BLOCKED pending dependencies.

Prepared stricter actual-app smoke and backend-before-Vue ordering, preserving the existing
stack and retry controls. Verification: 40 Node tests, Electron/core types and JS lint pass;
report fixtures are not native acceptance. Checkpoint d87e4d precedes the integration work.
The actual Vue/preload/IPC/backend/window/shutdown acceptance must run after installation
before later product milestones resume. All older report sections below are historical.

Latest 2026-11-14 task: **Electron runtime and sandboxed renderer PASS in ordinary Windows
PowerShell**, confirmed from the user's saved real result. The agent's token limitation
is separate. The original automated probe remains unchanged and its visible:false is not
claimed as a visibility pass. Added a manual visible-window test with no timed close;
user appearance confirmation is pending. See the focused investigation for exact command.

Corrected the same hidden GUI launch flag in Mika's dev launcher; no framework rewrite or
dependency version change. Strict Electron types/lint, 3 security tests and new CLI help
pass. Actual full Vue build was attempted and fails at missing vue-tsc; registry metadata
fetch is denied with EACCES. No lockfile/install, actual Mika Vue UI/preload/backend/native
shutdown acceptance or further product milestone is claimed. ACL repair/backups untouched.

The following earlier report preserves prior investigation and implementation evidence.

Electron-only follow-up, 2026-11-14: [focused investigation](ELECTRON_STARTUP_INVESTIGATION.md)
records the applied, authorized runtime-only RX repair and real controlled I/O verification.
Original ACL fatal is removed; app readiness/native handle occurs. Renderer token creation
still fails sandbox 49 / Windows 87 in the restricted coding-agent context, with GPU
0xC0000135 also present. Actual Mika and secure software probes fail; no displayed-content,
preload/Vue or complete native acceptance is claimed. Parent rights/backups/Git index are
preserved. Normal-session results are pending; automatic product resumption remains gated.

## Outcome

An original Windows companion source project and an executed local text backend exist.
The product is incomplete: native Electron launch is blocked by the managed sandbox,
Vue dependencies/build are unavailable, and no inference model or Live2D is provisioned.
Installed Windows voices enumerate successfully; actual synthesis is denied in this process.
No installer was produced. No product phase is labeled complete without its acceptance gates.

## Architecture and implemented source

Electron owns transparent overlay/settings windows, tray/recovery, isolated allowlisted
IPC and supervised Python lifecycle. Vue/TypeScript contains text/memory/settings panels.
FastAPI exposes authenticated loopback health, diagnostics, streaming text and local memory.
Strict SQLite preferences and bounded local model-catalog queries support Vue settings,
chat defaults, readiness/errors and memory search. Microphone/voice/avatar capabilities
stay disabled. Vue additions are uncompiled. Unicode exports use an 8 MiB byte ceiling.
Per-launch credentials travel through anonymous stdin, never renderer storage or URLs.
HTTP NDJSON is the initial text transport; WebSocket voice transport is not implemented.

The Ollama adapter accepts only explicit local Qwen tags, contacts fixed loopback, rejects
redirects/proxies, and never pulls or falls back to cloud. Responses have schema/size/deadline
limits. Cancellation closes HTTP and provider streams. Explicit text states drive diagnostics.
The original protected Mika profile reloads each turn; bounded context treats memories as
untrusted data. SQLite stores sessions/messages and explicit approved facts with timestamps,
provenance, edit/delete/export. Data is readable, not encrypted. Lexical recall is not training.

The renderer chat-core handles sequence binding, late notifications, Stop-before-admission,
failed-admission rollback and interruption. It is independently tested/type-checked; full
Vue integration, native IPC and visual layout remain unverified. The native diagnostic window
is clearly labeled as Live2D setup pending; no placeholder is represented as an avatar.

## Exact tools and dependencies

Observed: Windows x64 build 26200; Node 22.18.0; npm 11.10.0; Git 2.50.1.windows.1.
Python 3.9.13 remains on PATH, but an additional standard installation provides Python
3.10.11. A separate ignored .venv-runtime uses 3.10.11 successfully. Registered Python 3.13
fails to launch. Python 3.12 is the release target and has not been tested here.

Executed API stack: FastAPI 0.140.13, Starlette 1.3.1, Uvicorn 0.52.0,
Pydantic 2.12.5/Core 2.41.5, httpx 0.28.1, websockets 15.0.1. HTTP dependencies:
httpcore 1.0.9, anyio 4.9.0, h11 0.16.0, idna 3.20, certifi 2026.10.23,
sniffio 1.3.1, typing_extensions 4.16.0, exceptiongroup 1.3.1. Other dependencies are pinned
in requirements-runtime-lock.txt. Compatible cached wheel RECORDs/tags were checked and
installation used --no-index; no global environment writes or external downloads.

Executed verification tools: TypeScript 5.9.3, ESLint 9.34.0, @types/node 22.18.12,
autopep8 2.3.2, pycodestyle 2.14.0, isort 6.1.0, tomli 2.4.1,
importlib_metadata 8.7.1 and zipp 3.23.1. Ruff 0.11.8 is intended but unavailable.

Cached Electron 45.3.0 exists but native launch fails. Intended uninstalled frontend/build
pins remain Vue 3.5.45, Vite 7.3.1, plugin-vue 6.0.1, vue-tsc 3.0.6,
electron-builder 26.0.12. No full npm lockfile, complete reproducible release environment or
Python 3.12 packaging exists. OmniVoice 0.2.1 was researched, not installed or benchmarked.
No Live2D SDK/Core/model version is claimed provisioned.

Optional pywin32 311 was installed only in .venv-runtime from a compatible cache wheel.
Metadata declares PSF, with component notices retained in dist-info. The fixed Python
COM child adapter lists actual David/Zira voices and supports cancellation. Actual Zira
synthesis fails with access denied; no sample, language quality or latency was measured.
It is not enabled in chat. No voice recordings or weights were copied.

## References and license findings

Primary pages/docs/LICENSEs were consulted for AIRI, Open-LLM-VTuber, OmniVoice,
VoiceStudio, Audio8, VibeVoice, Fish Speech, faster-whisper, Silero, Buzz, Hindsight,
OpenViking, OpenJarvis, AnythingLLM, Ollama/Qwen, Live2D, Electron, Vite/Vue and HTTPX.
Links/limitations are in TECHNOLOGY_RESEARCH.md and DEPENDENCY_LICENSES.md. No third-party
application repo was cloned or its code imported. Pan streams were not watched or analyzed;
the Character.AI page exposed a fictional greeting only. No creator identity/voice copied.

OmniVoice code is Apache-2.0 but current weight card says CC-BY-NC. OpenViking/VoiceStudio
are AGPL-3.0 per reviewed current sources. Fish Pretty girl offline weight/cloning rights
were not established. Live2D Framework/Core/art/application publication terms are separate.
All licenses and exact selected weight revisions need release review; no release is approved.

## Hardware and observed performance

Ryzen 5 6600H, 12 logical threads, 15.309 GiB usable RAM, RTX 2050 4096 MiB VRAM,
driver 595.79, approximately 114.79 GiB initially free disk. Available RAM remained very low
(approximately 0.07–0.17 GiB at inspections). Lite is provisional and inference admission
requires free memory headroom. No model fit, speech latency/RTF, avatar FPS or end-to-end
performance has been measured. CIM/WSL inspection denied; OS edition naming is unresolved.

## Executed tests and limits

`./.venv-runtime/Scripts/python.exe scripts/verify_foundation.py` exited 0:
**32 Node tests and 50 Python tests passed, with zero skips/failures.** Strict Electron and
renderer-core type checks, JavaScript ESLint, Python style/import-order and pip check passed.

Tests exercise the actual FastAPI ASGI app. Two Node tests launch the production
bootstrap/Uvicorn server and verify authentication, memory restart/deletion, process and
listener cleanup. A real TCP integration exercises API -> Ollama HTTP adapter -> explicit
model-protocol fixture, with cancellation, state recovery and persistence. Other tests
cover protected prompt placement over 60 constructed turns, bounds/resource policy,
malformed streams, deadlines, stale renderer events and blocked-callback shutdown.
Fixture output is not model inference. The 60-turn test is not a behavioral persona test.

The Python DNS/TCP/UDP guard recorded zero unexpected external attempts in its parent
process; children/native code are outside its scope. Full firewall-isolated spoken QA is
not verified. Ruff remains unavailable, full Vue build blocked, native Electron smoke still
fails at sandbox ACL before application startup. No sandbox bypass/profile ACL edits were
performed in the continuation. No actual Ollama inference, STT, TTS generation, mic capture,
Live2D or installer test passed. Actual native voice discovery and helper cancellation
passed separately; PCM format checks use fixture data. See docs/VOICE_EVALUATION.md.
Actual command arrays/raw results are in test-artifacts/verification (ignored local artifacts).
TEST_RESULTS.md preserves current and earlier results, failures and repairs.

## Install/run, locations and next work

Source: `C:/Users/Romcill/Desktop/AI-PROJECT` after user relocation commit fa5871e.
Installer: **not produced**. No external publication or paid service used.

Use `./.venv-runtime/Scripts/python.exe scripts/verify_foundation.py` to reproduce available
checks. `scripts/test.ps1 -CoreOnly -Python './.venv-runtime/Scripts/python.exe'` selects the
working runtime. Native dev command supports `scripts/dev.ps1 -Python` after Vue setup;
it remains blocked here. README covers full intended setup, model preparation and privacy.

Next: restore permitted native Electron launch and complete frontend installation/lock/build;
run real desktop/IPC/tray/monitor checks before closing Phase 1/2. Then provision permitted
Live2D assets, real local text model, STT and licensed TTS; measure English/Filipino/Taglish,
interruption/offline speech, complete UX, packaging and clean-Windows installer tests.
See ROADMAP.md for sequential gates. Hindsight/OpenViking/OpenJarvis remain optional and off.

## Local checkpoint delivery

The parent repository's .git is read-only to this session, so normal staging was denied.
Original test-artifacts/checkpoints/mika-backend.bundle was verified with git bundle
verify/list-heads as 73d28fe830664b6d2a1cc1aea38fd00ff0339d3a, complete history; fresh
isolated import/fsck passed. No GitHub push is inferred. Current source is the same Vue
application relocated by user commit fa5871e; the reported Zyrah/React description could
not be established from inspected local/public files. See PROJECT_IDENTITY.md.

scripts/checkpoint.py now creates uniquely named ignored local bare history copies,
new refs and source bundles; it checks source HEAD/branch/status/index unchanged and
stores actual command results plus SHA-256 alongside each archive. Existing repos and
the original bundle are preserved. See CHECKPOINT_AUDIT.md for recovery commands.
No repository was published. New snapshot identity is in its adjacent JSON manifest.
