param([string]$Python = 'python', [switch]$FoundationPython39)
$ErrorActionPreference = 'Stop'
Set-Location (Split-Path -Parent $PSScriptRoot)
& $Python -c "import sys; raise SystemExit(0 if sys.version_info >= (3,12) else 1)"
if ($LASTEXITCODE -ne 0 -and -not $FoundationPython39) {
  throw 'Select working Python 3.12 x64 with -Python. Python 3.9 is foundation-test-only.'
}
& $Python -m venv .venv
if ($LASTEXITCODE -ne 0) { throw 'Virtual environment creation failed.' }
& ./.venv/Scripts/python.exe -m pip install --disable-pip-version-check -r requirements-dev.txt
if ($LASTEXITCODE -ne 0) { throw 'Python dependency installation failed. No runtime success claimed.' }
& npm install --cache .cache/npm --no-audit --no-fund
if ($LASTEXITCODE -ne 0) { throw 'Desktop dependency installation failed.' }
Write-Host 'Foundation dependencies installed. No model, voice or avatar has been downloaded.'
