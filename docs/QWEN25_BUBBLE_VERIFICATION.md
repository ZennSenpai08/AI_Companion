# Qwen2.5 readiness and native bubble verification — 2026-11-14

Continued checkpoint **2f82c3f**. Bundle verification and reference listing passed; it
contains complete history. Original Git metadata, databases, assets and earlier bundles
were preserved. No ACL changes, sandbox bypass, model download or model removal.

## Model comparison: BLOCKED, no winner

Fresh Ollama 0.40.16 catalog and final recheck contain **only qwen3.5:0.8b** (Q8_0,
1,322,069,277 bytes). qwen2.5:1.5b is absent. Its evaluator refused before inference with
MODEL_NOT_INSTALLED. At preflight, 2,829,041,664 bytes (2.635 GiB) RAM were available,
also below its unchanged 3 GiB admission floor. Listener remains 127.0.0.1:11434.
Free disk was about 117.4 GiB. No new default model is quality-approved; existing selection
is unchanged. Qwen2.5 remains the next evaluation candidate, not a proven improvement.

Actual artifacts:
- `test-artifacts/qwen25-bubble/checks/qwen25-readiness.txt`
- `test-artifacts/conversation-quality/20261114T101755Z-f1e26d97/results.json` (absent model)
- `test-artifacts/conversation-quality/20261114T101844Z-b1c5ab8a/results.json` (real 0.8B)

Fresh 0.8B Mika+glossary run generated exactly:
> Hello! 🖥️ What's on your mind? 😊

It is English, friendly, and fails the requested **one sentence** constraint. The next
Tagalog case was refused at 1,740,787,712 bytes (1.621 GiB) available RAM. Fresh English-only
output is 1/1 for this **English greeting only**; a bilingual success rate cannot be
computed from that. Filipino/Taglish/slang/debugging/recall/personality/serious cases were
not reached. Qwen2.5 success rate is **N/A**, not zero and not a simulated result.

For context only, the previous checkpoint's eight completed independent 0.8B cases had
five predominantly English outputs (62.5%, counting quoted slang names as English
explanations). That incomplete sample failed usefulness/comprehension: sana all was
misread as wishing someone luck, awit/lost-code prompted poem advice, and NameError
prompted an unjustified `import total`. It is not a fresh score or a valid replacement-model
comparison. Full prior outputs and methodology: BILINGUAL_ENGLISH_RESPONSES.md.

## Actual memory and timing

| Metric | Fresh observed result |
|---|---|
| Model cold load | 6.081 s |
| First generated text | 6.360 s |
| Generation throughput | 88.704 tokens/s, just 15 generated tokens; not a sustained benchmark |
| Warm latency / consecutive turns | Not measured: second request rejected by RAM guard |
| Available RAM before → after first turn | 2.718 → 1.627 GiB |
| GPU use after loading | 1822 MiB of 4096 MiB, whole-system snapshot |
| Subsequent real API test | Refused at preflight, under 2 GiB free |

A separate real supervised FastAPI run exercised the **existing authenticated unload**:
`test-artifacts/qwen25-bubble/unload-1794651556946/result.json`. Before unload, Qwen was
resident; afterward `/api/ps` was empty. Available RAM rose from 1,706,594,304 to
2,830,278,656 bytes (1.589 → 2.636 GiB); GPU usage fell from 1822 to 150 MiB. The isolated
empty test history was unchanged and the backend stopped cleanly. This verifies unload
and cleanup, not multi-turn semantic recall or persistence of new real conversations.
Weights remained installed. No other model was loaded or automatically stopped.

These are snapshots affected by other processes, not model-only peak allocations. No RAM
measurement or admission defect was established. The 2/3 GiB policies remain intact. Aim
for more headroom (e.g. 4 GiB available before the next test), without treating that as a
guaranteed universal requirement. Close unwanted applications normally; do not kill user
processes or count resident GPU allocation as free RAM.

## Bubble status and verification changes

Source review confirms the bubble follows the placeholder in the same floating Vue
window; no textarea/history box exists in the overlay. Controls/history stays separate.
Text is escaped, wraps at long tokens, has bounded scrollable height, a nearly opaque
dark background, and explicit text/no-audio labels. Main owns response revision and
sequence; stale responses are rejected. Thinking works in the text path. Listening,
transcribing and speaking labels are reserved; no audio engine is active. The orb is
explicitly a placeholder, **not Live2D**.

New `electron/bubble-verification.cjs` runs only from the unpackaged native smoke branch.
It exercises the production presentation controller with conspicuously labelled
**synthetic layout text**, never claims model inference, and checks the real Vue DOM:
- thinking → partial text → completed multiline/long-token text;
- 360×560 and the allowed 240×300 window sizes;
- bubble below avatar bounds, controls and content inside the viewport;
- no horizontal overflow, long text scrollability, transparent host, no permanent chatbox;
- text and heading contrast at least 4.5:1 over both white and black desktop backdrops;
- 8-pixel native window movement while relative bubble position remains unchanged;
- MIC OFF; screenshots for both sizes.

The helper clears its synthetic caption and restores original bounds in `finally`, even
if renderer inspection fails. It adds no renderer permission or public IPC. Existing
real-chat smoke still separately requires genuine Ollama responses and bubble text matching.
Desktop acceptance now requires this layout report, not merely a mounted component.

**No new native visual pass.** Both desktop and real-chat smoke still terminate before
app-ready in the restricted agent with exit 2147483651 and the runtime sandbox ACL fatal.
Normal-Windows saved startup evidence remains valid for the earlier build; it does not
verify the new bubble. An attempted browser fixture view also failed because the browser
access host is unavailable. Its temporary loopback server was stopped and the listener
confirmed closed. No screenshot/layout measurements were fabricated. Physical transparent
compositing, pointer pass-through, dragging, DPI and multi-monitor behavior require manual QA.

## Files changed in this continuation

- `electron/bubble-verification.cjs`: bounded native layout/stream/movement evidence.
- `electron/main.cjs`: invoke that verification in the existing smoke-only branch.
- `scripts/desktop-acceptance.cjs`: require bubble layout evidence.
- `tests/node/bubble-verification.test.cjs`: geometry/contrast rejection and failure cleanup.
- `tests/node/desktop-acceptance.test.cjs`: update the explicitly synthetic report fixture.
- Development progress, test results, known issues and report: current evidence and blockers.

No frontend implementation, persona, model policy, dependency, backend inference or user
database changes were needed for this continuation. The added test does not constitute
native acceptance until executed successfully on Windows.

## Executed tests

69 Node tests PASS (7.713 s), 70 Python tests PASS (13.320 s), TypeScript and JS lint PASS.
Node tests include synthetic geometry/contrast/renderer-failure fixtures; Python integration
tests use fixture inference. Default `npm run build` failed at agent esbuild directory
access; the real Vite native-loader production build passed (28 modules, 1.83 s). Both native
smokes are BLOCKED as above. Real baseline suite is incomplete due to memory rejection;
the API test is blocked before a turn. The separate real authenticated unload check passed.
Command outputs are retained in `test-artifacts/qwen25-bubble/checks`.

## Ordinary Windows PowerShell commands

Run the native bubble test now; it does not need a language model:

```powershell
cd C:\Users\Romcill\Desktop\AI-PROJECT
$env:MIKA_PYTHON = (Resolve-Path .venv-runtime/Scripts/python.exe).Path
npm run typecheck
npm run lint:js
npm run build
npm run test:desktop
npm run dev
```

The smoke writes `bubble-layout-360x560.png`, `bubble-layout-240x300.png` and per-check
measurements under its newly printed `test-artifacts/electron-startup/mika-...` directory.
If `bubbleLayoutVerified` fails, inspect `desktop-smoke.json` → `bubbleLayout.sizes` and
the screenshots. This is distinct from startup, security or real-model failure.
In dev, open Controls/history explicitly; verify streaming text below the placeholder,
readability over your desktop, scrolling, resizing, dragging, Stop, dismiss, tray recovery
and Quit. Close Mika before benchmark tests to avoid competing sessions/resources.

Download **only** the requested candidate if you choose to provision it:

```powershell
ollama pull qwen2.5:1.5b
ollama list
ollama ps
```

Free sufficient RAM, stop any active reply, and unload another resident model using Mika's
existing explicit Unload control (do not delete weights). Then run one model at a time:

```powershell
$env:MIKA_TEST_MODEL = 'qwen2.5:1.5b'
npm run ollama:check
.venv-runtime/Scripts/python.exe scripts/evaluate-conversation.py --model qwen2.5:1.5b --bilingual
.venv-runtime/Scripts/python.exe scripts/evaluate-conversation.py --model qwen2.5:1.5b --stability-only
npm run test:chat-api -- --verify-unload
npm run test:chat-real
Remove-Item Env:MIKA_TEST_MODEL
```

Run the same evaluator for qwen3.5:0.8b after the other model has unloaded. It refuses
concurrent residency. Save all output JSON and review meanings/usefulness, not just quoted
slang or transport PASS. Select/save the winning **actually tested** model in Settings;
this task establishes no new default. Complete native bubble acceptance and coherent
bilingual English-output tests before microphone/STT, English TTS, voice cancellation,
resource scheduling and licensed Live2D/lip synchronization. None of those is operational.
