<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import SpeechBubble from '../components/SpeechBubble.vue'
import { emptyPresentation } from '../services/presentation.mjs'
import type { ResponsePresentation } from '../types/bridge'
const bridge = window.mika
const response = ref(emptyPresentation())
const holdMs = ref(12000)
const error = ref('')
let off = () => {}
let offPreferences = () => {}
let interactive = false
function receive(value: ResponsePresentation) {
  if (value.revision >= response.value.revision) response.value = value
}
async function preferences() {
  try { holdMs.value = (await bridge.preferences()).bubble_hold_ms }
  catch { error.value = 'Settings unavailable. Open controls to retry the backend.' }
}
function pointer(event: MouseEvent) {
  const next = event.target instanceof Element && Boolean(event.target.closest('[data-interactive]'))
  if (next === interactive) return
  interactive = next; void bridge.overlayInteractive(next).catch(() => { error.value = 'Use the tray menu to recover mouse controls.' })
}
function leave() { interactive = false; void bridge.overlayInteractive(false).catch(() => {}) }
async function stop() { try { await bridge.stopText() } catch { error.value = 'Could not stop. Open controls to retry the backend.' } }
onMounted(async () => {
  off = bridge.onPresentationEvent(receive)
  offPreferences = bridge.onPreferencesChanged(() => { void preferences() })
  document.addEventListener('mousemove', pointer)
  document.addEventListener('mouseleave', leave)
  try { receive(await bridge.presentation()); await preferences() }
  catch { error.value = 'Response connection unavailable. Open controls.' }
})
onUnmounted(() => {
  off(); offPreferences(); document.removeEventListener('mousemove', pointer)
  document.removeEventListener('mouseleave', leave); leave()
})
</script>
<template>
  <main class="companion-frame" data-presentation-version="1">
    <div class="drag" data-interactive>✦ MIKA <span>drag to move</span></div>
    <div class="avatar-slot" data-interactive aria-label="Avatar placeholder; Live2D not installed">
      <div class="orb" aria-hidden="true">✦</div>
      <p class="hint">Avatar setup pending</p>
    </div>
    <SpeechBubble :response="response" :hold-ms="holdMs" @stop="stop"/>
    <p v-if="error" class="overlay-error" data-interactive role="alert">{{ error }}</p>
    <div class="companion-controls" data-interactive>
      <span class="mic-off" title="No audio capture or speech engine is enabled">MIC OFF</span>
      <button class="quiet" @click="bridge.desktop('settings')">Controls / history</button>
      <button class="quiet" aria-label="Hide Mika" @click="bridge.desktop('hide')">×</button>
    </div>
  </main>
</template>
<style scoped>
.companion-frame{display:flex;flex-direction:column;align-items:center;gap:9px;height:100vh;width:100%;max-width:none;margin:0;padding:12px;background:transparent;border:0;border-radius:0;pointer-events:none;overflow:hidden}
.drag{flex-shrink:0;width:100%;padding:4px 6px;text-shadow:0 1px 4px #000;background:#1d182bdf;border-radius:8px;pointer-events:auto}
.avatar-slot{min-height:65px;flex:1;display:flex;flex-direction:column;justify-content:center;align-items:center;pointer-events:auto}
.avatar-slot .orb{width:min(130px,25vh);height:min(130px,25vh);font-size:55px;margin:0;background:radial-gradient(circle,#675077bb,#33284255);text-shadow:0 1px 5px #000;box-shadow:0 4px 20px #0006}
.avatar-slot .hint{margin:7px 0 0;padding:3px 7px;background:#171524eb;color:#d5cce2;border-radius:6px;font-size:10px}
.companion-controls{display:flex;gap:6px;align-items:center;justify-content:center;flex-shrink:0;pointer-events:auto}
.companion-controls button{padding:7px 9px;font-size:10px}.mic-off{font-size:9px;letter-spacing:.8px;background:#172325f5;color:#b5d6c6;border:1px solid #547064;border-radius:20px;padding:6px}
.overlay-error{margin:0;color:#ffd1c6;background:#321e26f5;border-radius:8px;padding:8px;font-size:11px;pointer-events:auto}
</style>
