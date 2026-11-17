import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // SPA fallback: serve index.html for all non-asset routes
    // This prevents ERR_FILE_NOT_FOUND on browser refresh
    historyApiFallback: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  },
  // Preview server (production build) also needs SPA fallback
  preview: {
    port: 4173,
    historyApiFallback: true,
  },
  build: {
    // Generate source maps for debugging
    sourcemap: false,
    outDir: 'dist',
    rollupOptions: {
      output: {
        // Split vendor chunks for better caching
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts'],
        }
      }
    }
  }
})
