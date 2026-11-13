"""Isolated Windows COM helper. No shell, audio-device playback or downloaded voices."""
import base64
import json
import os
import sys
import threading
import time


def main():
    request = json.loads(sys.stdin.buffer.readline(16385))
    if not isinstance(request, dict):
        raise ValueError("Invalid speech request")
    import pythoncom
    import win32com.client
    pythoncom.CoInitialize()
    engine = tokens = selected = memory = None
    try:
        engine = win32com.client.Dispatch("SAPI.SpVoice")
        tokens = engine.GetVoices()
        descriptions = [{"name": tokens.Item(index).GetDescription(),
                         "language": tokens.Item(index).GetAttribute("Language"),
                         "gender": tokens.Item(index).GetAttribute("Gender")}
                        for index in range(tokens.Count)]
        if request.get("operation") == "voices":
            print(json.dumps({"voices": descriptions, "engine": "windows-sapi"}), flush=True)
            return 0
        text, name, rate = request.get("text"), request.get("voice"), request.get("rate", 0)
        if (request.get("operation") != "synthesize" or not isinstance(text, str)
                or not text.strip() or len(text) > 1000
                or not isinstance(rate, int) or isinstance(rate, bool) or not -3 <= rate <= 3):
            raise ValueError("Invalid synthesis request")
        selected = next((tokens.Item(index) for index in range(tokens.Count)
                         if tokens.Item(index).GetDescription() == name), None)
        if selected is None:
            raise ValueError("Installed voice unavailable")
        engine.Voice = selected
        engine.Rate = rate
        memory = win32com.client.Dispatch("SAPI.SpMemoryStream")
        memory.Format.Type = 18  # 16 kHz / signed 16-bit / mono PCM, official SAPI enum.
        engine.AudioOutputStream = memory
        # Read the raw pipe descriptor rather than a buffered Python stream, so a
        # daemon parent-watch cannot hold stdin's buffered-reader lock during exit.
        threading.Thread(target=lambda: (os.read(sys.stdin.fileno(), 1), os._exit(2)),
                         daemon=True).start()
        start = time.monotonic()
        # Synchronous COM runs in this isolated child. The parent owns the deadline and
        # kills this process on cancellation; input is plain text, never XML or a file.
        engine.Speak(text, 16)
        pcm = bytes(memory.GetData())
        if not pcm or len(pcm) > 3840000 or len(pcm) % 2:
            raise ValueError("Invalid generated audio")
        print(json.dumps({"pcm_base64": base64.b64encode(pcm).decode("ascii"),
                          "sample_rate": 16000, "channels": 1, "sample_width": 2,
                          "voice": name, "generation_s": time.monotonic() - start,
                          "engine": "windows-sapi"}), flush=True)
        return 0
    finally:
        memory = selected = tokens = engine = None
        pythoncom.CoUninitialize()


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as error:
        values = getattr(error, "excepinfo", None)
        denied = bool(values and len(values) > 5 and values[5] == -2147024891)
        print(json.dumps({"error": "ENGINE_ACCESS_DENIED" if denied else "ENGINE_UNAVAILABLE"}),
              flush=True)
        sys.exit(1)
