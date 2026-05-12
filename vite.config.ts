import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

const TRIAL_API_PORT = process.env.LETHE_TRIAL_API_PORT ?? '8787';

export default defineConfig(({ command }) => ({
  base: '/',
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],
  server: {
    proxy: {
      '/api': {
        target: `http://localhost:${TRIAL_API_PORT}`,
        changeOrigin: false,
      },
    },
  },
}))
