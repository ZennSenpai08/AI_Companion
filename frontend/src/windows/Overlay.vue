<script setup lang="ts">
const open = () => window.mika.desktop('settings')
const hide = () => window.mika.desktop('hide')
</script>
<template>
  <main class="avatar-diagnostic">
    <div class="drag">✦ MIKA <span>drag to move</span></div>
    <div class="orb" aria-hidden="true">✦</div><h1>Mika</h1>
    <p>Live2D setup pending</p><p class="hint">This is a diagnostic window.</p>
    <div class="buttons"><button @click="open">Open settings</button><button class="quiet" @click="hide">Hide</button></div>
    <p class="hint">MIC OFF · LOCAL ONLY</p>
  </main>
</template>
