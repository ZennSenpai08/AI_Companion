"""Read-only Windows token inspection; no ACL, token or privilege changes."""
import ctypes
import json
import os
from ctypes import wintypes as w
from pathlib import Path


def inspect_context():
    adv = ctypes.WinDLL("advapi32", use_last_error=True)
    kernel = ctypes.WinDLL("kernel32", use_last_error=True)
    kernel.GetCurrentProcess.restype = w.HANDLE
    kernel.IsProcessInJob.argtypes = [w.HANDLE, w.HANDLE, ctypes.POINTER(w.BOOL)]
    kernel.LocalFree.argtypes = [w.LPVOID]
    kernel.CloseHandle.argtypes = [w.HANDLE]
    adv.OpenProcessToken.argtypes = [w.HANDLE, w.DWORD, ctypes.POINTER(w.HANDLE)]
    adv.GetTokenInformation.argtypes = [w.HANDLE, ctypes.c_int, w.LPVOID, w.DWORD,
                                        ctypes.POINTER(w.DWORD)]
    adv.ConvertSidToStringSidW.argtypes = [w.LPVOID, ctypes.POINTER(w.LPWSTR)]
    token = w.HANDLE()
    process = kernel.GetCurrentProcess()
    if not adv.OpenProcessToken(process, 8, ctypes.byref(token)):
        raise ctypes.WinError(ctypes.get_last_error())

    def info(kind):
        length = w.DWORD()
        adv.GetTokenInformation(token, kind, None, 0, ctypes.byref(length))
        buffer = ctypes.create_string_buffer(length.value)
        if not adv.GetTokenInformation(token, kind, buffer, length, ctypes.byref(length)):
            raise ctypes.WinError(ctypes.get_last_error())
        return buffer

    def number(kind):
        return int.from_bytes(info(kind).raw, "little")

    def sid(value):
        output = w.LPWSTR()
        if not adv.ConvertSidToStringSidW(value, ctypes.byref(output)):
            return "unavailable"
        try:
            return output.value
        finally:
            kernel.LocalFree(output)

    class SidAttributes(ctypes.Structure):
        _fields_ = [("sid", w.LPVOID), ("attributes", w.DWORD)]

    class Groups(ctypes.Structure):
        _fields_ = [("count", w.DWORD), ("groups", SidAttributes * 1)]

    def groups(kind):
        buffer = info(kind)
        count = w.DWORD.from_buffer(buffer).value
        entries = (SidAttributes * count).from_buffer(buffer, Groups.groups.offset)
        return [{"sid": sid(entry.sid), "attributes": entry.attributes} for entry in entries]

    try:
        in_job = w.BOOL()
        kernel.IsProcessInJob(process, None, ctypes.byref(in_job))
        integrity = info(25)
        return {"pid": os.getpid(), "tokenIsAppContainer": bool(number(29)),
                "tokenHasRestrictions": bool(number(21)), "elevated": bool(number(20)),
                "elevationType": number(18),
                "integritySid": sid(SidAttributes.from_buffer(integrity).sid),
                "restrictedSids": groups(11), "inJob": bool(in_job.value),
                "scope": "Read-only queries; no impersonation, privilege, ACL or token changes"}
    finally:
        kernel.CloseHandle(token)


if __name__ == "__main__":
    result = inspect_context()
    destination = Path(__file__).resolve().parents[1] / "test-artifacts/investigation"
    destination.mkdir(parents=True, exist_ok=True)
    (destination / "security-context.json").write_text(json.dumps(result, indent=2) + "\n",
                                                       encoding="utf-8")
    print(json.dumps(result, indent=2))
