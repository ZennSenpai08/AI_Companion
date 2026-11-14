const fs = require('node:fs');
const path = require('node:path');
/** One development selection policy for normal launch and acceptance tests.
 * Explicit configuration wins; dependency/startup validation stays in bootstrap.
 * @param {string} root @param {NodeJS.ProcessEnv} [env]
 */
function developmentPython(root, env = process.env) {
  if (env.MIKA_PYTHON) return { command: env.MIKA_PYTHON, source: 'explicit' };
  const prepared = path.join(root, '.venv-runtime/Scripts/python.exe');
  return fs.existsSync(prepared) ? { command: prepared, source: 'prepared-runtime' } :
    { command: path.join(root, '.venv/Scripts/python.exe'), source: 'setup-venv' };
}
module.exports = { developmentPython };
