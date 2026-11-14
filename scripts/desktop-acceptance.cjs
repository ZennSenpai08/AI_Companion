/** @typedef {{nodeExposed?:boolean,bridgePresent?:boolean,vueMounted?:boolean}} FrameProof */
/** @typedef {{visible?:boolean,sandbox?:boolean,contextIsolation?:boolean,nodeIntegration?:boolean,rendererSandboxed?:boolean}} WindowProof */
/**
 * @typedef {{build?:string,windows?:number,renderer?:FrameProof,panelRenderer?:FrameProof,
 * nativeWindows?:{overlay?:WindowProof,panel?:WindowProof},backend?:{status?:string},
 * presentationHost?:{mounted?:boolean,bridge?:boolean},
 * bubbleLayout?:{passed?:boolean},
 * health?:{service?:string,status?:string,offline?:boolean,microphone?:string},
 * ipc?:{topmostToggled?:boolean,clickThroughRecovered?:boolean,invalidActionRejected?:boolean,
 * secretExposed?:boolean,backendReachable?:boolean}}} DesktopProof
 */
/** Evaluate actual-app evidence independently of process exit/shutdown evidence.
 * @param {DesktopProof|null} report
 */
function assessDesktopReport(report) {
  /** @param {FrameProof|undefined} frame */
  const frameReady = frame => frame?.nodeExposed === false && frame.bridgePresent === true && frame.vueMounted === true;
  /** @param {WindowProof|undefined} win */
  const secureWindow = win => win?.visible === true && win.sandbox === true &&
    win.contextIsolation === true && win.nodeIntegration === false && win.rendererSandboxed === true;
  return {
    builtVue: report?.build === 'vue',
    twoNativeWindows: typeof report?.windows === 'number' && report.windows >= 2,
    overlayVueAndPreload: frameReady(report?.renderer),
    panelVueAndPreload: frameReady(report?.panelRenderer),
    responsePresentationHost: report?.presentationHost?.mounted === true && report.presentationHost.bridge === true,
    bubbleLayoutVerified: report?.bubbleLayout?.passed === true,
    overlayVisibleAndSecure: secureWindow(report?.nativeWindows?.overlay),
    panelVisibleAndSecure: secureWindow(report?.nativeWindows?.panel),
    backendHealthy: report?.backend?.status === 'ready' && report.health?.service === 'mika-assistant' &&
      report.health.status === 'ok' && report.health.offline === true && report.health.microphone === 'off',
    rendererBackendIPC: report?.ipc?.backendReachable === true,
    desktopControls: report?.ipc?.topmostToggled === true && report.ipc.clickThroughRecovered === true,
    permissionBoundary: report?.ipc?.invalidActionRejected === true && report.ipc.secretExposed === false,
  };
}
module.exports = { assessDesktopReport };
