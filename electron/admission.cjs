/** Stateless admission: a temporary shortage never latches a later request off.
 * Thresholds match the original main-process policy exactly.
 * @param {string} model @param {number} freeBytes */
function memoryAdmission(model, freeBytes) {
  const policy = /** @type {{models: Record<string, {min_free_gib:number}>}} */ (require('../backend/llm/model_policy.json'));
  const requiredGiB = Object.hasOwn(policy.models, model) ? policy.models[model].min_free_gib : undefined;
  const allowed = requiredGiB !== undefined && Number.isFinite(freeBytes) && freeBytes >= requiredGiB * 2 ** 30;
  return { allowed, requiredGiB, reason: allowed ? '' : requiredGiB === undefined ?
    'Unsupported local model.' : `Low available RAM for ${model}: ${Number.isFinite(freeBytes) ? (freeBytes / 2 ** 30).toFixed(2) : 'unknown'} GiB available; at least ${requiredGiB} GiB required. Loaded models also consume RAM. Stop unused models in Ollama or close other applications, then retry.` };
}
module.exports = { memoryAdmission };
