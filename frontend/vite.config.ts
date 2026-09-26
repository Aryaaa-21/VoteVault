import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      external: [
        '@midnight-ntwrk/compact-js',
        '@midnight-ntwrk/compact-runtime',
        '@midnight-ntwrk/midnight-js-contracts',
        '@midnight-ntwrk/midnight-js-network-id',
        '@midnight-ntwrk/midnight-js-fetch-zk-config-provider',
        '@midnight-ntwrk/ledger-v8'
      ]
    }
  }
})
