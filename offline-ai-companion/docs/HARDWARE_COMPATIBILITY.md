# Hardware compatibility

Initial preset: Lite, with inference disabled until a free-memory check succeeds.
These are engineering budgets to evaluate, not measured performance guarantees.

| Preset | Candidate LLM | STT candidate | Policy |
|---|---|---|---|
| Lite | qwen3.5:0.8b | multilingual small, CPU INT8 | 4096 context, one model task at a time |
| Balanced | qwen3.5:4b | multilingual small CPU INT8 | 4096 context; benchmark partial GPU offload |
| High Quality | qwen3.5:9b | medium or large-v3-turbo | Requires larger verified memory headroom |

[Ollama's catalogue](https://ollama.com/library/qwen3.5) lists approximately 1.2–1.3 GB
for 0.8B, 3.3–4.0 GB for 4B, 6.6–7.6 GB for 9B. Download size excludes KV cache,
activations, STT, TTS, desktop and OS memory. A 4 GB GPU cannot be assumed to fit all
three inference systems. Never auto-pull models. Check free disk and RAM first.

Target Python 3.12 x64. Python 3.9 is only a temporary platform for dependency-free
foundation tests. OmniVoice requires >=3.10. Upgrade before speech installation.
No end-to-end latency, voice quality or GPU fit has been measured on this machine.

The current text adapter caps serialized prompt data at 3000 UTF-8 bytes before
inference (including protected identity), with a 4096-token context and 512-token output
cap. This conservative bound can reject long messages; it is not a measured tokenizer
budget. The desktop also requires 2/6/10 GiB free RAM for 0.8B/4B/9B attempts respectively.
These admission thresholds are provisional engineering limits, not proven hardware fit.
