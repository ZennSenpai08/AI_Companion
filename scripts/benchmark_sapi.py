"""Benchmark installed local Windows voice generation, not quality or real conversation."""
import asyncio
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

if __package__:
    from backend.tts.provider import SpeechError
    from backend.tts.windows_sapi import WindowsSapiTTS
else:
    from backend.tts.provider import SpeechError
    from backend.tts.windows_sapi import WindowsSapiTTS


async def main():
    destination = Path(__file__).resolve().parents[1] / "test-artifacts/voice"
    destination.mkdir(parents=True, exist_ok=True)
    engine = WindowsSapiTTS()
    report = {"engine": "windows-sapi", "synthesis": "NOT RUN", "human_quality": "NOT EVALUATED",
              "languages": [], "scope": "Installed Windows voices only; no cloning/downloads"}
    try:
        voices = await engine.voices()
        report["voices"] = voices
        voice = next((item["name"] for item in voices if item["gender"] == "Female"), None)
        if voice is None:
            raise SpeechError("No installed feminine Windows voice is available.")
        samples = [("en", "Hello. Could you explain that in two steps?"),
                   ("fil", "Kamusta ka na? Ano ang ginagawa mo ngayon?"),
                   ("taglish", "Wait lang, nag-e-error na naman code ko.")]
        for language, text in samples:
            audio = await engine.synthesize(text, voice)
            filename = language + "-sapi.wav"
            (destination / filename).write_bytes(audio.wav)
            report["languages"].append({"language": language, "file": filename,
                                        "generation_s": audio.generation_s,
                                        "duration_s": audio.duration_s,
                                        "rtf": audio.generation_s / audio.duration_s})
        report["synthesis"] = "GENERATED; human pronunciation review pending"
    except SpeechError as error:
        report["synthesis"] = "BLOCKED"
        report["reason"] = str(error)
    (destination / "sapi-benchmark.json").write_text(json.dumps(report, indent=2) + "\n",
                                                     encoding="utf-8")
    print(json.dumps(report, indent=2))
    return 0 if report["synthesis"].startswith("GENERATED") else 1


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
