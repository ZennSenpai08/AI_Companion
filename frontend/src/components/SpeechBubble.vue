<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import type { ResponsePresentation } from '../types/bridge'
import { bubbleDeadline, bubbleVisible, presentationActive } from '../services/presentation.mjs'
const props = defineProps<{ response: ResponsePresentation; holdMs: number }>()
const emit = defineEmits<{ stop: [] }>()
const now = ref(Date.now())
const dismissed = ref(-1)
const reading = ref(false)
const focused = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined
const active = computed(() => presentationActive(props.response))
const visible = computed(() => bubbleVisible(props.response,
  reading.value || focused.value ? -Infinity : now.value, props.holdMs, dismissed.value))
const label = computed(() => ({ idle: '', thinking: 'Thinking', generating: 'Generating text',
  complete: props.response.audioActive ? 'Response' : 'Text response · no audio', interrupted: 'Stopped',
  error: 'Needs attention', listening: 'Listening', transcribing: 'Recognizing speech',
  speaking: props.response.audioActive ? 'Speaking' : 'Audio unavailable' })[props.response.phase])
watch(() => [props.response.revision, props.holdMs, reading.value, focused.value], () => {
  clearTimeout(timer); now.value = Date.now()
  const deadline = bubbleDeadline(props.response, props.holdMs)
  if (deadline !== null && deadline > now.value && !reading.value && !focused.value)
    timer = setTimeout(() => { now.value = Date.now() }, deadline - now.value)
}, { immediate: true })
onUnmounted(() => clearTimeout(timer))
</script>
<template>
  <Transition name="caption">
    <section v-if="visible" class="speech-bubble" data-interactive :data-response-phase="response.phase"
      :data-response-sequence="response.sequence" aria-label="Mika response"
      @mouseenter="reading=true" @mouseleave="reading=false" @focusin="focused=true" @focusout="focused=false">
      <div class="bubble-heading"><span role="status">{{ label }}</span>
        <button v-if="active" class="bubble-action" aria-label="Stop response" @click="emit('stop')">Stop</button>
        <button v-else class="bubble-action" aria-label="Dismiss response" @click="dismissed=response.revision">×</button></div>
      <p v-if="response.text" class="bubble-text" tabindex="0">{{ response.text }}</p>
      <p v-else class="bubble-text bubble-wait">{{ response.phase === 'thinking' ? 'One moment…' : label }}</p>
    </section>
  </Transition>
</template>
<style scoped>
.speech-bubble{width:100%;max-width:360px;position:relative;background:#171524fa;border:1px solid #b9a0e0;border-radius:16px;padding:11px 13px;box-shadow:0 5px 22px #0009;text-align:left;color:#f5f1ff;pointer-events:auto;flex-shrink:0}
.speech-bubble:before{content:'';position:absolute;top:-7px;left:calc(50% - 6px);width:12px;height:12px;transform:rotate(45deg);background:#171524;border-left:1px solid #b9a0e0;border-top:1px solid #b9a0e0}
.bubble-heading{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:10px;color:#d1bbee;position:relative;letter-spacing:.3px}
.bubble-action{padding:1px 6px;min-height:24px;background:#30273f;color:#f5f1ff;border:1px solid #8a719f;font-size:11px;flex-shrink:0}
.bubble-text{font-size:13px;line-height:1.5;white-space:pre-wrap;overflow-wrap:anywhere;max-height:min(26vh,10em);overflow-y:auto;margin:7px 0 0;user-select:text;scrollbar-width:thin}
.bubble-wait{color:#c8bfd5}.caption-enter-active,.caption-leave-active{transition:opacity .2s ease,transform .2s ease}.caption-enter-from,.caption-leave-to{opacity:0;transform:translateY(4px)}
@media(prefers-reduced-motion:reduce){.caption-enter-active,.caption-leave-active{transition:none}}
</style>
