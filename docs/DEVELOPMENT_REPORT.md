# Development report — Mika source preview, 2026-11-13

## Outcome

An original Windows companion source project and an executed local text backend exist.
The product is incomplete: native Electron launch is blocked by the managed sandbox,
Vue dependencies/build are unavailable, and no actual model, voice or Live2D is provisioned.
No installer was produced. No product phase is labeled complete without its acceptance gates.

## Architecture and implemented source

Electron owns transparent overlay/settings windows, tray/recovery, isolated allowlisted
IPC and supervised Python lifecycle. Vue/TypeScript contains text/memory/settings panels.
FastAPI exposes authenticated loopback health, diagnostics, streaming text and local memory.
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
**30 Node tests and 39 Python tests passed, with zero skips/failures.** Strict Electron and
renderer-core type checks, JavaScript ESLint, Python style/import-order and pip check passed.

Nine tests exercise the actual FastAPI ASGI app. Two Node tests launch the production
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
performed in the continuation. No actual Ollama, STT/TTS, mic, Live2D or installer test passed.
Actual command arrays/raw results are in test-artifacts/verification (ignored local artifacts).
TEST_RESULTS.md preserves current and earlier results, failures and repairs.

## Install/run, locations and next work

Source: `C:/Users/Romcill/Desktop/AI-PROJECT/offline-ai-companion`.
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
An isolated local history copy in .tools/checkpoint.git preserves a source commit and
exports test-artifacts/checkpoints/mika-backend.bundle. This does not alter the parent
repository's branch/index. Source edits remain in the shared working tree. Bundle details
and verification are recorded alongside it; no repository was published externally.
