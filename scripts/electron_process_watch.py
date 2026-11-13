"""Read-only, sampled process-tree observation for one Electron launch; no process control."""
import ctypes
import json
import sys
import time
from ctypes import wintypes as w
from pathlib import Path


class ProcessEntry(ctypes.Structure):
    _fields_ = [("dwSize", w.DWORD), ("cntUsage", w.DWORD), ("pid", w.DWORD),
                ("heap", ctypes.c_size_t), ("module", w.DWORD), ("threads", w.DWORD),
                ("parent", w.DWORD), ("priority", w.LONG), ("flags", w.DWORD),
                ("executable", w.WCHAR * 260)]


def processes():
    kernel = ctypes.WinDLL("kernel32", use_last_error=True)
    kernel.CreateToolhelp32Snapshot.argtypes = [w.DWORD, w.DWORD]
    kernel.CreateToolhelp32Snapshot.restype = w.HANDLE
    kernel.CloseHandle.argtypes = [w.HANDLE]
    for name in ("Process32FirstW", "Process32NextW"):
        getattr(kernel, name).argtypes = [w.HANDLE, ctypes.POINTER(ProcessEntry)]
    snapshot = kernel.CreateToolhelp32Snapshot(2, 0)
    if snapshot == ctypes.c_void_p(-1).value:
        raise ctypes.WinError(ctypes.get_last_error())
    entry = ProcessEntry()
    entry.dwSize = ctypes.sizeof(entry)
    try:
        available = kernel.Process32FirstW(snapshot, ctypes.byref(entry))
        result = []
        while available:
            result.append({"pid": entry.pid, "parent": entry.parent,
                           "executable": entry.executable})
            available = kernel.Process32NextW(snapshot, ctypes.byref(entry))
        return result
    finally:
        kernel.CloseHandle(snapshot)


def main():
    root_pid = int(sys.argv[1])
    destination = Path(sys.argv[2]).resolve()
    project = Path(__file__).resolve().parents[1]
    if project / "test-artifacts/electron-startup" not in destination.parents:
        raise ValueError("Observer output must stay within project investigation artifacts")
    known, observed = {root_pid}, {}
    start, samples = time.monotonic(), 0
    while time.monotonic() - start < 18:
        snapshot = processes()
        samples += 1
        for _ in range(8):
            for process in snapshot:
                if process["pid"] == root_pid or process["parent"] in known:
                    known.add(process["pid"])
                    observed.setdefault(process["pid"], {**process, "first_seen_s": round(
                        time.monotonic() - start, 3)})
        if not any(process["pid"] == root_pid for process in snapshot):
            break
        time.sleep(0.02)
    # Allow normal Chromium children to finish after the browser process exits.
    deadline = time.monotonic() + 1
    remaining = [process for process in processes() if process["pid"] in known]
    while remaining and time.monotonic() < deadline:
        time.sleep(0.02)
        remaining = [process for process in processes() if process["pid"] in known]
    report = {"root_pid": root_pid, "samples": samples, "processes": list(observed.values()),
              "remaining_observed_pids": [process["pid"] for process in remaining],
              "scope": "Sampled PID/parent/executable names only; short-lived processes may "
                       "be missed. Renderer/GPU roles require app metrics or Chromium logs."}
    destination.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
