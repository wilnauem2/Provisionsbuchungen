import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  plugins: [vue()],
  base: '/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'esnext',
    minify: 'terser',
    sourcemap: false,
    manifest: true,
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  },
  server: {
    port: 3000,
    open: true,
    strictPort: true
  },
  optimizeDeps: {
    exclude: ['vite']
  },
  resolve: {
    alias: {
      'crypto': 'crypto-browserify'
    }
  },
  esbuild: {
    target: 'es2020'
  }
})
