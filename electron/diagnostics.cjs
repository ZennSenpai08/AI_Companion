const stages = new Set(['chat_received', 'context_ready', 'ollama_request', 'ollama_headers',
  'ollama_first_delta', 'ollama_done', 'ollama_timeout', 'ollama_error']);
/** Raw stderr stays private. Only two explicitly allowlisted fields can leave here.
 * @param {string} line */
function backendStage(line) {
  if (!line.startsWith('MIKA_STAGE ')) return null;
  try {
    const value = JSON.parse(line.slice(11));
    if (!stages.has(value.stage) || typeof value.at !== 'string' ||
        !/^\d{4}-\d\d-\d\dT[0-9:.+Z-]{8,40}$/.test(value.at)) return null;
    return { stage: String(value.stage), at: value.at };
  } catch { return null; }
}
module.exports = { backendStage };
