# Current bilingual / voice-first milestone — 2026-11-14

Latest continuation from 2f82c3f: Qwen2.5 still absent; free RAM about 2.64 GiB after model
unload, below its 3 GiB policy. No candidate comparison/default recommendation is verified.
Fresh Qwen0.8 testing stopped before bilingual cases at 1.621 GiB free. Bubble smoke now
checks geometry/contrast/streaming at two sizes, but its execution and screenshots are
blocked by agent-native startup; browser-access host is also unavailable. Normal-Windows
native bubble QA is required. See docs/QWEN25_BUBBLE_VERIFICATION.md for exact commands.

- Protected English-only instructions are implemented, but real Qwen3.5 0.8B still emits
  broken Filipino and unreliable answers. A glossary is not a model-quality fix.
- qwen2.5:1.5b, gemma3:1b and qwen3:1.7b are not installed; no best-model comparison.
- Available RAM can fall below 2 GiB after loading the 0.8B model; the guard correctly
  refuses later turns. Thresholds are floors, not reservations; no warm bypass was added.
- New overlay bubble/input hit testing requires normal-Windows visual/physical QA.
  Agent-native execution remains restricted; preserve the working normal-user sandbox.
- Default Vite config bundling is denied in agent; native config-loader build works.
- Microphone, voice, actual Live2D and installer acceptance remain unverified/unimplemented.
  Full current evidence: docs/BILINGUAL_ENGLISH_RESPONSES.md. Historical notes below are
  superseded where they conflict with newer documented tests.

# Known issues

Latest status (2026-11-14) supersedes earlier unavailable-Ollama/build/native statements:
real 0.8B API inference, selection save, explicit unload and backend-restart persistence
PASS. Memory rejections correspond to actual available RAM below policy; future shortages
remain possible. Thresholds were preserved, diagnostics clarified and installed-only
selection implemented. Gemma 1B/Qwen 1.7B are absent and unbenchmarked. Qwen 0.8B remains
incoherent in Filipino/Taglish even in direct fresh tests; transport is not quality.
The 3000-byte context still evicts older complete turns; no durable summary exists.

New native selectors/unload require normal-Windows UI QA. Native startup remains separately
blocked in the agent; saved normal-session security/transport PASS remains valid. Vue
production build now passes with documented native config loading; default esbuild config
bundling is still denied by the agent's parent-directory read restriction. Packaged backend
must include the shared model_policy.json; no installer acceptance. See
docs/MODEL_SWITCHING_AND_MEMORY.md for exact limits, commands, sources and evidence.

Latest request repair: normal/smoke Python selection mismatch fixed in source and real
backend request tests. Ollama 0.40.16/0.8B is now available; actual backend inference and
SQLite restoration pass. Taglish/context quality remains weak. Updated native Vue-model
acceptance is pending normal-session rebuild/retest; agent build/native restrictions
persist. Old evidence timeout followed client-closed requests; new stage/interrupt handling
preserves failure evidence. See docs/LOCAL_REQUEST_CHAT_REPAIR.md; earlier blockers below
are historical. No additional models, security weakening or ACL modifications.

Current real-text milestone is BLOCKED by missing accessible Ollama/model and insufficient
free RAM. No genuine inference/language/performance result exists. New preflight and opt-in
actual Vue acceptance are implemented; docs/REAL_OLLAMA_TEST.md contains normal-session
commands. The new native test's UI branches require a real session. Python Ruff remains
unavailable. Current Node/backend totals are 50/55 passes (fixtures and local protocols).

Current desktop review: normal-Windows updated-launcher smoke PASS is confirmed by user
and the saved 23:20 UTC run, including graceful cleanup. The remaining desktop gates are
interactive dwell, exact dev exit source, physical controls/tray and restart placement.
See docs/DESKTOP_FOUNDATION_VERIFICATION.md. New logs identify quit source without changing
shutdown. Ollama readiness is preparation only: no current PATH entry/catalog response,
and measured free RAM 0.32 GiB is below the Lite guard. No model was loaded or downloaded.
Earlier status descriptions below preserve the restricted-agent/recovery history.

1. **Current recovery status supersedes the historical dependency blocker below.** The user
   supplied the lockfile/toolchain and production build. Electron's on-demand binary setup
   is now explicit; current runtime resolution passes. Agent build/dev cannot read parent
   directories through esbuild; native launch hits the runtime ACL fatal in this context.
   No permission changes are authorized or needed for the saved successful ordinary run.
   The saved actual Mika Vue/IPC/backend/secure-renderer/automated-exit run passes; updated
   launcher normal-session retest and manual desktop interaction remain pending.
   **Historical registry/toolchain issue:** The project npm
   cache is writable and DNS works; registry connection fails Windows 10013 and npm EACCES.
   No lockfile exists; vue-tsc 3.0.6 is declared but uninstalled. Lock-only preparation
   actually failed. Exact normal-user commands are in docs/FRONTEND_BUILD.md. A separate
   .venv-runtime now has a tested current FastAPI/Pydantic/Uvicorn/httpx stack recovered
   from the second local pip cache. Python 3.9 .venv remains a partial core-only environment.
   `node_modules` is a partial public-cache extraction; no full npm lock/build exists.
2. **Updated-launcher ordinary-session retest and manual interaction remain pending.**
   The saved actual Mika native run passes both Vue mounts/secure visibility, IPC/backend
   health and automated graceful shutdown. The older standalone probe's SIGTERM result
   remains inconclusive only for that run. Current agent native execution fails at its
   runtime ACL check; earlier agent token 49/87 is historical. No further ACL changes were
   attempted. The panel screenshot does not verify manual drag or transparent compositing.
3. **Release Python target missing.** Python 3.10.11 was discovered and now runs API
   tests in .venv-runtime. Python 3.9.13 is still on PATH and the registered 3.13 fails.
   Target Python 3.12 remains unavailable; release compatibility is not verified.
4. **Inference/speech/assets unavailable.** Ollama/FFmpeg not found; no neural checkpoints,
   Core or avatar provisioned. Installed Windows David/Zira voices are discoverable through
   optional pywin32 311. Actual Zira synthesis was attempted and denied (0x80070005).
   No speech audio or actual model/STT/microphone/Live2D/lip-sync acceptance passed.
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
   QA. Mic/PTT controls stay disabled. Persistent AI/language, volume and avatar preferences
   plus readiness/errors and memory search exist in source; Vue compilation is still blocked.
10. **No release installer.** Packaged backend, release dependency notices, clean-machine
    installation, full offline speech and performance acceptance remain open.
