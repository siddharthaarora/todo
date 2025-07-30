import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  define: {
    'import.meta.env.VITE_GOOGLE_CLIENT_ID': JSON.stringify('647630028904-tvkvo6pn6oqcgaj90rfu82aqff16ak8j.apps.googleusercontent.com'),
    'import.meta.env.VITE_API_URL': JSON.stringify('http://localhost:3001/api'),
  },
}) 