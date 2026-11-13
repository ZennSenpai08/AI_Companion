<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Chat from '../components/Chat.vue'
import Memory from '../components/Memory.vue'
import EngineSettings from '../components/EngineSettings.vue'
import type { Snapshot, DesktopAction } from '../types/bridge'
const tab = ref('settings')
const bridge = window.mika
const state = ref<Snapshot | null>(null)
const error = ref('')
const busy = ref(false)
const diagnostics = ref('')
const scale = ref(1)
async function execute(action: () => Promise<unknown>) {
  busy.value = true
  error.value = ''
  try { await action(); state.value = await window.mika.status() }
  catch { error.value = 'The local operation failed. Use the tray menu to recover.' }
  finally { busy.value = false }
}
async function desktop(action: DesktopAction, value?: boolean | number) {
  await execute(() => window.mika.desktop(action, value))
}
onMounted(() => execute(async () => { state.value = await window.mika.status() }))
</script>
<template>
  <main>
    <header><span class="spark">✦</span><span>MIKA <small>DESKTOP COMPANION</small></span><b>MIC OFF</b></header>
    <p class="eyebrow">LOCAL BY DESIGN</p><h1>A little company.<br>A space of your own.</h1>
    <p class="lead">Your companion, on your computer. Start with a healthy local service.</p>
    <div class="notice"><strong>Foundation preview</strong><p>Live2D and speech are not enabled yet. Local text and approved memory adapters are available for evaluation after model setup.</p></div>
    <nav aria-label="Companion panels"><button v-for="item in ['chat','memory','settings']" :key="item" :class="{quiet:tab!==item}" @click="tab=item">{{ item }}</button></nav>
    <Chat v-if="tab==='chat'"/><Memory v-if="tab==='memory'"/>
    <div v-show="tab==='settings'"><section><h2>Local assistant</h2><p role="status">Backend: {{ state?.backend.status ?? 'checking' }}</p>
      <p class="error" role="alert">{{ error || state?.backend.error }}</p>
      <div class="buttons"><button :disabled="busy" @click="execute(() => bridge.retryBackend())">Retry backend</button>
      <button :disabled="busy" class="quiet" @click="execute(async () => { diagnostics = JSON.stringify(await bridge.diagnostics(), null, 2) })">Show diagnostics</button></div>
      <pre v-if="diagnostics">{{ diagnostics }}</pre></section>
    <section><h2>Desktop controls</h2><div class="buttons">
      <button class="quiet" @click="desktop('reset')">Restore companion</button>
      <button class="quiet" @click="desktop('topmost', !state?.desktop.topmost)">Always on top: {{ state?.desktop.topmost ? 'on' : 'off' }}</button>
      <button class="quiet" @click="desktop('clickThrough', !state?.desktop.clickThrough)">Click through: {{ state?.desktop.clickThrough ? 'on' : 'off' }}</button></div>
      <label>Window scale <input v-model.number="scale" type="range" min="0.6" max="1.6" step="0.1" @change="desktop('scale', scale)"></label>
      <p class="hint">Recover from click through using the tray menu or Ctrl + Shift + M.</p></section>
    <EngineSettings/>
    <section><h2>Privacy</h2><p>Microphone is off. Audio is not captured or retained. No hosted inference, telemetry or automatic model downloads.</p></section>
    </div><footer>OFFLINE FIRST <button class="quiet" @click="desktop('quit')">Quit Mika</button></footer>
  </main>
</template>
