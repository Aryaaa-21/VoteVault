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
      '@midnight-ntwrk/compact-js': path.resolve(__dirname, './src/shims/midnight.ts'),
      '@midnight-ntwrk/compact-runtime': path.resolve(__dirname, './src/shims/midnight.ts'),
      '@midnight-ntwrk/midnight-js-contracts': path.resolve(__dirname, './src/shims/midnight.ts'),
      '@midnight-ntwrk/midnight-js-network-id': path.resolve(__dirname, './src/shims/midnight.ts'),
      '@midnight-ntwrk/midnight-js-fetch-zk-config-provider': path.resolve(__dirname, './src/shims/midnight.ts'),
      '@midnight-ntwrk/ledger-v8': path.resolve(__dirname, './src/shims/midnight.ts'),
    },
  },
})
