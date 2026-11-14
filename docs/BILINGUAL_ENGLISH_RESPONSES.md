# Bilingual understanding, English replies — 2026-11-14

## Scope and current result

Continues checkpoint 529de0d and the existing uncommitted overlay work. No framework,
database, Git metadata, ACL or sandbox replacement. No weights downloaded or removed.
The protected profile now requires English responses to English/Filipino/Tagalog/Taglish
input. **This is an instruction, not a guaranteed language filter. Qwen3.5 0.8B still
violates it in real testing. This milestone has not passed conversational quality.**

Only qwen3.5:0.8b is installed (Ollama 0.40.16, Q8_0, 1,322,069,277 bytes). Fresh readiness
checks for all three requested candidates returned MODEL_NOT_INSTALLED before inference.
There is no empirically best candidate yet. Prefer evaluating qwen2.5:1.5b next after
explicit download approval; this recommendation is a test order, not a fluency claim.

| Candidate | Official download / quantization | Minimum free RAM policy | Measured here |
|---|---|---|---|
| qwen2.5:1.5b | 986 MB / Q4_K_M | 3 GiB, provisional conservative setting | Not installed |
| gemma3:1b | 806 MB / Q4_K_M | Existing 2 GiB guard, not validated for this model | Not installed |
| qwen3:1.7b | 1.4 GB / Q4_K_M | Existing 3 GiB guard, not validated | Not installed |
| qwen3.5:0.8b | Installed 1.322 GB / Q8_0 | Existing 2 GiB guard | Real inference, quality FAIL |

Sources checked 2026-11-14: [Qwen2.5 catalog](https://ollama.com/library/qwen2.5:1.5b),
[Gemma catalog](https://ollama.com/library/gemma3:1b),
[Qwen3 catalog](https://ollama.com/library/qwen3:1.7b).
Download size is neither required RAM nor peak VRAM. Qwen2.5/Qwen3 listings identify
Apache-2.0; Gemma has separate Gemma Terms. Exact installed metadata/license must be
recorded again before redistribution. Catalog multilingual claims do not establish slang
comprehension or English-only instruction following on these small variants.

## Changes and configuration

- `character/persona.yaml`: replaces language matching with English-only replies,
  bilingual comprehension and precise useful task following. Other original identity,
  humor, serious-topic boundaries and memory policy remain protected.
- `backend/personality/persona.py`: all four existing language values now mean **input
  hints**. Existing SQLite preference values survive unchanged; no database migration or
  conversation deletion. UI labels explain this change. There is one system message per
  turn; retrieved data and history cannot edit the versioned profile.
- `character/filipino_expressions.json`: ten editable, original short definitions.
  `glossary.py` matches whole expressions in the current input, case-insensitively,
  with flexible whitespace. At most three entries / 480 serialized UTF-8 bytes. No
  embeddings, translation service or network. Missing/malformed optional data falls back
  to ordinary comprehension. Definitions are data in a user-role reference block,
  never system instructions. Ambiguous meanings are preserved rather than guessed.
- Context stays capped at 3000 serialized UTF-8 bytes, 12 recent messages in complete
  user-led turns, 4096 model context tokens and 512 output tokens. Persona and current
  input take priority. Relevant approved memory is bounded; glossary is omitted if it
  cannot fit. Glossary/history may be evicted under this bound; there is no semantic
  memory or new summarization model.
- Shared `model_policy.json` adds qwen2.5:1.5b to the installed-compatible selector.
  The saved/default Qwen0.8 selection is not silently changed to an absent model.
- `scripts/evaluate-conversation.py --bilingual` compares an English-only direct Ollama
  baseline, production Mika without glossary, and production Mika with glossary.
  Each case gets a fresh test database/history; recall alone has two turns. Seed 42,
  installed sampling defaults, thinking disabled; same context/output budget in all arms.
  `--case` / `--bilingual-mode` permit isolated diagnostics. RAM is checked before every
  request. Another resident model blocks a comparison; the script never pulls or kills it.
  Raw synthetic outputs, prompt bytes, prompt/profile/glossary evidence and metrics are
  stored only in ignored `test-artifacts/conversation-quality`.

## Actual evidence and memory limitations

`20261114T095515Z-bea1637b/results.json`: first direct English greeting completed:
“Hi there! How can I help you today?” (two sentences despite requesting one).
Cold load 10.122 s, first token 10.391 s, 77.025 tokens/s. Available RAM went from
2.919 GiB to 1.823 GiB; the next request was refused. Concurrent build/test activity
was present, so this is not an isolated inference memory measurement.

`20261114T095710Z-cd7d1a10/results.json`: repeat after build tools completed also stopped
before its second case, with 1,987,162,112 bytes (1.851 GiB) free and Qwen resident.
This confirms an intermittent resource limitation, not an erroneous unit conversion.

`20261114T095842Z-64646a65/results.json`: eight independent Mika+glossary cases completed.
Cold load 5.291 s, first token 5.531 s. Seven warm cases: first token 0.125–0.157 s;
generation 53.865–74.070 tokens/s. Whole-GPU samples were 1823–1831 MiB used of
4096 MiB; they include other GPU users. Available RAM started at 3.143 GiB, then
hovered near 2.00–2.05 GiB. Before recall it was 2,131,501,056 bytes (1.985 GiB),
so admission correctly stopped the run. These are snapshots, not process-isolated peaks.

Manual review of those eight outputs:

| Case | Observed result |
|---|---|
| English greeting | English, friendly, but more than the requested single sentence |
| Tired from studying (Tagalog) | Broken Filipino; English-only and useful-answer FAIL |
| lodi / omsim praise | Broken Filipino and invented interpretation; FAIL |
| charot / eme joke | English and recognized joking, but long and invented extra meanings |
| awit / lost code | English; suggested writing a poem instead of useful recovery advice; FAIL |
| literal awit (song) | Broken Filipino, not a clear answer; FAIL |
| sana all / gets mo | English, but misread the wish as wishing someone luck; FAIL |
| NameError debugging | English; incorrectly suggested `import total`; not a reliable fix |

Five of eight were predominantly English (quoted slang names excluded), but **none of
this is an acceptance score**. The suite stopped before recall/persona/serious/override
cases. The original full A/B run also stopped after one direct greeting, so there is no
complete paired glossary-benefit comparison. Historical direct-vs-Mika failures are in
MODEL_SWITCHING_AND_MEMORY.md; they must not be treated as new English-policy results.

An additional isolated **direct** Tagalog case completed in
`20261114T100213Z-817a9a6b/results.json` with the same English-only baseline and no Mika
persona/glossary. It began “Maaari kang pagsulat ng isang natural at clean Tagalog/Taglish
response” and continued with incoherent Filipino. Cold first token 5.453 s, 59.544 tokens/s.
This confirms the language failure also occurs outside Mika; it does not prove a particular
weights-versus-Ollama-runner cause or establish that every other model will behave better.

`test-artifacts/chat-trace/2026-11-14T10-04-14-090Z-0f01dca9/result.json`: the real
Node → FastAPI → Ollama path completed its English turn and the production presentation
snapshot matched streamed text exactly, audioActive=false. Client first delta 5.753 s,
57.533 tokens/s, free RAM 2.960 → 1.884 GiB. The next admission measured 1.87 GiB and
stopped the run; backend cleanup succeeded. **This run did not reach its unload/restart
checks and is FAIL overall**, not a new multi-turn/persistence/native acceptance pass.
SQLite/prompt consistency and cancellation regression tests use explicit fixture inference;
previous genuine multi-turn/restart results remain historical evidence only.

The 2 GiB limit is an admission floor, not a memory reservation. It permitted cold load
but did not guarantee a second turn. Do not credit back `/api/ps.size_vram` (about 545 MiB
here) as free system RAM; it does not represent the full observed GPU/RAM cost. No warm
bypass, threshold reduction, artificial exhaustion or forced process termination was
performed. For the next evaluation, close unnecessary applications normally and aim for
at least 4 GiB available before starting; this is a practical test headroom recommendation,
not a proven universal model minimum. Only one model should be resident; keep_alive remains
30 seconds and the existing explicit authenticated unload retains weights/history.

## Voice-first presentation retained

The current response is owned by Electron main and broadcast through narrow authenticated
IPC to both secure Vue windows. The overlay has a reusable streaming bubble beneath the
existing **placeholder** visual, multiline wrapping, scrolling, stop/dismiss controls,
and a persisted 12-second default hold time (0 keeps it visible). It moves with the same
window. Hover/focus keeps a visible reply readable; errors remain until dismissed.
Text is labelled as text, with audioActive=false and MIC OFF. No microphone capture.

Normal launch opens only the overlay; controls/history are opened explicitly. Switching
panel tabs no longer cancels main-owned generation. Cancellation updates both windows;
stale events cannot replace a newer response. Transparent areas request mouse pass-through;
explicit full-window click-through retains tray/shortcut recovery. These mechanics are
unit/type/build tested; **new physical click-through/drag and bubble layout require normal
Windows QA**. No true Live2D, lips, speech recognition or speech synthesis is claimed.

Future pipeline remains consented microphone → CPU VAD/STT → one local LLM → English TTS
→ bubble and licensed Live2D. Evaluate CPU-int8 multilingual STT and serialized TTS/LLM
loading before enabling audio on 4 GB VRAM. No speech model RAM/VRAM fit is measured here.
Optional SAPI code existing in the repository does not establish working speech.

## Verification in ordinary Windows PowerShell

Final regressions: 66 Node, 70 Python and 70 process-network-guarded Python tests PASS;
Vue/Electron/core types and JS lint PASS; production native-loader Vite build PASS (28
modules). The expanded model-switch fixture initially retained a six-message assertion
after adding a fourth model turn; corrected to two per turn and reran all Python tests.
No application defect was inferred from that test expectation. See TEST_RESULTS.md for
failed/blocked native and default-build checks. The guarded tests use fixture inference
and do not establish system-wide network isolation for real models.

Run only installed models. If you choose to download the preferred candidate, the separate
explicit command is `ollama pull qwen2.5:1.5b` (approximately 986 MB); this task did not run it.
Do not run all candidate downloads. After confirming the model is installed and sufficient
RAM is available, use these commands from the project root:

```powershell
$env:MIKA_PYTHON = (Resolve-Path .venv-runtime/Scripts/python.exe).Path
ollama list
ollama ps
# Close Mika's active reply, then use its existing Unload control if another model is resident.
.venv-runtime/Scripts/python.exe scripts/evaluate-conversation.py --model qwen2.5:1.5b --bilingual
.venv-runtime/Scripts/python.exe scripts/evaluate-conversation.py --model qwen2.5:1.5b --stability-only
$env:MIKA_TEST_MODEL = 'qwen2.5:1.5b'
npm run ollama:check
npm run test:chat-api -- --verify-unload
npm run build
npm run test:desktop
npm run test:chat-real
Remove-Item Env:MIKA_TEST_MODEL
npm run dev
```

Select the installed model in Controls/history → settings and save. Verify progressive
English text beneath the placeholder, Stop, dismiss/hold-time changes, opening/closing the
optional panel, drag, pass-through, tray recovery and Quit. Real-chat smoke now records
the bubble DOM/current-response match and requires it for native chat acceptance; it also
saves an overlay screenshot. A successful backend-only trace is not a native UI pass.
Do not run model benchmarks concurrently with builds or other model runners.
