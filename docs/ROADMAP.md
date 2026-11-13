# Sequential roadmap

| Phase | Acceptance gate | Status |
|---|---|---|
| 0 research | Hardware report, sources, license distinctions, decisions | IN PROGRESS |
| 1 foundation | Electron launches, authenticated health, failure recovery, no orphan child | BLOCKED |
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

Latest Phase 1 evidence: real supervised FastAPI startup/authentication/persistence/restart/
shutdown checks pass. Normal-session native Electron startup, visible diagnostic content
and secure renderer pass. Vue dependencies/build, actual Mika integration and independently
verified graceful native shutdown still block completion. Later text/persona/memory
foundations are testable, but actual LLM/avatar/voice gates remain open.

Persistent preferences now have actual API/restart tests and a Vue settings interface in
source. Optional SAPI enumerates installed voices and cancels safely, but synthesis is
denied in this process. OmniVoice, language, native settings and Live2D gates remain open.
