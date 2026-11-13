import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'

export default defineConfig({
  root: 'frontend',
  base: './',
  plugins: [vue()],
  server: { host: '127.0.0.1', port: 5173, strictPort: true },
  build: { outDir: '../dist', emptyOutDir: true, rollupOptions: {
    input: { panel: resolve(__dirname, 'frontend/index.html'),
      overlay: resolve(__dirname, 'frontend/overlay.html') },
  } },
})
