"""Prepare (default), or explicitly apply, a narrowly scoped Electron runtime read grant.

Never invoked by app startup. --apply requires prior user authorization and an exact SID.
No parent ACL, owner, inheritance setting, existing ACE, or sandbox flag is changed.
"""
import argparse
import ctypes
import json
import re
import subprocess
import uuid
from datetime import datetime, timezone
from pathlib import Path

import win32api
import win32con
import win32security

ROOT = Path(__file__).resolve().parents[1]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--apply", action="store_true", help="Requires prior user authorization")
    parser.add_argument("--expected-sid", help="Exact reviewed identity SID; required with --apply")
    arguments = parser.parse_args()
    runtime = ROOT / "node_modules/electron/dist"
    if runtime.resolve() != runtime or not (runtime / "electron.exe").is_file():
        raise RuntimeError("Expected project-local Electron runtime is missing or redirected")
    for path in (ROOT / "node_modules", runtime.parent, runtime):
        if path.is_symlink() or path.resolve() != path:
            raise RuntimeError("Refusing a redirected runtime path")
    token = win32security.OpenProcessToken(win32api.GetCurrentProcess(), win32con.TOKEN_QUERY)
    try:
        sid = win32security.ConvertSidToStringSid(
            win32security.GetTokenInformation(token, win32security.TokenUser)[0])
    finally:
        token.Close()
    if not re.fullmatch(r"S-1-5-21-(?:\d+-){3}\d+", sid):
        raise RuntimeError("Expected a local user SID")
    if arguments.apply and arguments.expected_sid != sid:
        raise RuntimeError("--apply requires the exact current SID from the reviewed plan")
    buffer = ctypes.create_unicode_buffer(32768)
    if not ctypes.windll.kernel32.GetSystemDirectoryW(buffer, len(buffer)):
        raise ctypes.WinError()
    executable = str(Path(buffer.value) / "icacls.exe")
    folder = ROOT / "test-artifacts/electron-startup" / ("acl-backup-" + uuid.uuid4().hex[:8])
    folder.mkdir(parents=True)
    backup = folder / "runtime-before.acl"
    export_command = [executable, str(runtime), "/save", str(backup), "/T"]
    result = subprocess.run(export_command, capture_output=True, encoding="utf-8",
                            errors="replace", timeout=30, check=False)
    plan = {"created_at": datetime.now(timezone.utc).isoformat(), "runtime": str(runtime),
            "identity_sid": sid, "export": {"command": export_command,
                                            "exit_code": result.returncode,
                                            "stdout": result.stdout, "stderr": result.stderr},
            "backup": str(backup),
            "proposed_command": [executable, str(runtime), "/grant", f"*{sid}:(OI)(CI)(RX)"],
            "scope": "Add inheritable read/execute for this identity on project Electron dist "
                     "only. Preserve existing ACLs/owners/inheritance and Chromium sandbox.",
            "applied": False}
    manifest = folder / "plan.json"
    manifest.write_text(json.dumps(plan, indent=2) + "\n", encoding="utf-8")
    if result.returncode or not backup.is_file() or backup.stat().st_size == 0:
        raise RuntimeError("ACL export failed; no permissions changed. See " + str(manifest))
    if arguments.apply:
        change = subprocess.run(plan["proposed_command"], capture_output=True, encoding="utf-8",
                                errors="replace", timeout=30, check=False)
        plan["apply_result"] = {"exit_code": change.returncode,
                                "stdout": change.stdout, "stderr": change.stderr}
        plan["applied"] = change.returncode == 0
        manifest.write_text(json.dumps(plan, indent=2) + "\n", encoding="utf-8")
        if change.returncode:
            raise RuntimeError("Grant failed; inspect backup and result at " + str(manifest))
    print(json.dumps({"manifest": str(manifest), "backup": str(backup),
                      "export_exit_code": result.returncode,
                      "proposed_command": plan["proposed_command"],
                      "applied": plan["applied"]}, indent=2))


if __name__ == "__main__":
    main()
