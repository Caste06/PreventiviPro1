import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  server: {
    port: 5174,
    host: true,
  },
  build: {
    minify: 'esbuild',
    rollupOptions: {
      output: {
        entryFileNames: 'assets/app.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/app.[ext]',
        manualChunks: {
          vendor: ['react', 'react-dom'],
          pdf: ['jspdf'],
          icons: ['lucide-react']
        }
      },
    },
  },
})
