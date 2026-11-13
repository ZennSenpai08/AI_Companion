# AGENTS.md — Offline AI VTuber Desktop Companion

## Mission
Build a NEW, original, Windows-first, offline-capable desktop AI companion with a draggable transparent Live2D girl avatar, live English/Filipino/Taglish speech conversation, expressive licensed voice, stable original personality, and user-controlled long-term memory. The app is a desktop product, NOT a browser chatbot or website. Third-party projects are references and optional dependencies; do not fork or include any of the user's existing repositories.

## Product Principles
1. **Offline by default.** After first-time setup and model download, text chat, microphone/STT, local LLM inference, TTS, animations, and memory must operate with all external networking disabled. Network calls are opt-in, not fallback behavior.
2. **Original character.** References to Neuro-sama, character.ai personas, Pan VTuber, and Fish Audio 'Pretty girl' guide general experience and voice style only. Do not reproduce protected characters, scripts, avatar art, or unlicensed identifiable voices.
3. **Windows desktop first.** Build a transparent, frameless, draggable, adjustable, always-on-top companion window; separate settings/chat panels; tray and recovery controls; microphone permission indicator and mute control. No web deployment is needed for MVP.
4. **Personality is an invariant.** Load immutable base character policy every LLM turn. User long-term memories may personalize replies but must not rewrite the core character identity without explicit user action.
5. **Modular providers.** Expose LLM, STT, TTS, memory, and avatar engines behind replaceable interfaces. Never hard-code Fish Audio API or any cloud endpoint.
6. **Privacy and safety.** Local-only storage by default; clear mic status; retention/delete/export controls; encrypt sensitive personal data when feasible; explicit confirmation for irreversible desktop actions; bind backend services to localhost with authentication.
7. **License compliance.** Record the exact code, model-weight, avatar, and voice-reference license and notice requirements. Re-check before redistribution/commercial release.
8. **Quality gates.** Run lint, type checks, tests and offline smoke tests before marking a feature complete. Never claim a feature is implemented based only on code presence.

## Proposed Stack
- Desktop: Electron, Vue 3 or React, TypeScript, Vite, secure IPC, electron-builder.
- Live2D: official Live2D Cubism SDK for Web (license review) and model-compatible renderer. Start with an explicitly licensed official sample model; eventual original rigged character.
- Backend: Python 3.12, FastAPI, Pydantic; spawned and supervised by Electron. Async streaming/events over loopback WebSocket.
- LLM: Ollama with `qwen3.5:4b` baseline; optionally `qwen3.5:9b` on adequate memory/hardware. Keep an Ollama-free llama.cpp adapter possible.
- STT: Silero VAD + faster-whisper multilingual (`small` to start; `medium`/`large-v3-turbo` for evaluation). Buzz is a test/reference UI, not a required runtime service.
- TTS: OmniVoice, via an adapter or a compatible local runner; use licensed recordings for characterization. Investigate other candidates only if they pass Filipino/Taglish speech tests and offline/licensing checks. Fish Speech S2-Pro / Drama 3 are optional high-VRAM research alternatives.
- Memory: SQLite for sessions/preferences/episodic summaries; optional self-hosted Hindsight for retain/recall/reflect; optional OpenViking for structured local knowledge/RAG, enabled with local embeddings and local VLM; AnythingLLM is optional developer/admin document testing, not required at runtime.
- Agent capabilities: optional OpenJarvis integration for locally scoped tools after core chat works.
- Development: uv or Python venv, pnpm/npm, Pytest, Ruff, ESLint, Prettier, Vitest, Playwright, GitHub Actions when network CI is desired.

## Suggested Repository Structure
```
companion/
  AGENTS.md
  README.md
  THIRD_PARTY_LICENSES.md
  docs/
    ARCHITECTURE.md
    ROADMAP.md
    OFFLINE_TEST_PLAN.md
    VOICE_EVALUATION.md
  apps/desktop/
    electron/
    src/{components,views,stores,avatar,audio,ipc}/
  services/assistant/
    app/{api,core,agents,llm,stt,tts,memory,persona,events,security}/
    tests/
  assets/live2d/
  character/
    persona.yaml
    voice_style.yaml
    animation_map.yaml
  models/README.md
  scripts/
  tests/e2e/
```
Do not commit downloaded weights, private voice recordings, secrets, personal memory databases, or undocumented third-party Live2D asset packages.

## Required Runtime Pipeline
Microphone (explicit consent) → audio gate / VAD → multilingual STT → language detection and optional transcript correction → context assembly (persona + recent conversation + validated memory + relevant local knowledge) → local LLM streaming structured response `{text, emotion, gesture, intensity}` → TTS → audio playback, synchronized mouth/gesture/blink/eyes → privacy-aware memory retention.

## Event and Interruption Rules
- Use an explicit state machine: `IDLE`, `LISTENING`, `TRANSCRIBING`, `THINKING`, `SPEAKING`, `INTERRUPTED`, `ERROR`.
- Support press-to-talk first, then opt-in voice activation. If always-listening is enabled, show a visible indicator.
- Voice interruptions must stop playback and cancel queued TTS/animations. Do not accumulate stale replies.
- Prevent the app from transcribing its own TTS through device selection, playback suppression, echo control, and VAD gating.
- Model gesture playback as time-tagged events and blend from idle; avoid hard cuts. Motions only exist if the chosen rig has appropriate parameters/assets.

## Personality and Memory Rules
- Store core identity, boundaries, speaking style, humor guardrails, language preferences, and catchphrases in a version-controlled original `character/persona.yaml`. Re-apply on EVERY request.
- Maintain a bounded recent conversation window and durable summary; retrieve specific relevant memory facts instead of dumping whole history.
- Separate memory from speculative assistant outputs. Label unconfirmed facts, timestamps, provenance, and contradictions.
- Long-term memory must be inspectable, editable, exportable, and deletable through the UI.
- Do not equate RAG or memory retrieval with training model weights. The app can learn user preferences without secretly retraining.
- In all languages avoid repetitive assistant clichés, unwanted self-descriptions, and excessive catchphrases. Make responses concise by default, responsive to user emotion, and original—not imitation of a VTuber.

## Live2D Controls
- Implement idle breathing/sway/blink/eye tracking using only available model parameters.
- Derive lip motion from actual synthesized audio. Add visemes/phonemes if TTS timing metadata is available.
- Create a semantic map for waves, pointing, embarrassment, laugh, shy, thought, excitement and surprise; if unsupported by model, degrade to existing expression or head motion.
- Gesture scheduler must use easing/blending, random subtle variation, cooldowns, and return-to-idle.
- Add tray menu: Show/Hide, Always on Top, Click Through, Mic On/Off, Push to Talk, Reset Position, Open Settings, Quit.
- On startup revalidate saved window coordinates against currently connected monitor geometry.

## MVP Delivery Order
1. Scaffold desktop shell and secure Python local backend.
2. Display a licensed free Live2D sample in transparent draggable overlay; working tray controls.
3. Connect Ollama and local text chat; versioned persona consistency tests.
4. Add mic permission UI, Silero VAD and multilingual Whisper STT.
5. Add OmniVoice local TTS and audio-driven lip sync; test English, Filipino and Taglish.
6. Add conversational barge-in, state machine, captions, and gesture timing.
7. Add SQLite conversation persistence and memory editing, then integrate self-hosted Hindsight.
8. Add opt-in OpenViking local documents and OpenJarvis desktop tools.
9. Add performance controls, full offline QA, packaging and Windows installer.

## Acceptance Tests
- Disable internet or firewall outbound access. Following one-time preloading, a complete spoken English/Filipino/Taglish conversation and restart-memory recall still work; check for zero unintended external requests.
- Character persona remains consistent across 50+ turns, topic switches, memory retrieval, and restarts.
- The app visibly indicates microphone capture and handles denied permission, disconnected microphones, and push-to-talk without crashing.
- `SPEAKING` can be interrupted immediately; stale queued speech and gestures stop.
- The avatar can be dragged, hidden, re-shown, set topmost/click-through, and restored after monitor changes.
- Missing gesture rig assets fall back gracefully; missing optional servers do not block basic conversation.
- Review local latency (speech-end → first audible reply), CPU/RAM/VRAM peak, language recognition, voice naturalness and pronunciation using representative real-world clips.
- No user content, keys, or model weights are shipped in version control; licenses and attribution notices are respected.

## Recommended Upstream References (read docs; check versions/licenses)
- https://github.com/moeru-ai/airi
- https://github.com/Open-LLM-VTuber/Open-LLM-VTuber
- https://github.com/open-jarvis/OpenJarvis
- https://github.com/vectorize-io/hindsight
- https://github.com/volcengine/OpenViking
- https://github.com/Mintplex-Labs/anything-llm
- https://github.com/klikom/voicestudio
- https://github.com/k2-fsa/OmniVoice
- https://github.com/chidiwilliams/buzz
- https://github.com/microsoft/VibeVoice
- https://github.com/Edge0-AI/Audio8_TTS
- https://github.com/SYSTRAN/faster-whisper
- https://github.com/snakers4/silero-vad
- https://github.com/Live2D/CubismWebSamples
- https://github.com/fishaudio/fish-speech
- https://fish.audio/m/83c19893c4974594839bd2d101b1fd66/

## Guidance for Coding Agents
At the beginning of each task read this file, `docs/ARCHITECTURE.md`, `docs/ROADMAP.md`, and relevant tests. Implement the smallest working vertical slice. Update tests and docs alongside code changes. Use local models and real offline smoke tests as acceptance criteria. Prefer maintainable provider interfaces over hard dependencies on any app or web service. Do not silently add optional modules to the critical path. Report what was implemented, which tests were executed, and known limitations accurately. Never fabricate demo performance, model compatibility, license rights, or completion status.
