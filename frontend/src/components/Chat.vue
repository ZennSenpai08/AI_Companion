<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref } from 'vue'
import { createChatState, beginTurn, bindSequence, consumeEvent, rejectStart, interruptTurn, resetChat } from '../services/chat-state.mjs'
const bridge = window.mika
const chat = reactive(createChatState())
const draft = ref('')
const model = ref('qwen3.5:0.8b')
const language = ref('auto')
const loading = ref(true)
let unsubscribe = () => {}
onMounted(async () => {
  unsubscribe = bridge.onChatEvent(event => consumeEvent(chat, event))
  try {
    const [history, preferences] = await Promise.all([bridge.messages(), bridge.preferences()])
    chat.messages = createChatState(history.messages).messages
    model.value = preferences.model; language.value = preferences.language
  }
  catch { chat.error = 'Start the backend in settings before chatting. Install Ollama and a local model separately.' }
  finally { loading.value = false }
})
onUnmounted(() => { interruptTurn(chat); unsubscribe(); void bridge.stopText().catch(() => {}) })
async function send() {
  if (!draft.value.trim() || chat.busy || loading.value) return
  const text = draft.value
  const epoch = beginTurn(chat, text)
  try {
    const result = await bridge.sendText({text, model: model.value, language: language.value})
    if (!result.started) { rejectStart(chat, result.error, epoch); return }
    if (bindSequence(chat, result.sequence, epoch)) draft.value = ''
  } catch { rejectStart(chat, 'Could not start the local conversation. Check backend diagnostics.', epoch) }
}
async function stop() {
  interruptTurn(chat)
  try { await bridge.stopText() }
  catch { chat.error = 'Could not contact the backend. Restart it from settings.' }
}
async function clear() {
  if (chat.busy || loading.value || !window.confirm('Permanently delete local conversation history? Approved facts are managed separately.')) return
  loading.value = true
  try { await bridge.clearHistory(); resetChat(chat) }
  catch { chat.error = 'Could not clear history. Stop the active reply and retry.' }
  finally { loading.value = false }
}
</script>
<template>
  <section aria-label="Text conversation">
    <div class="notice"><strong>Local text preview</strong><p>Ollama and a downloaded local model are required. Voice and Live2D are not active. Chat history is stored locally as readable SQLite data.</p></div>
    <div class="selectors"><label>Local model<select v-model="model" :disabled="chat.busy"><option>qwen3.5:0.8b</option><option>qwen3.5:4b</option><option>qwen3.5:9b</option></select></label>
      <label>Language<select v-model="language" :disabled="chat.busy"><option value="auto">Match me</option><option value="en">English</option><option value="fil">Filipino</option><option value="taglish">Taglish</option></select></label></div>
    <div class="conversation" role="log" aria-live="polite"><p v-if="!chat.messages.length" class="hint">Your conversation starts here. Mika's protected identity is loaded for every turn.</p>
      <article v-for="(message,index) in chat.messages" :key="index" :class="message.role"><small>{{ message.role === 'user' ? 'YOU' : 'MIKA' }}</small><p>{{ message.content || '…' }}</p><span v-if="message.status && ['interrupted','failed','pending'].includes(message.status)" class="hint">{{ message.status }}</span></article></div>
    <p class="error" role="alert">{{ chat.error }}</p><form @submit.prevent="send"><label class="sr-only" for="message">Message Mika</label><textarea id="message" v-model="draft" maxlength="4000" placeholder="Uy, Mika…" :disabled="chat.busy || loading"></textarea>
    <div class="buttons"><button :disabled="chat.busy || loading || !draft.trim()">Send locally</button><button type="button" class="quiet" :disabled="!chat.busy" @click="stop">Stop reply</button><span class="hint" role="status">{{ chat.state }} · MIC OFF</span></div></form>
    <button class="quiet" :disabled="chat.busy" @click="clear">Delete conversation history</button>
  </section>
</template>
