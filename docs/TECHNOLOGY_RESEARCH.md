# Technology research — reviewed 2026-11-13

Sources are upstream documentation observed during this session, not compatibility tests.
No referenced application was cloned. No model weights, voices or avatars downloaded.
Versions not explicitly pinned below remain unselected; mutable upstream branches must
be pinned and re-reviewed before redistribution. Stars do not establish maintenance.

## Desktop and orchestration references

- [AIRI](https://github.com/moeru-ai/airi): MIT code; Windows desktop support, separate
  presentation and provider components. Reference for event orchestration only; no source
  or persona imported. Its broader integrations are unnecessary for the first slice.
- [Open-LLM-VTuber](https://github.com/Open-LLM-VTuber/Open-LLM-VTuber): local speech,
  interruption and Live2D references. MIT code, separately licensed assets. README says
  v2 is being planned and v1 gets bug fixes. Do not couple to changing internals.
- [Electron security](https://www.electronjs.org/docs/latest/tutorial/security) and
  [BrowserWindow](https://www.electronjs.org/docs/latest/api/browser-window): isolated
  preload, sender validation, denied navigation/permissions, transparent native windows.
- [Vue](https://vuejs.org/) + [Vite](https://vite.dev/guide/): selected renderer/build
  tools. Renderer has no direct filesystem or backend credentials. Builds ship locally.
- [FastAPI WebSockets](https://fastapi.tiangolo.com/advanced/websockets/): authenticated
  local event transport. Keep secrets out of URLs; Electron main supplies headers.

## TTS candidates

| Candidate | Verified upstream observation | Decision / unverified areas |
|---|---|---|
| [OmniVoice](https://github.com/k2-fsa/OmniVoice) | Python package 0.2.1 requires >=3.10; torch/torchaudio, Transformers >=5.3; voice design and nonverbal symbols; local model loading | First benchmark candidate. Sequential synthesis; streaming and expressive Filipino quality require measurement. Native Windows PyTorch path documented; not tested here. |
| [VoiceStudio](https://github.com/klikom/voicestudio) | Local multi-engine app and APIs; AGPL-3.0; README warns of desktop rewrite | Developer comparison only; avoid embedding another app or all engines. Model/tokenizer terms separate. |
| [Audio8](https://github.com/Edge0-AI/Audio8_TTS) | 0.6B Apache-2.0 family; compact 0.1B chiefly Chinese/English with separate weight terms; CPU ONNX streaming documented | No verified Filipino quality. Not installed; possible future Lite benchmark. |
| [VibeVoice](https://github.com/microsoft/VibeVoice) | MIT repository; multiple ASR/TTS variants with separate model cards | Not selected: Filipino TTS, weight terms and native Windows fit not verified. Streaming capability varies by model. |
| [Fish Speech](https://github.com/fishaudio/fish-speech) | Current README says Fish Audio Community License; S2-Pro remains Research License | Optional research only. Do not assume Apache/MIT or 4 GB GPU compatibility. |

[OmniVoice weights](https://huggingface.co/k2-fsa/OmniVoice) and
[language list](https://github.com/k2-fsa/OmniVoice/blob/master/docs/languages.md) are
available in public documentation; download availability was not tested. Filipino (`fil`) is listed, but this is not a Taglish benchmark. Original voice design avoids an unlicensed reference speaker. The current weight card
states CC-BY-NC, separately from Apache-2.0 code. Noncommercial evaluation only until
exact checkpoint terms and a commercially suitable alternative are resolved.
No claimed upstream real-time factor is treated as a result on this hardware.

[Pretty girl listing](https://fish.audio/m/83c19893c4974594839bd2d101b1fd66/)
provides hosted synthesis and audio output downloads; no permission to export its voice
weights or clone its identity was established. [Service terms](https://fish.audio/terms/)
do not establish those rights. It will not be used as a runtime provider or voice reference.

## Recognition

- [faster-whisper](https://github.com/SYSTRAN/faster-whisper): MIT, Python >=3.9,
  CTranslate2, CPU INT8 support and CUDA/cuDNN constraints. Use a local multilingual
  directory with downloads disabled. PyAV includes decoding libraries; standalone FFmpeg
  is not automatically required for this adapter. Small is the first evaluation size.
- [Silero VAD](https://github.com/snakers4/silero-vad): MIT repository and models;
  CPU ONNX possible, 8/16 kHz processing. Prefer a preloaded local ONNX file rather than
  a runtime torch.hub download. Capture/device behavior still needs testing.
- [Buzz](https://github.com/chidiwilliams/buzz): MIT offline transcription UI; comparison
  tool, not another service. No installation needed for production.

## Memory, knowledge and actions

- [Hindsight](https://github.com/vectorize-io/hindsight): MIT, retain/recall/reflect;
  local LLM providers available, database/service footprint. Start with SQLite. Its
  cloud-key quick start is unsuitable for this app's defaults. Air-gap setup untested.
- [OpenViking](https://github.com/volcengine/OpenViking): hierarchical retrieval; requires
  embedding/VLM configuration. Current main LICENSE is AGPL-3.0, not an assumed Apache
  license. Optional local-document experiment only; no default remote model endpoints.
- [OpenJarvis](https://github.com/open-jarvis/OpenJarvis): Apache-2.0, local agent/tools
  platform. Future opt-in adapter only after per-tool permissions, no shell by default.
- [AnythingLLM](https://github.com/Mintplex-Labs/anything-llm): MIT; extra UI/server/
  collector and optional cloud providers. Developer RAG diagnostics only, no runtime need.

## LLM

[Ollama](https://github.com/ollama/ollama) supports Windows and local streaming
[/api/chat](https://docs.ollama.com/api/chat). Restrict to 127.0.0.1:11434, disallow
redirects, proxies, :cloud tags and auto-pulls. [FAQ](https://docs.ollama.com/faq)
warns of automatic desktop updates; portable/manual installation and external firewall
isolation must be considered for full offline testing. Independently disable cloud in
Ollama. [Qwen3.5](https://ollama.com/library/qwen3.5) has 0.8B/4B/9B tags. Choose Lite
first because free RAM is critically low; do not select 9B by total RAM alone.
No local LLM has been run, so Filipino fluency/persona stability remain unevaluated.

## Live2D

[Web manual](https://docs.live2d.com/en/cubism-sdk-manual/cubism-sdk-for-web/),
[official samples](https://github.com/Live2D/CubismWebSamples) and
[Hiyori](https://www.live2d.com/en/learn/sample/momose-hiyori/) were inspected.
Current sample README targets Cubism 5.3; Core is downloaded separately. Hiyori is an
older Cubism 3 sample candidate; verify against the chosen SDK/Core before use.
[Release licensing](https://www.live2d.com/en/sdk/license/) has specific AI/chatbot and
expandable-app provisions. Sample art, SDK framework and proprietary Core have separate
terms. No binary/asset redistribution approved. Keep Phase 3 open until local SDK/Core,
model notices and actual rendering are verified. Missing rig gestures must fall back.

## Creative references and research limits

The supplied [Character.AI page](https://character.ai/chat/YwnJNp8m1fugDUVCGcf2Bx2chRq9XTXYu1QHSBUN07U)
exposes a fictional character greeting, not architecture or voice rights. No identity,
greeting or catchphrases copied. [Pan's channel](https://www.youtube.com/@PanVTuber)
returned no usable transcript; the streams were not watched or analyzed. General Taglish
style will be original and evaluated by human speakers, not attributed to a creator.
Neuro-sama and Ninomae Ina'nis are experience references only; no proprietary code,
art, scripts, voice or personality profile imported.
