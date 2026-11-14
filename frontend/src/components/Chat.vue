<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref } from 'vue'
import { createChatState, beginTurn, bindSequence, consumeEvent, rejectStart, interruptTurn, resetChat } from '../services/chat-state.mjs'
import type { Readiness } from '../types/bridge'
import { presentationActive } from '../services/presentation.mjs'
const bridge = window.mika
const chat = reactive(createChatState())
const draft = ref('')
const model = ref('')
const models = ref<Readiness['ollama']['models']>([])
const language = ref('auto')
const loading = ref(true)
const initialization = ref('loading')
const running = ref(false)
let unsubscribe = () => {}
let offPresentation = () => {}
onMounted(async () => {
  unsubscribe = bridge.onChatEvent(event => consumeEvent(chat, event))
  let revision = -1
  const receive = (value: Awaited<ReturnType<typeof bridge.presentation>>) => {
    if (value.revision >= revision) { revision = value.revision; running.value = presentationActive(value) }
  }
  offPresentation = bridge.onPresentationEvent(receive)
  try {
    const [history, preferences, readiness, presentation] = await Promise.all([bridge.messages(), bridge.preferences(), bridge.readiness(), bridge.presentation()])
    receive(presentation)
    chat.messages = createChatState(history.messages).messages
    model.value = preferences.model; language.value = preferences.language
    models.value = readiness.ollama.models.filter(m => m.compatible)
    initialization.value = 'ready'
  }
  catch { initialization.value = 'error'; chat.error = 'Local history or preferences could not load. Check backend status in Settings, retry the backend, then reopen Chat.' }
  finally { loading.value = false }
})
onUnmounted(() => { unsubscribe(); offPresentation() })
async function send() {
  if (!draft.value.trim() || chat.busy || running.value || loading.value) return
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
async function refreshModels() {
  try { models.value = (await bridge.readiness()).ollama.models.filter(m => m.compatible) }
  catch { chat.error = 'Could not refresh local models. Check Ollama and retry.' }
}
async function clear() {
  if (chat.busy || running.value || loading.value || !window.confirm('Permanently delete local conversation history? Approved facts are managed separately.')) return
  loading.value = true
  try { await bridge.clearHistory(); resetChat(chat) }
  catch { chat.error = 'Could not clear history. Stop the active reply and retry.' }
  finally { loading.value = false }
}
</script>
<template>
  <section aria-label="Text conversation" :data-init-state="initialization" :data-chat-state="chat.state">
    <div class="notice"><strong>Optional text testing and history</strong><p>Mika's floating window displays the response. Voice and Live2D are not active. This panel is a developer/accessibility input while voice is prepared. History stays in local readable SQLite.</p></div>
    <div class="selectors"><label>Local model<select v-model="model" :disabled="chat.busy || running"><option v-if="!models.some(m => m.name === model)" :value="model" disabled>{{ model || 'No local model selected' }} · unavailable</option><option v-for="item in models" :key="item.name" :value="item.name">{{ item.name }}</option></select></label>
      <label>Input language hint<select v-model="language" :disabled="chat.busy || running"><option value="auto">Automatic</option><option value="en">English</option><option value="fil">Filipino / Tagalog</option><option value="taglish">Taglish</option></select></label></div>
    <p>Replies are instructed to use English. This model may still make language or comprehension mistakes.</p>
    <button class="quiet" :disabled="chat.busy || running || loading" @click="refreshModels">Refresh installed models</button>
    <div class="conversation" role="log" aria-live="polite"><p v-if="!chat.messages.length" class="hint">Your conversation starts here. Mika's protected identity is loaded for every turn.</p>
      <article v-for="(message,index) in chat.messages" :key="index" :class="message.role"><small>{{ message.role === 'user' ? 'YOU' : 'MIKA' }}</small><p>{{ message.content || '…' }}</p><span v-if="message.status && ['interrupted','failed','pending'].includes(message.status)" class="hint">{{ message.status }}</span></article></div>
    <p class="error" role="alert">{{ chat.error }}</p><form @submit.prevent="send"><label class="sr-only" for="message">Message Mika</label><textarea id="message" v-model="draft" maxlength="4000" placeholder="Uy, Mika…" :disabled="chat.busy || running || loading"></textarea>
    <div class="buttons"><button :disabled="chat.busy || running || loading || !draft.trim() || !models.some(m => m.name === model)">Send locally</button><button type="button" class="quiet" :disabled="!chat.busy && !running" @click="stop">Stop reply</button><span class="hint" role="status">{{ running ? 'RESPONSE ACTIVE' : chat.state }} · MIC OFF</span></div></form>
    <button class="quiet" :disabled="chat.busy || running" @click="clear">Delete conversation history</button>
  </section>
</template>
