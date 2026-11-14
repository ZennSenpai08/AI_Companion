# Model selection, RAM admission and real inference — 2026-11-14

## Diagnosis

The exact message originates in `electron/admission.cjs`, called by the
`mika:chat-start` handler in `electron/main.cjs` before opening a chat stream.
Previously the same threshold map and message were inline in main. `${requiredGiB}`
is a JavaScript template interpolation; saved Windows failures show the actual number 2.
It is Mika's intentional available-physical-RAM guard, not an Ollama error or a test timeout.
Admission is checked afresh every turn; there is no latched rejection state.

Saved real Windows resource evidence confirms legitimate shortages:

| Native run directory under test-artifacts/electron-startup | Available RAM snapshots |
|---|---|
| mika-2026-11-14T05-05-14-821Z-6a3941cb | 2.83 GiB initially, 1.78 GiB near second-turn rejection |
| mika-2026-11-14T05-13-15-953Z-6f2a8f6e | 2.03 GiB preflight, 1.81 GiB after desktop startup |

Preflight approval is a snapshot, not a memory reservation. Electron startup, model
residency and other processes can reduce available memory before a later request.
Snapshots cannot attribute every byte to Ollama. A subsequent normal-Windows run
`mika-2026-11-14T05-14-11-073Z-974bc459` completed its real turns, persistence and interruption
checks. Neither permanent failure nor permanent recovery is established.

Fresh cross-check: Node os.freemem() = 6,526,902,272 bytes; Windows
GlobalMemoryStatusEx available physical RAM = 6,545,891,328 bytes, total identical
16,438,312,960 bytes. Sequential observations differed by about 18.1 MiB.
There is no evidence of a GiB/unit or process-RSS measurement defect.
See `test-artifacts/conversation-quality/checks/ram-crosscheck.json`.

No admission threshold was reduced and warm residency grants no bypass. In the new
real run Ollama /api/ps reported 570,981,087 model VRAM bytes, whereas whole-GPU usage
rose by about 1,673 MiB. Residency metadata alone is insufficient to credit back all
runtime/draft/buffer allocations safely. No enormous OS memory-pressure experiment ran.

## Implemented repairs

- One versioned policy, `backend/llm/model_policy.json`, is read by Python and Electron.
  Provider/API/preferences/IPC/preflight use it instead of separate name lists.
- Both Vue selectors list compatible installed models. Absent selected preferences
  remain visibly unavailable; there is no silent model substitution or download.
- Before saving a model selection, the backend checks the local catalog and /api/show
  for GGUF weights without remote_host/remote_model. Real chat revalidates, covering
  weights removed since settings were opened. Unknown/cloud names remain refused.
- Switching/unloading is refused during generation. Selecting a model changes settings,
  not conversation history or the protected persona. Chat's selector is per-chat;
  Settings → AI and language → Save preferences persists the default in SQLite.
- Settings shows loaded models, context and reported model VRAM. Explicit confirmed
  **Unload from memory** uses Ollama's empty generate request with keep_alive=0;
  it does not delete weights, switch models or clear chat. There is no automatic unload.
- The guard now names the selected model, actual available GiB and required reserve.
  Dev/smoke diagnostics record admission numbers without prompts or credentials.
- Metadata bodies are bounded and total deadlines are enforced. Model-changing settings
  and unload IPC have a targeted 7.5 s bound for up to three 2 s metadata operations.
  Inference deadlines remain unchanged.

| Compatible policy entry | Minimum available RAM per request |
|---|---:|
| qwen3.5:0.8b | 2 GiB, unchanged |
| gemma3:1b | 2 GiB, conservative initial policy; unbenchmarked here |
| qwen3:1.7b | 3 GiB, conservative initial policy; unbenchmarked here |
| qwen3.5:4b | 6 GiB, unchanged |
| qwen3.5:9b | 10 GiB, unchanged |

This is a compatibility allowlist, not permission to run arbitrary installed weights.
The shared JSON must accompany a future packaged Python backend as well as Electron;
Electron's source packaging includes it. No packaged backend/installer is claimed.

## Actual local results

Ollama 0.40.16 listens only at 127.0.0.1:11434. Its catalog contains only
qwen3.5:0.8b, Q8_0, 1,322,069,277 bytes, digest
`de63045f29755d4721c09d54c9b45c2dadb644f4fd7d604d4cac90d96049971c`.
No model was installed, removed or retagged. RTX 2050, 4096 MiB, driver 595.79.

Actual production Node HTTP → authenticated FastAPI → Ollama streamed five consecutive
turns. `npm run test:chat-api -- --verify-unload` then saved the installed selection,
unloaded those weights through the new authenticated endpoint, verified /api/ps absence
and unchanged SQLite messages, restarted the backend and verified exact restored messages.
The supervised backend stopped. This is headless API evidence, not a new visible UI pass.

Evidence: `test-artifacts/chat-trace/2026-11-14T05-39-45-874Z-5186e000/result.json`.

| Measurement | Observed |
|---|---|
| Cold state | /api/ps empty before first request; OS file cache not flushed |
| Cold model load | 5.805 s |
| Cold first delta | 6.356 s client / 6.062 s provider |
| Warm first deltas, next four turns | 0.197–0.246 s client / 0.109–0.141 s provider |
| Generation | 52.515–70.944 tokens/s across the five turns |
| Available RAM | 5.84 GiB before cold load; 4.77–4.83 GiB after turns |
| Whole-GPU used | 113 MiB unloaded / 1,786 MiB loaded |
| Explicit unload | Free RAM 4.77 → 5.89 GiB; GPU used 1,786 → 113 MiB |
| Context/output/keepalive | 4096 tokens / 512 tokens / 30 s |

RAM/VRAM are whole-system snapshots, not isolated peak allocations. Sampling the GPU
at first delta adds observer overhead to service-level experiments; server durations
remain Ollama-reported. No speed claim for other models is made.

## Conversation quality and context

Prior work in this same continuation generated fresh direct-vs-Mika comparisons:
28 requests with seed 42, 32 with seed 7 (including serious conversation), and 16
with publisher non-thinking sampling. Full synthetic transcripts and model configuration:
`test-artifacts/conversation-quality/{20261114T052116Z-6a9d8d6d,20261114T052908Z-3b904067,20261114T053027Z-10e56585}/results.json`.

- English greetings work. Broken Tagalog/Taglish also occurs directly in Ollama without
  Mika, in fresh sessions. A direct Taglish answer was "Oo naghawa ang school! Ang layunin
  ba kay uwo?" Mika's fresh replies likewise remained incoherent.
- Debugging degraded with the full persona: one answer falsely called `total` a built-in
  function requiring an import. Direct replies sometimes correctly suggested initialization
  and scope checks. Low temperature/zero presence penalty did not reliably help; publisher
  sampling also failed the language cases. Production sampling remains unchanged.
- Exact raw Ollama replays of Mika's English, Tagalog and debugging prompts matched all
  three service outputs byte-for-byte. Stream parsing did not cause those failures.
- The protected profile appears once, first, intact; no summary replaces it. Its ~1.5 KB
  instructions affect this small model's outputs, but no contradictory hidden persona
  or incorrect role ordering was found in the fresh cases.
- A real context truncation defect was reproduced: an assistant answer could survive
  after its question was evicted. Fixed by retaining only complete user-led turns under
  the same 3000 serialized UTF-8 byte limit. Older turns may still be intentionally omitted;
  no durable summary or semantic memory engine is implemented.
- Three service turns survived SQLite reopening; the actual supplied `mango-47` fact
  was included in context and correctly recalled on turn three. A separately approved
  `turon` fact survived reopening, was lexically retrieved, included and recognized, but
  the model ignored "name only". Seed-7 Mika stock recall lost the `-47` despite its
  presence in context. Storage/retrieval success does not establish reliable semantic recall.
- Real provider cancellation after first delta yielded INTERRUPTED, retained no partial
  assistant row, and accepted a subsequent real request. Saved Windows UI interruption
  evidence remains separate from this service-level cancellation.

Additional evidence: `20261114T052752Z-65a7cbe8` (exact replays/recall) and
`20261114T053513Z-9f6a2fa3` (first-delta RAM/GPU snapshots) under conversation-quality.
In the latest API run Mika recalled `sampaguita` and identified herself as Mika, but
continued using malformed Filipino after switching to English. Quality remains FAIL.

The installed 0.8B package is suitable for transport diagnostics, not accepted for
the required conversational quality. These tests cannot isolate base weights from
Ollama runner/draft behavior; no second inference engine/quantization was benchmarked.

## Other candidates and verification commands

Gemma and Qwen 1.7B were **not installed**, so no real comparison is possible. A guarded
Gemma evaluation failed before inference, preserving a report at
`test-artifacts/conversation-quality/20261114T054015Z-d4152402/results.json`.
Official [Gemma 3 1B listing](https://ollama.com/library/gemma3:1b) gives ~806 MB Q4_K_M
and Gemma terms; [Qwen3 1.7B](https://ollama.com/library/qwen3:1.7b) gives ~1.4 GB Q4_K_M,
Apache-2.0. Both are plausible next controlled candidates on this hardware, with latency,
Tagalog fluency and personality quality still unmeasured. Larger capacity alone is no guarantee.
No download command is executed or required by these tests.

[Qwen's model card](https://huggingface.co/Qwen/Qwen3.5-0.8B) warns that increased presence
penalty can mix languages and that 0.8B thinking can loop. We retained think=false.
The installed Ollama defaults (temperature 1, top_p .95, presence 1.5) differ from its
non-thinking text suggestions; testing the suggestions did not repair the failures.
Ollama's official [chat](https://docs.ollama.com/api/chat) and
[model unloading](https://docs.ollama.com/faq#how-do-i-keep-a-model-loaded-in-memory-or-make-it-unload-immediately)
interfaces underpin the implementation.

Run in ordinary Windows PowerShell:

```powershell
cd C:\Users\Romcill\Desktop\AI-PROJECT
$env:MIKA_PYTHON = "$PWD\.venv-runtime\Scripts\python.exe"
ollama list
ollama ps
npm run typecheck
npm run lint:js
npm test
& $env:MIKA_PYTHON -m unittest discover -s backend/tests -v
npm run build
npm run test:desktop
npm run test:chat-real
npm run dev
```

In Settings refresh engines, select an installed model, save, then open Chat. Stop replies
before switching/unloading. Verify both selectors, persistence and the unload confirmation
in a real window; this updated UI still needs normal-session acceptance.
If needed, the documented Vite native loader compiles in this agent without ACL changes:
`node node_modules/vite/bin/vite.js build --configLoader native` (tested Node 22.18.0).

Explicit headless tests (the unload variant releases the tested shared Ollama model):

```powershell
npm run test:chat-api -- --verify-unload
& $env:MIKA_PYTHON scripts/evaluate-conversation.py --model qwen3.5:0.8b --stability-only
# Only AFTER independently installing a permitted model:
& $env:MIKA_PYTHON scripts/evaluate-conversation.py --model gemma3:1b
$env:MIKA_TEST_MODEL = 'gemma3:1b'
npm run test:chat-api
Remove-Item Env:MIKA_TEST_MODEL
```

Regression status: 62 Node and 65 Python tests PASS; full types/lint PASS. Default Vite
config bundling fails on agent parent-directory access; native-loader production build
PASS, 22 modules, after replacing config's CommonJS-only __dirname with import.meta.url.
Native desktop and real-UI tests remain BLOCKED in agent before app-ready by the existing
Electron runtime ACL check. No ACL/security changes made; saved normal-Windows PASS is
preserved. New switching, unload and rejection tests use labeled fixtures; Gemma inference
and updated visible controls are not claimed verified.

## Files changed in this milestone

- `backend/llm/{model_policy.json,models.py,readiness.py,ollama.py}`: shared policy,
  verified local availability, bounded residency metadata and explicit unload.
- `backend/core/{config.py,preferences.py}` and `backend/api/app.py`: consistent default,
  validated persisted choices, authenticated routes and active-turn protection.
- `electron/{admission.cjs,chat.cjs,http.cjs,main.cjs,preload.cjs}`: shared limits,
  actionable RAM errors, narrow unload IPC and bounded local requests.
- `frontend/src/components/{Chat.vue,EngineSettings.vue}` and `types/bridge.d.ts`:
  installed-only selectors, unavailable status, loaded-model information and unload control.
- `scripts/{ollama-check.cjs,trace-real-chat.cjs,evaluate-conversation.py}` and
  `electron/real-chat-test.cjs`, `scripts/desktop-smoke.cjs`: selected-model diagnostics,
  per-turn admission/resource evidence, real unload test and guarded comparisons.
- `backend/tests/{test_api.py,test_readiness.py,test_context_quality.py}`,
  `tests/node/admission.test.cjs`: switch/reject/busy/unload/context/sampling regressions.
- `backend/personality/persona.py`: preserves complete user-led history turns.
- `vite.config.ts`, `tsconfig.electron.json`, `package.json`: portable ESM config,
  typed shared JSON and inclusion of policy in Electron source packaging. No upgrade.
- Progress/test/known-issues/report/readiness/build/architecture/changelog documentation.

Existing unrelated working changes and all old test artifacts/checkpoints were preserved.
