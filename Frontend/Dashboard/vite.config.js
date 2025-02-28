import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  base: '/static/', // Match Django's STATIC_URL
  server: {
    cors: {
      origin: 'http://localhost:8000', // Allow CORS from Django backend during development
    },
  },
  build: {
    manifest: true, // Generate manifest.json (useful for Django integration if needed)
    outDir: '../../Backend/static/', // Output directly to Django's static folder
    assetsDir: '', // No nested subdirectory for assets
    emptyOutDir: true, // Clear the directory before each build
    sourcemap: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'), // Alias for src directory
    },
  },
});