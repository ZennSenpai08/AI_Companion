# Development report — Mika source preview, 2026-11-13

## Outcome and scope

An original source repository and tested independent foundations were created. The finished
companion has **not** been delivered: dependencies and native sandbox restrictions block
runtime acceptance. There is no installer, speaking avatar or verified real-model chat.

## Architecture and implemented source

Electron owns native overlay/settings windows, tray/recovery, isolated IPC and supervised
Python lifecycle. Vue/TypeScript provides chat, explicit memory and settings panels.
FastAPI endpoints require a per-launch secret on loopback. Credentials travel from main to
Python through anonymous stdin and never reach renderers/URLs. HTTP NDJSON carries the
first text slice; voice WebSocket transport remains planned. Main cancels old text streams
and gates events by generation. No arbitrary desktop commands exist.

The local Ollama adapter permits only named local Qwen candidates, disables proxies/
redirects and has no model pull/cloud fallback. Mika's original protected profile is
reloaded every request. Prompt data is bounded conservatively, memories untrusted. SQLite
stores sessions/messages and only user-approved facts with provenance/timestamps and
correction/delete/export operations. Memory is unencrypted, lexical and not model training.
These source implementations do not imply UI, API or real model acceptance passed.

## Dependency versions

Observed tools: Windows build 26200 x64; Python 3.9.13 temporary test runtime; Node 22.18.0;
npm 11.10.0; Git 2.50.1.windows.1. Target Python 3.12.

Cached development artifacts used: Electron 45.3.0 (native launch failed), TypeScript 5.9.3,
ESLint 9.34.0, @types/node 22.18.12. Strict checkJs and ESLint ran successfully. This partial
cache extraction is not a full resolved dependency installation or release lock.

Direct intended pins are in package.json/requirements*.txt: Vue 3.5.45, Vite 7.3.1,
plugin-vue 6.0.1, vue-tsc 3.0.6, electron-builder 26.0.12; FastAPI 0.115.12,
Uvicorn 0.34.2, Pydantic 2.11.4, httpx 0.28.1, websockets 15.0.1; Pytest 8.3.5 and
Ruff 0.11.8. These were not successfully installed. Speech dependencies remain unselected
for runtime; OmniVoice 0.2.1 is researched, not installed. No SDK/Core/model version is
claimed provisioned. Resolve/pin transitive dependencies and recheck security before release.

## References actually consulted

Upstream pages/docs/LICENSEs were read for AIRI, Open-LLM-VTuber, OmniVoice, VoiceStudio,
Audio8, VibeVoice, Fish Speech, faster-whisper, Silero, Buzz, Hindsight, OpenViking,
OpenJarvis, AnythingLLM, Ollama, Qwen, official Live2D samples/manual/sample/publication
terms, Electron and Vite/Vue. All direct links and findings are in TECHNOLOGY_RESEARCH.md
and DEPENDENCY_LICENSES.md. No referenced repo was cloned or its application code copied.
The supplied Character.AI page exposed a fictional greeting; Pan streams were not watched
and no usable channel transcript was available. No voice/creator imitation was attempted.

Notable release constraints: OmniVoice weight card states CC-BY-NC, code Apache-2.0;
OpenViking/VoiceStudio current licenses are AGPL-3.0. Fish hosted Pretty girl gives no
established offline voice rights. Live2D Core/art/framework/app publication terms differ.

## Hardware and performance

Ryzen 5 6600H, 12 logical threads; 15.309 GiB usable RAM; RTX 2050 4096 MiB VRAM,
driver 595.79; approximately 114.79 GiB initially free disk. Only 0.07–0.11 GiB RAM was
free during inspection. CIM/WSL queries denied; OS registry label conflicts with build
naming, so edition is unresolved. No model latency/VRAM fit, speech RTF or avatar FPS was
measured. Lite is the provisional model choice; actual model fit must be tested.

## Verification

Latest Node run: 15 passed. Python guarded run: 14 passed, 5 real-ASGI tests skipped.
Strict Electron checkJs, JavaScript ESLint and Python syntax checks passed. Tests cover
persistence/reopen/correction/deletion, safe input policy, persona prompt placement for
60 turns, fixture text streaming/cancellation and process cleanup including parent death.
They do not demonstrate real inference or behavioral persona stability.

FastAPI integration is skipped; Ruff unavailable; Vue build fails at missing vue-tsc.
Electron native smoke fails before app startup with sandbox ACL fatal error, even after
a scoped workspace runtime read grant. No sandbox disabling or global ACL change occurred.
Installer gate correctly refuses a missing packaged Python backend. Detailed commands,
failures, repairs and scope are in TEST_RESULTS.md and DEVELOPMENT_PROGRESS.md.

The offline script is a Python process-scoped socket guard. It is **not** OS/firewall
isolation and does not cover all child processes. No full offline spoken conversation,
restart recall through an LLM, microphone/Taglish/voice/Live2D/installer test passed.

## Installation, source and next work

Source: `C:/Users/Romcill/Desktop/AI-PROJECT/offline-ai-companion`.
Installer: **not produced**. No external publication performed.
Follow README for Windows dependency setup and scripts/doctor.ps1. Model setup remains
separate; no large weights, private data or unreviewed character files are in Git.

First unblock Python 3.12/full dependencies and sandboxed native launch; run real ASGI,
Vue build and desktop smoke, then repair integration findings. Continue with permitted
Live2D provisioning, actual local text evaluation, STT/TTS benchmarks, full speech/
interruption and language QA, then optional integrations, complete UX and installer.
See ROADMAP.md for ordered acceptance gates and KNOWN_ISSUES.md for remaining limits.
