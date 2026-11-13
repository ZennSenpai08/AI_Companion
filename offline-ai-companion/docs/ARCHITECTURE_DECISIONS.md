# Architecture decisions

1. **Accepted: Windows Electron + Vue + TypeScript.** Local assets only, no web deployment.
   Main brokers IPC; renderers get no token, backend URL, Node, shell or filesystem API.
2. **Accepted: supervised FastAPI child.** Bind an OS-assigned 127.0.0.1 port, generate
   a per-launch bearer secret, wait for authenticated health, close via parent stdin.
   Child monitors stdin EOF so a killed parent cannot orphan it indefinitely.
3. **Accepted: narrow foundation first.** Build health/diagnostics and recovery, then
   overlay controls. Missing FastAPI must be an error, never a simulated healthy server.
4. **Accepted: no automatic downloads.** Explicit setup dependency installation only.
   Models/assets installed separately after size and rights checks. No hosted fallback.
5. **Accepted: low-memory baseline.** Lite and no active inference by default. Serialize
   future model work; avoid concurrent CUDA STT/LLM/TTS on the 4 GB GPU.
6. **Accepted: provider boundaries.** Async local LLM, STT, TTS, memory and avatar interfaces;
   SQLite first. Hindsight/OpenViking/OpenJarvis remain independent opt-in capabilities.
7. **Accepted: protected original persona.** Reload versioned identity every request;
   recent context bounded, memories treated as untrusted quoted data, never system policy.
8. **Deferred: Live2D assets and release.** Review Framework, Core, sample art and AI app
   release terms individually. No placeholder visual qualifies as Live2D acceptance.
9. **Environment constraint:** external package requests are denied in this managed shell.
   Use existing dependency caches only where available; dependency-free tests are useful
   but do not replace actual Vue build, FastAPI integration or desktop smoke acceptance.

10. **Provisional text transport:** authenticated HTTP NDJSON, proxied by Electron main.
    The voice/event phase will evaluate the specified WebSocket transport. No renderer
    credentials and no cloud fallback. This is recorded as a partial architecture slice.
11. **Foundation source format:** sandbox-compatible CommonJS preload/main with strict
    TypeScript checkJs; Vue renderer in TypeScript. The recovery panel requires no bundler.
12. **Speech license finding:** OmniVoice code is Apache-2.0; current weight card states
    CC-BY-NC. It remains a noncommercial benchmark candidate, not an approved commercial
    release model. VoiceStudio/OpenViking copyleft and Live2D terms are independent gates.
