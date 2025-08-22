import { defineConfig } from 'vite'

export default defineConfig({
  // 开发服务器配置
  server: {
    port: 3000,
    open: true,
    cors: true,
    // 启用 HTTPS（可选，用于某些 WebGPU 功能）
    // https: true
  },

  // 构建配置
  build: {
    target: 'esnext',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['onnxruntime-web']
        }
      }
    }
  },

  // 优化配置
  optimizeDeps: {
    include: ['onnxruntime-web']
  },

  // 静态资源处理
  assetsInclude: ['**/*.onnx', '**/*.json'],

  // 环境变量
  define: {
    __VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0')
  }
}) 