import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
    fs: {
      allow: ['..']
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  assetsInclude: ['**/*.onnx', '**/*.wasm'],
  define: {
    global: 'globalThis',
  }
}) 