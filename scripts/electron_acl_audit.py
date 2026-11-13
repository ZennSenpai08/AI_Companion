"""Read-only Electron access diagnosis. No impersonation or filesystem ACL writes.

Reproduce the upstream initial sandbox token shape on a disposable in-memory copy;
only AccessCheck consumes it. Proposed ACEs are evaluated on memory descriptors only.
Requires the existing optional pywin32 development dependency on Windows.
"""
import ctypes
import json
import os
import uuid
from ctypes import wintypes as w
from datetime import datetime, timezone
from pathlib import Path

import win32api
import win32con
import win32security as security

ROOT = Path(__file__).resolve().parents[1]
READ = 0x120089
SECURITY_INFO = 1 | 2 | 4 | 16  # owner, group, DACL, mandatory label (not audit SACL)


class GenericMapping(ctypes.Structure):
    _fields_ = [(name, w.DWORD) for name in ("read", "write", "execute", "all")]


def access_check(descriptor, token, desired_access=READ):
    api = ctypes.WinDLL("advapi32", use_last_error=True)
    api.AccessCheck.argtypes = [w.LPVOID, w.HANDLE, w.DWORD, ctypes.POINTER(GenericMapping),
                                w.LPVOID, ctypes.POINTER(w.DWORD), ctypes.POINTER(w.DWORD),
                                ctypes.POINTER(w.BOOL)]
    api.AccessCheck.restype = w.BOOL
    binary = ctypes.create_string_buffer(bytes(descriptor))
    mapping = GenericMapping(READ, 0x120116, 0x1200A0, 0x1F01FF)
    privileges = ctypes.create_string_buffer(16384)
    length, granted, allowed = w.DWORD(len(privileges)), w.DWORD(), w.BOOL()
    if not api.AccessCheck(binary, int(token), desired_access, ctypes.byref(mapping), privileges,
                           ctypes.byref(length), ctypes.byref(granted), ctypes.byref(allowed)):
        raise ctypes.WinError(ctypes.get_last_error())
    return {"allowed": bool(allowed.value), "granted_mask": hex(granted.value)}


def sid_text(sid):
    return security.ConvertSidToStringSid(sid)


def audit():
    runtime = ROOT / "node_modules/electron/dist"
    resource = runtime / "icudtl.dat"
    process = security.OpenProcessToken(win32api.GetCurrentProcess(), win32con.TOKEN_ALL_ACCESS)
    derived = original_impersonation = derived_impersonation = None
    try:
        user = security.GetTokenInformation(process, security.TokenUser)[0]
        groups = security.GetTokenInformation(process, security.TokenGroups)
        # Chromium USER_RESTRICTED_SAME_ACCESS: user plus all non-integrity group SIDs,
        # no denied groups or removed privileges, then LOW integrity on the copy only.
        restricting = [(user, 0)] + [(sid, 0) for sid, flags in groups if not flags & 32]
        derived = security.CreateRestrictedToken(process, 0, [], [], restricting)
        security.SetTokenInformation(derived, security.TokenIntegrityLevel,
                                     (security.ConvertStringSidToSid("S-1-16-4096"), 32))
        original_impersonation = security.DuplicateToken(process, security.SecurityImpersonation)
        derived_impersonation = security.DuplicateToken(derived, security.SecurityImpersonation)
        descriptor = security.GetNamedSecurityInfo(str(resource), security.SE_FILE_OBJECT,
                                                   SECURITY_INFO)
        sddl = security.ConvertSecurityDescriptorToStringSecurityDescriptor(
            descriptor, security.SDDL_REVISION_1, SECURITY_INFO)
        entries = []
        dacl = descriptor.GetSecurityDescriptorDacl()
        for index in range(dacl.GetAceCount()):
            kind_flags, mask, sid = dacl.GetAce(index)
            entries.append({"sid": sid_text(sid), "type": kind_flags[0],
                            "flags": kind_flags[1], "mask": hex(mask)})
        simulations = {}
        for label, sid in (("existing", None),
                           ("add_all_application_packages_read", "S-1-15-2-1"),
                           ("add_all_restricted_packages_read", "S-1-15-2-2"),
                           ("add_current_identity_read", sid_text(user))):
            candidate = security.GetNamedSecurityInfo(str(resource), security.SE_FILE_OBJECT,
                                                      SECURITY_INFO)
            if sid is not None:
                candidate_dacl = candidate.GetSecurityDescriptorDacl()
                candidate_dacl.AddAccessAllowedAceEx(
                    security.ACL_REVISION, 0, 0x1200A9, security.ConvertStringSidToSid(sid))
                candidate.SetSecurityDescriptorDacl(1, candidate_dacl, 0)
            simulations[label] = access_check(candidate, derived_impersonation)
            if label == "add_current_identity_read":
                simulations[label]["write_allowed"] = access_check(
                    candidate, derived_impersonation, 0x120116)["allowed"]
        with resource.open("rb") as handle:
            readable_bytes = len(handle.read(4))
        return {"executed_at": datetime.now(timezone.utc).isoformat(), "pid": os.getpid(),
                "resource": str(resource), "identity_sid": sid_text(user), "sddl": sddl,
                "dacl": entries, "current_token_access": access_check(
                    descriptor, original_impersonation),
                "ordinary_resource_read_bytes": readable_bytes,
                "original_restricting_sids": [sid_text(sid) for sid, _ in
                                              security.GetTokenInformation(
                                                  process, security.TokenRestrictedSids)],
                "derived_restricting_sids": [sid_text(sid) for sid, _ in
                                             security.GetTokenInformation(
                                                 derived, security.TokenRestrictedSids)],
                "simulations": simulations,
                "scope": "Memory-only descriptor/token copies; no impersonation, child launch, "
                         "filesystem ACL write or changes to current process token"}
    finally:
        for handle in (derived_impersonation, original_impersonation, derived, process):
            if handle is not None:
                handle.Close()


if __name__ == "__main__":
    report = audit()
    folder = ROOT / "test-artifacts/electron-startup"
    folder.mkdir(parents=True, exist_ok=True)
    name = "acl-audit-" + uuid.uuid4().hex[:8] + ".json"
    (folder / name).write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"artifact": str(folder / name), **report}, indent=2))
