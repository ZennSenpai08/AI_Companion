# Sequential roadmap

## Current product direction and next gates (2026-11-14)

Mika is voice-first: multilingual input, **English-only replies**, floating avatar and
caption, optional controls/history. Current safe slice implements the text-only bubble
and protected policy/glossary. Qwen0.8 fails language/usefulness quality; replacements are
uninstalled. No quality, speech or avatar acceptance is inferred from these source changes.

Order from this checkpoint: (1) evaluate one approved small model for coherent bilingual
understanding with English replies; (2) native bubble/drag/pass-through QA; (3) consented
offline multilingual mic recognition; (4) benchmark licensed English TTS; (5) serialized
voice-to-voice with cancellation/echo prevention; (6) licensed Live2D and audio-driven lips;
(7) emotions/gestures; (8) advanced memory. Retain existing SQLite/history throughout.
Do not load several heavy speech/LLM services together on the 4 GB GPU. Measure each first.
The phase table below preserves the original phase IDs; this section controls near-term
execution priority. See BILINGUAL_ENGLISH_RESPONSES.md for the current test boundary.

| Phase | Acceptance gate | Status |
|---|---|---|
| 0 research | Hardware report, sources, license distinctions, decisions | IN PROGRESS |
| 1 foundation | Electron launches, authenticated health, failure recovery, no orphan child | IN PROGRESS — normal-Windows automation PASS; interactive sign-off pending |
| 2 desktop | Transparency, drag/resize, tray, bounds recovery, click-through and persistence | IN PROGRESS |
| 3 Live2D | Reviewed SDK/Core/sample, actual rendering and parameter fallbacks | BLOCKED |
| 4 local AI | Real Ollama streamed offline response and cancellation | IN PROGRESS |
| 5 persona | Original protected identity every turn, 50+ turn evaluation and restart | IN PROGRESS |
| 6 STT | Consented mic, Silero/faster-whisper, three-language device tests | NOT STARTED |
| 7 TTS | Licensed local voice, OmniVoice benchmark, cancellation and language evaluation | BLOCKED |
| 8 voice pipeline | Real end-to-end speech, feedback suppression, barge-in and measured latency | NOT STARTED |
| 9 memory | Approved facts persist, CRUD/export/delete and bounded retrieval | IN PROGRESS |
| 10 emotion | Schema validation, serious-context behavior and safe fallbacks | NOT STARTED |
| 11 animation | Real audio lip sync, blended supported gestures, interruption | NOT STARTED |
| 12 language | LLM/STT/TTS evaluated in English/Filipino/Taglish | NOT STARTED |
| 13 knowledge | Optional local OpenViking, hostile-document boundary | NOT STARTED |
| 14 tools | Optional OpenJarvis, per-tool permission and revocation | NOT STARTED |
| 15 UX | Complete settings and accessible recovery | IN PROGRESS |
| 16 performance | Actual latency/resources measured and optimized | NOT STARTED |
| 17 offline QA | Network-isolated spoken/restart tests and security checks | NOT STARTED |
| 18 release | Packaged backend, installer run, licenses, manuals | NOT STARTED |

Blocked acceptance gates remain open. Work independent of a blocker may proceed with an
explicit record; later scaffolding never implies earlier phases passed.

Latest Phase 1 evidence: supervised FastAPI and the actual normal-Windows Mika smoke pass,
including both visible secure Vue mounts, preload/IPC/backend and graceful cleanup. Full
typecheck/lint, 48 Node and 50 Python tests pass. Interactive dev exit source, manual drag/
tray/physical click-through and restart placement await confirmation; agent-native/build
restrictions are separate. Review docs/DESKTOP_FOUNDATION_VERIFICATION.md before final
desktop sign-off. Next real text inference is planned in OLLAMA_INTEGRATION_READINESS.md;
no model installation/inference was performed in this review. Avatar/voice gates stay open.

Persistent preferences now have actual API/restart tests and a Vue settings interface in
source. Optional SAPI enumerates installed voices and cancels safely, but synthesis is
denied in this process. OmniVoice, language, native settings and Live2D gates remain open.
