// Headless diagnostic for the production Node → FastAPI → Ollama path, not UI acceptance.
const fs = require('node:fs');
const path = require('node:path');
const { performance } = require('node:perf_hooks');
const { BackendSupervisor } = require('../electron/supervisor.cjs');
const { developmentPython } = require('../electron/python-runtime.cjs');
const { streamChat } = require('../electron/chat.cjs');
const { checkOllama, hardware, metadata, MODEL } = require('./ollama-check.cjs');
const { memoryAdmission } = require('../electron/admission.cjs');
const { createPresentation } = require('../electron/presentation.cjs');
const model = process.env.MIKA_TEST_MODEL ?? MODEL;
const root = path.resolve(__dirname, '..');
async function main() {
  const destination = path.join(root, 'test-artifacts/chat-trace',
    new Date().toISOString().replace(/[:.]/g, '-') + '-' + require('node:crypto').randomUUID().slice(0, 8));
  fs.mkdirSync(destination, { recursive: true });
  const preflight = await checkOllama(model);
  fs.writeFileSync(path.join(destination, 'preflight.json'), JSON.stringify(preflight, null, 2));
  if (!preflight.readyForRealTest) {
    console.error(JSON.stringify({ stage: 'preflight', blockers: preflight.blockers })); process.exitCode = 1; return;
  }
  const service = new BackendSupervisor({ command: developmentPython(root).command,
    args: ['-m', 'backend.bootstrap'], cwd: root, dataDir: destination,
    onStage: event => stage('provider-stage', { phase: event.stage, backendAt: event.at }) });
  /** @type {Array<Record<string, any>>} */
  const turns = [];
  const presentation = createPresentation(() => {});
  /** @type {Array<Record<string, unknown>>} */
  const stages = [];
  /** @param {string} stage @param {Record<string, unknown>} [extra] */
  const stage = (stage, extra = {}) => {
    const event = { at: new Date().toISOString(), stage, ...extra };
    stages.push(event); console.log(JSON.stringify(event));
  };
  let success = false;
  /** @type {Record<string, unknown>} */
  const modelChecks = {};
  let failure = null;
  try {
    stage('backend-start'); await service.start();
    await service.request('/preferences'); await service.request('/messages'); stage('bootstrap-requests-ok');
    for (const [caseId, text, language] of [
      ['english', 'Hi Mika! Say hello in one short sentence.', 'en'],
      ['taglish', 'Uy Mika, kamusta? One short English greeting, please.', 'taglish'],
      ['context', 'For this test, my code word is sampaguita. Reply briefly.', 'en'],
      ['followup', 'What code word did I just mention? One sentence.', 'en'],
      ['persona', 'What is your actual name? Answer briefly in English.', 'en'],
    ]) {
      stage('submit', { caseId });
      const before = hardware();
      const loadedBefore = await metadata('ps');
      const admission = memoryAdmission(model, Number(before.freeRamBytes));
      if (!admission.allowed) throw new Error(admission.reason);
      const started = performance.now();
      /** @type {number|null} */
      let first = null;
      const sequence = turns.length + 1;
      presentation.start(sequence);
      /** @type {Array<Record<string, any>>} */
      const events = [];
      await streamChat(service.port, service.token, { text, language, model },
        new AbortController().signal, event => {
          presentation.consume(sequence, event);
          events.push(event);
          if (event.type === 'delta' && first === null) { first = performance.now() - started; stage('first-delta', { caseId, elapsed_ms: first }); }
          if (event.type === 'state') stage('backend-state', { caseId, state: event.state });
        });
      const error = events.find(event => event.type === 'error');
      const done = events.find(event => event.type === 'done');
      const reply = events.filter(event => event.type === 'delta').map(event => event.text).join('');
      turns.push({ caseId, text, language, reply, first_delta_ms: first, elapsed_ms: performance.now() - started,
        model, hardwareBefore: before, hardwareAfter: hardware(), loadedBefore,
        presentationMatches: presentation.snapshot().phase === 'complete' &&
          presentation.snapshot().text === reply && presentation.snapshot().audioActive === false,
        metrics: done?.metrics ?? null, completed: Boolean(done), error: error?.message ?? null, code: error?.code ?? null });
      stage(done ? 'completed' : 'failed', { caseId, code: error?.code ?? 'none' });
      if (!done || error || !reply.trim() || presentation.snapshot().text !== reply)
        throw new Error('Real backend conversation/presentation did not complete.');
    }
    const before = await service.request('/messages');
    const selection = await service.request('/preferences', { model });
    modelChecks.installedSelectionSaved = selection.model === model;
    if (process.argv.includes('--verify-unload')) {
      modelChecks.hardwareBeforeUnload = hardware();
      await service.request('/model-unload', { model });
      const unloaded = await metadata('ps');
      modelChecks.unloaded = Array.isArray(unloaded.models) && !unloaded.models.some(item => item.name === model);
      modelChecks.hardwareAfterUnload = hardware();
      modelChecks.historyUnchanged = JSON.stringify(before.messages) === JSON.stringify((await service.request('/messages')).messages);
      if (!modelChecks.unloaded || !modelChecks.historyUnchanged) throw new Error('Explicit model unload verification failed.');
    }
    await service.stop(); await service.start();
    const after = await service.request('/messages');
    success = JSON.stringify(before.messages) === JSON.stringify(after.messages);
    stage('sqlite-restart', { restored: success });
  } catch (error) { failure = error instanceof Error ? error.message : 'Unknown trace failure'; stage('trace-failed'); }
  finally {
    await service.stop(); stage('backend-stopped');
    fs.writeFileSync(path.join(destination, 'result.json'), JSON.stringify({
      scope: 'Real backend/Ollama diagnostic; no Vue/native UI acceptance', model, turns, stages, modelChecks,
      qualityReview: 'REQUIRED: inspect language and personality; transport PASS is not a quality score',
      status: success ? 'PASS' : 'FAIL', failure, backendStopped: service.child === null }, null, 2));
    console.log(JSON.stringify({ artifact: path.relative(root, path.join(destination, 'result.json')), status: success ? 'PASS' : 'FAIL' }));
    process.exitCode = success ? 0 : 1;
  }
}
void main().catch(error => { console.error(error.message); process.exitCode = 1; });
