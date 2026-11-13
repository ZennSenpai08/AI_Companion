<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { Preferences, Readiness } from '../types/bridge'
const bridge = window.mika
const preferences = ref<Preferences | null>(null)
const readiness = ref<Readiness | null>(null)
const busy = ref(false)
const error = ref('')
const notice = ref('')
async function refresh() {
  busy.value = true; error.value = ''
  try {
    preferences.value = await bridge.preferences()
    readiness.value = await bridge.readiness()
  } catch { error.value = 'Local settings are unavailable. Start the backend, then refresh.' }
  finally { busy.value = false }
}
async function save() {
  if (!preferences.value) return
  busy.value = true; error.value = ''; notice.value = ''
  try { preferences.value = await bridge.preferences({...preferences.value}); notice.value = 'Preferences saved on this computer.' }
  catch { error.value = 'Could not save these settings. Check the local service and try again.' }
  finally { busy.value = false }
}
onMounted(refresh)
</script>
<template>
  <section aria-labelledby="engine-title">
    <h2 id="engine-title">AI and language</h2>
    <p v-if="readiness" class="hint">Available memory: {{ (readiness.hardware.freeRamBytes / 2**30).toFixed(2) }} GiB of {{ (readiness.hardware.totalRamBytes / 2**30).toFixed(2) }} GiB</p>
    <template v-if="preferences">
      <div class="selectors">
        <label>Default local model<select v-model="preferences.model" :disabled="busy"><option>qwen3.5:0.8b</option><option>qwen3.5:4b</option><option>qwen3.5:9b</option></select></label>
        <label>Reply language<select v-model="preferences.language" :disabled="busy"><option value="auto">Match me</option><option value="en">English</option><option value="fil">Filipino</option><option value="taglish">Taglish</option></select></label>
      </div>
      <p class="hint">Changing the model selects an already prepared local model. It does not download weights. Lite requires at least 2 GiB free RAM before starting inference.</p>
      <p v-if="readiness" role="status">{{ readiness.ollama.message }}</p>
      <ul v-if="readiness?.ollama.models.length"><li v-for="model in readiness.ollama.models" :key="model.name">{{ model.name }} · {{ (model.size_bytes / 2**30).toFixed(2) }} GiB on disk</li></ul>
      <h2>Microphone and voice</h2>
      <div class="notice"><strong>Microphone off</strong><p>{{ readiness?.engines.microphone.reason ?? 'Local speech setup is required before capture.' }}</p></div>
      <button class="quiet" disabled aria-describedby="mic-unavailable">Enable microphone</button>
      <p id="mic-unavailable" class="hint">{{ readiness?.engines.voice.reason ?? 'No local voice is configured.' }} Audio is not being captured or saved.</p>
      <label>Speech volume preference <input v-model.number="preferences.volume" type="range" min="0" max="1" step="0.05" :disabled="busy">{{ Math.round(preferences.volume*100) }}%</label>
      <p class="hint">Saved for the future local voice engine. This setting does not enable speech.</p>
      <h2>Avatar preferences</h2><p class="hint">{{ readiness?.engines.avatar.reason }}</p>
      <label><input v-model="preferences.cursor_tracking" type="checkbox" :disabled="busy"> Cursor tracking when supported by the rig</label>
      <label>Animation intensity preference <input v-model.number="preferences.animation_intensity" type="range" min="0" max="1" step="0.05" :disabled="busy"></label>
      <p class="hint">These preferences take effect after a compatible Live2D model is installed.</p>
      <div class="buttons"><button :disabled="busy" @click="save">Save preferences</button><button class="quiet" :disabled="busy" @click="refresh">Refresh local engines</button></div>
    </template>
    <button v-else class="quiet" :disabled="busy" @click="refresh">Retry settings</button>
    <p class="error" role="alert">{{ error }}</p><p class="hint" role="status">{{ notice }}</p>
  </section>
</template>
