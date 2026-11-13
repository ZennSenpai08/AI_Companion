# Known issues

1. **External downloads remain denied; Vue/Ruff are unavailable.** A separate
   .venv-runtime now has a tested current FastAPI/Pydantic/Uvicorn/httpx stack recovered
   from the second local pip cache. Python 3.9 .venv remains a partial core-only environment.
   `node_modules` is a partial public-cache extraction; no full npm lock/build exists.
2. **Electron native launch fails before application code.** Cached 45.3.0 runtime reports
   sandbox install-directory ACL failure. A workspace-only ALL APPLICATION PACKAGES read
   grant succeeds and is visible, but the fatal error persists. Renderer sandbox is enabled.
   No native desktop screenshot or successful startup report exists.
3. **Release Python target missing.** Python 3.10.11 was discovered and now runs API
   tests in .venv-runtime. Python 3.9.13 is still on PATH and the registered 3.13 fails.
   Target Python 3.12 remains unavailable; release compatibility is not verified.
4. **Inference/voice/assets absent.** Ollama/FFmpeg not found, no models/voice/Core/avatar
   provisioned. No real model, STT, TTS, microphone, Live2D or lip sync test has run.
5. **Critically low available RAM.** About 15.31 GiB total usable, 4 GiB GPU. At inspection
   only 0.07–0.11 GiB RAM free. No performance/VRAM-fit claims. Local text admission limits
   require 2/6/10 GiB free RAM for the selectable 0.8B/4B/9B candidates.
6. **Licenses unresolved for release.** OmniVoice code Apache-2.0, weights currently CC-BY-NC;
   OpenViking/VoiceStudio AGPL-3.0; Live2D Framework/Core/model/publication terms separate.
   No permission to clone/download Fish Pretty girl voice weights established.
7. **Privacy limits.** SQLite conversations/facts are readable and unencrypted. Secure-delete
   pragmas do not erase OS backups or forensic disk copies. There is no raw audio capture.
8. **Context/feature limits.** Lexical recall only; no durable summary or contradiction
   resolver. Conservative 3000-byte prompt bound can reject long messages. No actual
   persona behavior or Filipino fluency evaluation. Text states, deadlines and cancellation are tested; audio behavior is not. WebSocket
   voice transport is pending;
   current text transport is HTTP NDJSON. Voice activation/barge-in is not implemented.
9. **Desktop/UX unverified.** Tray, transparency, resizing, click-through, native export,
   real multi-monitor handling, native IPC, accessible interaction and Vue layout need runtime
   QA. Mic/PTT controls stay disabled. Most advanced settings are not implemented.
10. **No release installer.** Packaged backend, release dependency notices, clean-machine
    installation, full offline speech and performance acceptance remain open.
