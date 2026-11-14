param([string]$Python = 'python', [switch]$AllowPython310)
$ErrorActionPreference = 'Stop'
Set-Location (Split-Path -Parent $PSScriptRoot)
$minimumMinor = if ($AllowPython310) { 10 } else { 12 }
& $Python -c "import sys; raise SystemExit(0 if sys.version_info >= (3,$minimumMinor) else 1)"
if ($LASTEXITCODE -ne 0) {
  throw 'Select working Python 3.12 x64 with -Python. -AllowPython310 permits a development runtime only.'
}
if (Test-Path .venv/Scripts/python.exe) {
  & ./.venv/Scripts/python.exe -c "import sys; raise SystemExit(0 if sys.version_info >= (3,10) else 1)"
  if ($LASTEXITCODE -ne 0) {
    throw 'Existing .venv uses Python <3.10. Preserve it; create a separate runtime or replace it deliberately.'
  }
}
& $Python -m venv .venv
if ($LASTEXITCODE -ne 0) { throw 'Virtual environment creation failed.' }
& ./.venv/Scripts/python.exe -m pip install --disable-pip-version-check -r requirements-dev.txt
if ($LASTEXITCODE -ne 0) { throw 'Python dependency installation failed. No runtime success claimed.' }
& npm install --cache .cache/npm --no-audit --no-fund
if ($LASTEXITCODE -ne 0) { throw 'Desktop dependency installation failed.' }
& npm run electron:install
if ($LASTEXITCODE -ne 0) { throw 'Electron binary preparation failed. Run npm run electron:install in ordinary PowerShell.' }
Write-Host 'Foundation dependencies installed. No model, voice or avatar has been downloaded.'
