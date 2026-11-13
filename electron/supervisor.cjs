const { spawn } = require('node:child_process');
const { randomBytes } = require('node:crypto');
const { requestLocal } = require('./http.cjs');

class BackendSupervisor {
  /** @param {{command:string,args:string[],cwd:string,dataDir?:string,timeoutMs?:number}} options */
  constructor(options) {
    this.options = options;
    /** @type {import('node:child_process').ChildProcessWithoutNullStreams | null} */
    this.child = null;
    this.token = '';
    this.port = 0;
    this.status = 'stopped';
    this.error = '';
    /** @type {Promise<void> | null} */
    this.starting = null;
    /** @type {Promise<void> | null} */
    this.stopping = null;
  }

  async start() {
    if (this.stopping) await this.stopping;
    if (this.starting) return this.starting;
    if (this.status === 'ready') return;
    this.starting = this.launch();
    try { await this.starting; } finally { this.starting = null; }
  }

  async launch() {
    this.status = 'starting';
    this.error = '';
    this.token = randomBytes(32).toString('hex');
    try {
      const child = spawn(this.options.command, this.options.args, {
        cwd: this.options.cwd, windowsHide: true, shell: false,
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, PYTHONUNBUFFERED: '1', PYTHONUTF8: '1',
          HF_HUB_OFFLINE: '1', TRANSFORMERS_OFFLINE: '1', DO_NOT_TRACK: '1' },
      });
      this.child = child;
      child.stdin.on('error', () => {});
      child.stderr.resume(); // Never forward possible user data/credentials into UI/logs.
      child.once('exit', () => {
        if (this.child === child) {
          this.child = null;
          this.port = 0;
          this.token = '';
          if (this.status !== 'stopping') {
            this.status = 'error';
            this.error ||= 'Backend exited. Open diagnostics and retry after checking setup.';
          }
        }
      });
      await new Promise((resolve, reject) => {
        let buffer = '';
        const timer = setTimeout(() => finish(new Error('Backend startup timed out')),
          this.options.timeoutMs ?? 15000);
        /** @param {Error | null} error @param {number} [port] */
        const finish = (error, port) => {
          clearTimeout(timer);
          child.stdout.off('data', onData);
          child.off('error', onError);
          child.off('exit', onExit);
          if (error) reject(error); else { this.port = port ?? 0; resolve(undefined); }
        };
        const onError = () => finish(new Error('Cannot launch Python. Run scripts/setup.ps1.'));
        const onExit = () => finish(new Error('Backend stopped before becoming ready.'));
        /** @param {Buffer} chunk */
        const onData = chunk => {
          buffer += chunk.toString('utf8');
          if (buffer.length > 8192) return finish(new Error('Invalid backend startup response'));
          let index;
          while ((index = buffer.indexOf('\n')) >= 0) {
            const line = buffer.slice(0, index); buffer = buffer.slice(index + 1);
            let event;
            try { event = JSON.parse(line); } catch { continue; }
            if (!event || typeof event !== 'object' || Array.isArray(event))
              return finish(new Error('Invalid backend startup response'));
            if (event.type === 'fatal') return finish(new Error(event.code === 'DEPENDENCIES_MISSING'
              ? 'Python packages are missing. Run scripts/setup.ps1 with dependency access.'
              : 'Backend startup failed. Check Python and local permissions.'));
            if (event.type === 'ready' && event.protocol === 1 &&
                Number.isInteger(event.port) && event.port > 0 && event.port < 65536) {
              return finish(null, event.port);
            }
          }
        };
        child.stdout.on('data', onData);
        child.once('error', onError);
        child.once('exit', onExit);
        child.stdin.write(JSON.stringify({ token: this.token, dataDir: this.options.dataDir }) + '\n');
      });
      const health = await this.request('/health');
      if (health.service !== 'mika-assistant' || health.protocol !== 1 ||
          health.status !== 'ok' || health.offline !== true || !this.child) {
        throw new Error('Backend health handshake failed');
      }
      this.status = 'ready';
    } catch (error) {
      await this.stop();
      this.status = 'error';
      this.error = error instanceof Error ? error.message : 'Backend startup failed';
      throw new Error(this.error);
    }
  }

  /** @param {string} route */
  request(route) {
    return requestLocal(this.port, this.token, route);
  }

  async stop() {
    if (this.stopping) return this.stopping;
    this.stopping = this.shutdown();
    try { await this.stopping; } finally { this.stopping = null; }
  }

  async shutdown() {
    this.status = 'stopping';
    const child = this.child;
    if (child && child.pid && child.exitCode === null && child.signalCode === null) {
      await new Promise(resolve => {
        const timer = setTimeout(() => { child.kill(); }, 3500);
        child.once('exit', () => { clearTimeout(timer); resolve(undefined); });
        child.stdin.end('shutdown\n');
      });
    }
    this.child = null;
    this.port = 0;
    this.token = '';
    this.status = 'stopped';
  }

  snapshot() {
    return { status: this.status, error: this.error }; // No token/port/PID exposed.
  }
}
module.exports = { BackendSupervisor };
