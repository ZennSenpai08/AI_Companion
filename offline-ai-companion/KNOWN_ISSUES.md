# Known issues

1. **Managed environment blocks runtime dependencies.** External shell sockets are denied;
   FastAPI/httpx/Uvicorn/Pydantic, Vue/Vite/vue-tsc and Ruff are not installed. `node_modules`
   is only a partial public-cache verification extraction. No full dependency lock exists.
2. **Electron native launch fails before application code.** Cached 45.3.0 runtime reports
   sandbox install-directory ACL failure. A workspace-only ALL APPLICATION PACKAGES read
   grant succeeds and is visible, but the fatal error persists. Renderer sandbox is enabled.
   No native desktop screenshot or successful startup report exists.
3. **Python target missing.** Only Python 3.9.13 launches; registered 3.13 is unusable.
   Target Python 3.12. OmniVoice needs >=3.10 and a separate heavy speech environment.
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
   persona behavior or Filipino fluency evaluation. WebSocket voice transport is pending;
   current text transport is HTTP NDJSON. Voice activation/barge-in is not implemented.
9. **Desktop/UX unverified.** Tray, transparency, resizing, click-through, native export,
   real multi-monitor handling, full IPC, accessible interaction and Vue layout need runtime
   QA. Mic/PTT controls stay disabled. Most advanced settings are not implemented.
10. **No release installer.** Packaged backend, release dependency notices, clean-machine
    installation, full offline speech and performance acceptance remain open.
