import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    cors: {
      origin: 'http://localhost:8000',  // Allow CORS from Django backend
    },
  },
  build: {
    manifest: true,  // Generate manifest.json
    outDir: '../../Backend/static/',  // Output directory set to Django's static folder
    assetsDir: 'static',  // Assets subdirectory set to 'static'
    emptyOutDir: true,  // Clear the directory before each build
    rollupOptions: {
      input: resolve(__dirname, 'src/main.jsx'),  // Adjusted to absolute path
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),  // Alias for src directory
    },
  },
});