"""Run reproducible foundation checks and save their actual outputs inside the project.

Scope includes the API when available, but excludes Vue/native desktop/model/speech/release.
No network permission or system changes. Successful exit does not mean the product is done.
"""
import json
import os
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DESTINATION = ROOT / "test-artifacts" / "verification"


def main():
    DESTINATION.mkdir(parents=True, exist_ok=True)
    python = sys.executable
    node_tests = [str(filename.relative_to(ROOT)) for filename in sorted(
        (ROOT / "tests" / "node").glob("*.test.cjs"))]
    python_style_paths = ["backend", "scripts/offline_guard.py", "scripts/offline_smoke.py",
                          "scripts/recover_cached_wheels.py", "scripts/verify_foundation.py",
                          "scripts/windows_context.py", "scripts/benchmark_sapi.py"]
    checks = [
        ("node-tests", ["node", "--test", *node_tests]),
        ("python-guarded-tests", [python, "scripts/offline_smoke.py"]),
        ("electron-types", ["node", "node_modules/typescript/bin/tsc", "-p",
                            "tsconfig.electron.json", "--pretty", "false"]),
        ("renderer-core-types", ["node", "node_modules/typescript/bin/tsc", "-p",
                                 "tsconfig.renderer-core.json", "--pretty", "false"]),
        ("javascript-lint", ["node", "node_modules/eslint/bin/eslint.js", "electron",
                             "scripts", "tests/node", "frontend/src/services"]),
        ("python-style", [python, "-m", "pycodestyle", "--max-line-length", "100",
                          *python_style_paths]),
        ("python-import-order", [python, "-m", "isort", "--check-only", "--profile", "black",
                                 "--line-length", "100", *python_style_paths]),
        ("python-dependency-check", [python, "-m", "pip", "check"]),
    ]
    report = {"created_at": datetime.now(timezone.utc).isoformat(),
              "python_version": sys.version,
              "scope": "foundation-core only; not product/offline speech acceptance",
              "checks": []}
    for name, command in checks:
        started = time.monotonic()
        try:
            result = subprocess.run(command, cwd=ROOT, capture_output=True, text=True,
                                    encoding="utf-8", errors="replace", timeout=60, check=False,
                                    env={**os.environ, "MIKA_PYTHON": python})
            output = result.stdout + result.stderr
            exit_code = result.returncode
        except (OSError, subprocess.TimeoutExpired):
            output = "Check could not execute or exceeded its 60-second deadline.\n"
            exit_code = 1
        artifact = DESTINATION / (name + ".txt")
        artifact.write_text(output, encoding="utf-8")
        report["checks"].append({"name": name, "command": command, "exit_code": exit_code,
                                 "elapsed_s": round(time.monotonic() - started, 3),
                                 "artifact": artifact.name})
        print(name, "PASS" if exit_code == 0 else "FAIL", flush=True)
    report_file = DESTINATION / "report.json"
    report_file.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print("Reports:", DESTINATION)
    print("Pending: Ruff, Vue build, native desktop, "
          "real models/voice/avatar/installer.")
    return 0 if all(item["exit_code"] == 0 for item in report["checks"]) else 1


if __name__ == "__main__":
    sys.exit(main())
