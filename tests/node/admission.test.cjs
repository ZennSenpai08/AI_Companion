const { test } = require('node:test');
const assert = require('node:assert/strict');
const { memoryAdmission } = require('../../electron/admission.cjs');
test('temporary shortage rejects then recovers without weakening the original thresholds', () => {
  const states = [3, 1.9, 3, 3].map(gib => memoryAdmission('qwen3.5:0.8b', gib * 2 ** 30).allowed);
  assert.deepEqual(states, [true, false, true, true]);
  for (const [model, minimum] of [['qwen3.5:0.8b', 2], ['qwen3.5:4b', 6], ['qwen3.5:9b', 10]]) {
    assert.equal(memoryAdmission(model, minimum * 2 ** 30).allowed, true);
    assert.equal(memoryAdmission(model, minimum * 2 ** 30 - 1).allowed, false);
  }
});
test('invalid observations and unknown models fail closed', () => {
  for (const value of [-1, NaN, Infinity]) assert.equal(memoryAdmission('qwen3.5:0.8b', value).allowed, false);
  assert.equal(memoryAdmission('unapproved', 100 * 2 ** 30).allowed, false);
});
test('all compatible installed candidates share one conservative policy, including warm requests', () => {
  const policy = require('../../backend/llm/model_policy.json');
  for (const [model, limits] of Object.entries(policy.models)) {
    for (let attempt = 0; attempt < 2; attempt++) {
      assert.equal(memoryAdmission(model, limits.min_free_gib * 2 ** 30).allowed, true);
      const rejected = memoryAdmission(model, (limits.min_free_gib - .1) * 2 ** 30);
      assert.equal(rejected.allowed, false);
      assert.match(rejected.reason, /GiB available/);
      assert.ok(!rejected.reason.includes('${'));
    }
  }
});
