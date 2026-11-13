$ErrorActionPreference = 'Stop'
Set-Location (Split-Path -Parent $PSScriptRoot)
& npm run build
if ($LASTEXITCODE -ne 0) { throw 'Build failed.' }
& npm run package
if ($LASTEXITCODE -ne 0) { throw 'Release gate or installer build failed. See KNOWN_ISSUES.md.' }
