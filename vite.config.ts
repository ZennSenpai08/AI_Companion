import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  root: 'frontend',
  base: './',
  plugins: [vue()],
  server: { host: '127.0.0.1', port: 5173, strictPort: true },
  build: { outDir: '../dist', emptyOutDir: true, rollupOptions: {
    input: { panel: fileURLToPath(new URL('./frontend/index.html', import.meta.url)),
      overlay: fileURLToPath(new URL('./frontend/overlay.html', import.meta.url)) },
  } },
})
