import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { PrimeVueResolver } from '@primevue/auto-import-resolver'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    Components({
      resolvers: [PrimeVueResolver()],
    }),
  ],
  optimizeDeps: {
    include: ['pinia'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    sourcemap: true,
    // Aumenta il limite di warning per evitare avvisi su chunk di grandi dimensioni
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Configurazione manuale dei chunk per ottimizzare il bundling
        manualChunks: {
          // Chunk per le librerie principali
          'vue-vendor': ['vue', 'vue-router', 'vue-i18n'],
          'pinia-vendor': ['pinia'],
          // Chunk per le librerie di utilità
          'utils-vendor': ['date-fns'],
          'validation-vendor': ['@vuelidate/core', '@vuelidate/validators'],
          // Chunk per Chart.js
          'chart-vendor': ['chart.js'],
        },

        // Configurazione avanzata per la divisione dei chunk
        chunkFileNames: (chunkInfo) => {
          // Organizza i chunk per tipologia
          if (chunkInfo.name?.includes('vendor')) {
            return `vendor/[name]-[hash].js`
          }
          if (chunkInfo.name?.includes('admin')) {
            return `admin/[name]-[hash].js`
          }
          if (chunkInfo.name?.includes('committee')) {
            return `committee/[name]-[hash].js`
          }
          if (chunkInfo.name?.includes('user')) {
            return `user/[name]-[hash].js`
          }

          return `chunks/[name]-[hash].js`
        },
      },
    },
  },
})
