"""Reproduce Windows nested-token creation outcomes without launching or impersonating.

Disposable tokens are closed immediately. No current token, filesystem ACL, privilege or
application sandbox policy is changed. A successful copy is not a native Electron test.
"""
import json
import uuid
from datetime import datetime, timezone
from pathlib import Path

import win32api
import win32con
import win32security as security


def audit():
    token = security.OpenProcessToken(win32api.GetCurrentProcess(), win32con.TOKEN_ALL_ACCESS)
    try:
        user = security.GetTokenInformation(token, security.TokenUser)[0]
        groups = security.GetTokenInformation(token, security.TokenGroups)
        original = [security.ConvertSidToStringSid(sid) for sid, _ in
                    security.GetTokenInformation(token, security.TokenRestrictedSids)]
        same = [(user, 0)] + [(sid, 0) for sid, flags in groups if not flags & 32]
        denied = [(user, 0)] + [(sid, 0) for sid, flags in groups
                                if not flags & 32 and not flags & 0xC0000000]
        null = security.ConvertStringSidToSid("S-1-0-0")
        world = security.ConvertStringSidToSid("S-1-1-0")
        results = {}
        cases = [("same_access", 0, [], same),
                 ("lockdown", 1, denied, [(null, 0)]),
                 ("missing_null", 0, [], [(null, 0)]),
                 ("existing_world", 0, [], [(world, 0)]),
                 ("null_with_existing_world", 0, [], [(null, 0), (world, 0)])]
        for name, flags, disabled, restricting in cases:
            try:
                copy = security.CreateRestrictedToken(token, flags, disabled, [], restricting)
                try:
                    results[name] = {"created": True, "restricting_sids": [
                        security.ConvertSidToStringSid(sid) for sid, _ in
                        security.GetTokenInformation(copy, security.TokenRestrictedSids)]}
                finally:
                    copy.Close()
            except Exception as error:
                results[name] = {"created": False, "winerror": getattr(error, "winerror", None),
                                 "error": str(error)}
        return {"created_at": datetime.now(timezone.utc).isoformat(),
                "identity_sid": security.ConvertSidToStringSid(user),
                "original_restricting_sids": original, "results": results,
                "scope": "Disposable token creation only. No token used for execution, "
                         "impersonation or filesystem access; no sandbox policy modified."}
    finally:
        token.Close()


if __name__ == "__main__":
    report = audit()
    folder = Path(__file__).resolve().parents[1] / "test-artifacts/electron-startup"
    folder.mkdir(parents=True, exist_ok=True)
    output = folder / ("token-audit-" + uuid.uuid4().hex[:8] + ".json")
    output.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"artifact": str(output), **report}, indent=2))
