const { spawn } = require('node:child_process');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const child = spawn(process.env.MIKA_PYTHON || path.join(root, '.venv/Scripts/python.exe'),
  ['tests/fixtures/health_service.py'], { cwd: root, windowsHide: true, shell: false });
child.stdout.on('data', data => process.stdout.write(JSON.stringify({ pid: child.pid, data: data.toString() })+'\n'));
child.stderr.resume();
child.stdin.write(JSON.stringify({ token: 'a'.repeat(64) })+'\n');
