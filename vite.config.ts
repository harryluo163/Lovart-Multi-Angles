import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/Lovart-Multi-Angles/',
  server: {
    port: 3000
  }
})