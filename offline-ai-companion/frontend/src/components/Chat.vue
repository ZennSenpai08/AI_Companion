<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
const bridge = window.mika
const messages = ref<Array<{role: string; content: string}>>([])
const draft = ref('')
const model = ref('qwen3.5:0.8b')
const language = ref('auto')
const state = ref('IDLE')
const error = ref('')
const working = ref(false)
let unsubscribe = () => {}
let answerIndex = -1
onMounted(async () => {
  unsubscribe = bridge.onChatEvent(event => {
    if (event.type === 'delta' && answerIndex >= 0) messages.value[answerIndex].content += event.text ?? ''
    if (event.type === 'state') {
      state.value = event.state ?? 'IDLE'
      if (['IDLE', 'INTERRUPTED'].includes(state.value)) working.value = false
    }
    if (event.type === 'error') { error.value = event.message ?? 'Local model failed'; state.value = 'ERROR'; working.value = false }
  })
  try { messages.value = (await bridge.messages()).messages }
  catch { error.value = 'Start the backend in settings before chatting. Install Ollama and a local model separately.' }
})
onUnmounted(() => { unsubscribe(); void bridge.stopText() })
async function send() {
  if (!draft.value.trim() || working.value) return
  const text = draft.value
  error.value = ''; working.value = true; state.value = 'THINKING'
  messages.value.push({role: 'user', content: text}, {role: 'assistant', content: ''})
  answerIndex = messages.value.length - 1
  try { await bridge.sendText({text, model: model.value, language: language.value}); draft.value = '' }
  catch { error.value = 'Could not start inference. Check backend setup and available RAM (Lite needs at least 2 GiB free).'; state.value = 'ERROR'; working.value = false; messages.value.pop() }
}
async function stop() { await bridge.stopText(); working.value = false; state.value = 'INTERRUPTED' }
async function clear() {
  if (working.value || !window.confirm('Permanently delete local conversation history? Approved facts are managed separately.')) return
  try { await bridge.clearHistory(); messages.value = [] }
  catch { error.value = 'Could not clear history. Stop the active reply and retry.' }
}
</script>
<template>
  <section aria-label="Text conversation">
    <div class="notice"><strong>Local text preview</strong><p>Ollama and a downloaded local model are required. Voice and Live2D are not active. Chat history is stored locally as readable SQLite data.</p></div>
    <div class="selectors"><label>Local model<select v-model="model" :disabled="working"><option>qwen3.5:0.8b</option><option>qwen3.5:4b</option><option>qwen3.5:9b</option></select></label>
      <label>Language<select v-model="language" :disabled="working"><option value="auto">Match me</option><option value="en">English</option><option value="fil">Filipino</option><option value="taglish">Taglish</option></select></label></div>
    <div class="conversation" role="log" aria-live="polite"><p v-if="!messages.length" class="hint">Your conversation starts here. Mika's protected identity is loaded for every turn.</p>
      <article v-for="(message,index) in messages" :key="index" :class="message.role"><small>{{ message.role === 'user' ? 'YOU' : 'MIKA' }}</small><p>{{ message.content || '…' }}</p></article></div>
    <p class="error" role="alert">{{ error }}</p><form @submit.prevent="send"><label class="sr-only" for="message">Message Mika</label><textarea id="message" v-model="draft" maxlength="4000" placeholder="Uy, Mika…" :disabled="working"></textarea>
    <div class="buttons"><button :disabled="working || !draft.trim()">Send locally</button><button type="button" class="quiet" :disabled="!working" @click="stop">Stop reply</button><span class="hint" role="status">{{ state }} · MIC OFF</span></div></form>
    <button class="quiet" :disabled="working" @click="clear">Delete conversation history</button>
  </section>
</template>
