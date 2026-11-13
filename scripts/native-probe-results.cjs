/**
 * @typedef {{event:string, visible?:boolean, exitCode?:number, nodeExposed?:boolean,
 * security?:{sandboxed?:boolean, contextIsolated?:boolean}}} NativeStage
 */

/** Assess independent startup and shutdown evidence; interruption never erases startup.
 * @param {{stages:NativeStage[],exitCode:number|null,signal:string|null,interrupted:boolean}} input
 */
function assessVisibleProbe({ stages, exitCode, signal, interrupted }) {
  const runtimeStarted = stages.some(stage => stage.event === 'app-ready');
  const renderer = stages.find(stage => stage.event === 'renderer-ready');
  const rendererInitialized = Boolean(renderer);
  const rendererSecure = renderer?.security?.sandboxed === true &&
    renderer?.security?.contextIsolated === true && renderer?.nodeExposed === false;
  const visible = stages.some(stage => stage.event === 'window-visible' && stage.visible === true);
  const startupPassed = runtimeStarted && rendererInitialized && rendererSecure;
  const closed = stages.some(stage => stage.event === 'window-closed');
  const quit = stages.some(stage => stage.event === 'quit' && stage.exitCode === 0);
  const incompleteTermination = interrupted || Boolean(signal);
  const gracefulShutdown = incompleteTermination ? 'INCONCLUSIVE' :
    exitCode === 0 && closed && quit ? 'PASS' : exitCode !== null && exitCode !== 0 ? 'FAIL' : 'INCONCLUSIVE';
  const startup = startupPassed ? 'PASS' : incompleteTermination && !renderer ? 'INCONCLUSIVE' : 'FAIL';
  const status = startup === 'PASS' ? !visible ?
    'STARTUP_PASSED_VISIBILITY_UNVERIFIED_SHUTDOWN_' + gracefulShutdown :
    gracefulShutdown === 'PASS' ? 'AUTOMATED_CHECKS_PASSED' :
    'STARTUP_PASSED_SHUTDOWN_' + gracefulShutdown : 'STARTUP_' + startup;
  return { runtimeStarted, rendererInitialized, rendererSecure, visible, startup,
    gracefulShutdown, status };
}

module.exports = { assessVisibleProbe };
