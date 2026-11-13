# Speech and language evaluation — synthesis attempt BLOCKED

No recorded clips, neural synthesis model or licensed voice reference was provisioned.
No speech speed, naturalness, Filipino pronunciation or voice identity result is available.

An actual fallback diagnostic used installed Windows SAPI voices with pywin32 311.
Enumeration returned Microsoft David Desktop (male/en-US) and Microsoft Zira Desktop
(female/en-US). scripts/benchmark_sapi.py selected Zira and attempted plain-text memory
output. The engine returned access denied (inner COM HRESULT 0x80070005) before the first
English sample was produced. Filipino/Taglish samples were not reached. No WAV, listening
review, synthesis latency/RTF or emotional control was verified. No voice is redistributed.
Raw result: test-artifacts/voice/sapi-benchmark.json.

The optional adapter isolates COM in a fixed Python child with deadline, cancellation/EOF
cleanup and bounded PCM/WAV. Actual voice discovery and helper cancellation tests pass;
the format test explicitly uses fixture PCM. It is not activated in chat. Installed
English voices are not evidence of Filipino suitability. OmniVoice remains the initial
neural candidate, not installed or benchmarked due resource/dependency blockers.

Evaluate STT, LLM and TTS separately, then the full pipeline. Use licensed or consented
recordings only; keep raw private clips outside Git. Human Filipino/English speakers should
rate intelligibility, pronunciation, natural code-switching, warmth and serious-topic fit.
Record model revisions, device, thread count, RAM/VRAM, endpointing, STT, first token,
first audio and total latency. Upstream advertised RTF is not local evidence.

| Mode | Original/sample evaluation utterance | Status |
|---|---|---|
| English | Could you explain this error in two steps? | NOT STARTED |
| Filipino | Kamusta ka na? | NOT STARTED |
| Filipino | Uy, anong ginagawa mo? | NOT STARTED |
| Taglish | Wait lang, nag-e-error na naman code ko. | NOT STARTED |
| Taglish | Grabe naman, parang ayaw talaga gumana. | NOT STARTED |
| Switch | Can you explain this in Tagalog? | NOT STARTED |
| Switch | Speak English muna. | NOT STARTED |
| Switch | Okay, balik tayo sa Taglish. | NOT STARTED |
| Names | Pakibasa: Quezon, Marikina, at Jose. | NOT STARTED |
| Serious | Medyo pagod ako ngayon. Puwede bang tahimik muna? | NOT STARTED |

Compare OmniVoice first, using an original designed adult feminine voice or an explicitly
licensed consenting reference. Its weights currently carry noncommercial terms. Do not use
Fish Pretty girl recordings as cloning references. No emotional/streaming control is treated
as supported until the chosen checkpoint/API and output have been tested.
