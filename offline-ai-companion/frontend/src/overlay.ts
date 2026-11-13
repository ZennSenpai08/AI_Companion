import { createApp } from 'vue'
import Overlay from './windows/Overlay.vue'
import './style.css'
document.documentElement.classList.add('overlay')
createApp(Overlay).mount('#app')
