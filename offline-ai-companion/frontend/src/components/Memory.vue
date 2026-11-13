<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { Fact } from '../types/bridge'
const bridge = window.mika
const facts = ref<Fact[]>([])
const text = ref('')
const error = ref('')
const busy = ref(false)
async function refresh() { facts.value = (await bridge.memories()).memories }
async function run(action: () => Promise<unknown>) {
  error.value = ''; busy.value = true
  try { await action(); await refresh() }
  catch { error.value = 'Memory operation failed. Check local backend availability.' }
  finally { busy.value = false }
}
onMounted(() => run(refresh))
async function remember() {
  if (!text.value.trim()) return
  await run(async () => { await bridge.memory({operation: 'remember', text: text.value, approved: true}); text.value = '' })
}
async function forget(fact: Fact) {
  if (!window.confirm('Permanently delete this approved memory?')) return
  await run(() => bridge.memory({operation: 'forget', id: fact.id, approved: true}))
}
</script>
<template>
  <section><h2>Your approved memories</h2><p class="hint">Only facts you add here are retained as long-term memory. Local memory personalizes context; it does not train model weights. Facts are stored in readable SQLite, not encrypted.</p>
    <form @submit.prevent="remember"><label for="fact">A fact you want Mika to remember</label><textarea id="fact" v-model="text" maxlength="500" placeholder="I prefer short explanations with examples."></textarea>
      <button :disabled="busy || !text.trim()">Approve and remember</button></form>
    <p class="error" role="alert">{{ error }}</p><p v-if="!facts.length" class="hint">No approved facts stored.</p>
    <article v-for="fact in facts" :key="fact.id" class="fact"><label :for="fact.id">Approved fact</label><textarea :id="fact.id" v-model="fact.text" maxlength="500"></textarea>
      <p class="hint">{{ fact.confidence }} · {{ fact.provenance }} · {{ new Date(fact.updated_at).toLocaleString() }}</p>
      <div class="buttons"><button :disabled="busy" class="quiet" @click="run(() => bridge.memory({operation:'update', id:fact.id, text:fact.text, approved:true}))">Save correction</button><button :disabled="busy" class="quiet" @click="forget(fact)">Delete</button></div></article>
    <div class="buttons"><button :disabled="busy" class="quiet" @click="run(refresh)">Refresh</button><button :disabled="busy" class="quiet" @click="run(() => bridge.exportMemories())">Export JSON…</button></div>
  </section>
</template>
