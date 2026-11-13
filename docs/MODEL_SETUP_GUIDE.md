# Model setup guide — provisional

No model downloads are part of setup scripts. Close memory-heavy apps and verify available
RAM/disk with doctor before provisioning. No model has been downloaded or benchmarked here.

1. Install a working native Windows Ollama build from its official source. Bind to
   `127.0.0.1:11434`, disable cloud features (see current Ollama FAQ), and use an isolated
   environment for offline validation. Automatic desktop updates also require consideration.
2. First candidate: `qwen3.5:0.8b` (catalogue roughly 1.2–1.3 GB plus runtime memory).
   Pull deliberately during setup only, after checking space. 4B/9B are larger evaluation
   candidates, not proven fits for this machine. Never use :cloud tags.
3. Record the exact Ollama model digest, quantization, upstream license and download size.
   Code license does not establish weight rights. No weights belong in Git.
4. Confirm the local model answers independently, then start the desktop and choose that
   exact supported tag. The adapter only contacts the fixed loopback API and never pulls.
5. Disconnect outbound networking and verify real text before speech work. A model-not-found
   or resource error must remain visible; no hosted fallback is implemented.

STT candidate: local multilingual faster-whisper small, CPU INT8, preloaded Silero VAD.
TTS candidate: separately benchmark OmniVoice 0.2.1 on Python >=3.10 with all dependencies
and tokenizer weights prepared. Current OmniVoice weights are noncommercial per model card;
no commercially approved voice/model is selected. Original voice design or licensed
recordings only. No Fish hosted voice extraction/cloning. No speech installers exist yet.

Live2D is a separate asset/license gate described in assets/live2d/README.md. Do not load
Core from a CDN during runtime. See DEPENDENCY_LICENSES.md and VOICE_EVALUATION.md.
