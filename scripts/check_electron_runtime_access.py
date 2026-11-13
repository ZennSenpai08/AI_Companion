"""Controlled I/O under an additional LOW/restricted token in this disposable helper.

The current process token is never replaced. Only this helper's thread temporarily uses
a further-restricted copy for fixed runtime reads and one nonce-named CREATE_NEW attempt.
It reverts immediately, never launches with that token, and never modifies any ACL.
"""
import json
import uuid
from pathlib import Path

import pywintypes
import win32api
import win32con
import win32file
import win32security as security

from scripts.electron_acl_audit import access_check

ROOT = Path(__file__).resolve().parents[1]


def check_access():
    runtime = ROOT / "node_modules/electron/dist"
    if runtime.resolve() != runtime:
        raise ValueError("Runtime path is redirected")
    original = security.OpenProcessToken(win32api.GetCurrentProcess(), win32con.TOKEN_ALL_ACCESS)
    copy = impersonation = parent = None
    candidate = runtime / (".mika-restricted-write-test-" + uuid.uuid4().hex + ".tmp")
    created = False
    try:
        user = security.GetTokenInformation(original, security.TokenUser)[0]
        groups = security.GetTokenInformation(original, security.TokenGroups)
        restricting = [(user, 0)] + [(sid, 0) for sid, flags in groups if not flags & 32]
        copy = security.CreateRestrictedToken(original, 0, [], [], restricting)
        security.SetTokenInformation(copy, security.TokenIntegrityLevel,
                                     (security.ConvertStringSidToSid("S-1-16-4096"), 32))
        impersonation = security.DuplicateToken(copy, security.SecurityImpersonation)
        parent = security.DuplicateToken(original, security.SecurityImpersonation)
        descriptor = security.GetNamedSecurityInfo(str(runtime), security.SE_FILE_OBJECT, 23)
        before = access_check(descriptor, parent, 0x120116)
        results = {}
        security.SetThreadToken(None, impersonation)
        try:
            active = security.OpenThreadToken(
                win32api.GetCurrentThread(), win32con.TOKEN_QUERY, True)
            try:
                results["active_thread"] = {
                    "identity_sid": security.ConvertSidToStringSid(
                        security.GetTokenInformation(active, security.TokenUser)[0]),
                    "integrity_sid": security.ConvertSidToStringSid(
                        security.GetTokenInformation(active, security.TokenIntegrityLevel)[0]),
                    "restricting_sids": [security.ConvertSidToStringSid(sid) for sid, _ in
                                         security.GetTokenInformation(
                                             active, security.TokenRestrictedSids)]}
            finally:
                active.Close()
            for filename, desired in (("electron.exe", win32con.GENERIC_READ |
                                       win32con.GENERIC_EXECUTE),
                                      ("icudtl.dat", win32con.GENERIC_READ)):
                handle = win32file.CreateFile(str(runtime / filename), desired, 7, None,
                                              win32con.OPEN_EXISTING, 0, None)
                try:
                    _, data = win32file.ReadFile(handle, 4)
                    results[filename] = {"opened": True, "read_bytes": len(data),
                                         "execute_access_requested": filename == "electron.exe"}
                finally:
                    handle.Close()
            try:
                handle = win32file.CreateFile(str(candidate), win32con.GENERIC_WRITE, 0, None,
                                              win32con.CREATE_NEW, 0, None)
                created = True
                handle.Close()
                results["write"] = {"denied": False}
            except pywintypes.error as error:
                results["write"] = {"denied": error.winerror == 5, "winerror": error.winerror}
        finally:
            security.RevertToSelf()
        after = access_check(descriptor, parent, 0x120116)
        results["parent_write_before"] = before
        results["parent_write_after"] = after
        results["parent_permissions_preserved"] = before == after
        results["scope"] = "Actual CreateFile/ReadFile on approved runtime only, using a "
        results["scope"] += "further-restricted LOW thread token in a separate helper; not "
        results["scope"] += "proof of an initialized Chromium renderer or native window."
        low_restricted = (results["active_thread"]["integrity_sid"] == "S-1-16-4096" and
                          bool(results["active_thread"]["restricting_sids"]))
        results["status"] = "PASS" if (results["write"]["denied"] and before == after
                                       and low_restricted) else "FAIL"
        return results
    finally:
        if created:
            candidate.unlink()  # Only the nonce-named file created by this test.
        for handle in (parent, impersonation, copy, original):
            if handle is not None:
                handle.Close()


if __name__ == "__main__":
    result = check_access()
    output = ROOT / "test-artifacts/electron-startup" / (
        "controlled-runtime-access-" + uuid.uuid4().hex[:8] + ".json")
    output.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(result, indent=2))
    raise SystemExit(0 if result["status"] == "PASS" else 1)
