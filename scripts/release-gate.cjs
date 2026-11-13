const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const executable = path.join(root, 'build/backend/mika-backend.exe');
if (!fs.existsSync(executable)) {
  console.error('Release blocked: packaged Python backend missing. No self-contained installer can be produced.');
  process.exitCode = 1;
}
