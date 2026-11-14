const { spawn } = require('node:child_process');
const { randomBytes } = require('node:crypto');
const { requestLocal } = require('./http.cjs');
const { backendStage } = require('./diagnostics.cjs');

class BackendSupervisor {
  /** @param {{command:string,args:string[],cwd:string,dataDir?:string,timeoutMs?:number,onStage?:(event:{stage:string,at:string})=>void}} options */
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
          HF_HUB_OFFLINE: '1', TRANSFORMERS_OFFLINE: '1', DO_NOT_TRACK: '1',
          MIKA_DIAGNOSTICS: this.options.onStage ? '1' : '0' },
      });
      this.child = child;
      child.stdin.on('error', () => {});
      // Never forward arbitrary stderr. Long/invalid/private lines are discarded.
      let diagnosticBuffer = '';
      child.stderr.on('data', chunk => {
        diagnosticBuffer += chunk.toString('utf8');
        if (diagnosticBuffer.length > 8192) { diagnosticBuffer = ''; return; }
        let index;
        while ((index = diagnosticBuffer.indexOf('\n')) >= 0) {
          const event = backendStage(diagnosticBuffer.slice(0, index).trim());
          diagnosticBuffer = diagnosticBuffer.slice(index + 1);
          if (event) this.options.onStage?.(event);
        }
      });
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
      // This private handshake runs while status=starting; public requests must
      // wait for ready instead of receiving port=0/empty-token security errors.
      const health = await requestLocal(this.port, this.token, '/health');
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

  /** @param {string} route @param {object|null} [body] */
  request(route, body = null) {
    if (this.status !== 'ready') return Promise.reject(Object.assign(
      new Error(this.error || 'Local backend is not ready. Check Python setup and choose Retry backend.'),
      { code: 'BACKEND_NOT_READY' }));
    return requestLocal(this.port, this.token, route, body);
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
