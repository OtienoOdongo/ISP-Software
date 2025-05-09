// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';
// import { resolve } from 'path';

// export default defineConfig({
//   plugins: [react()],
//   base: '/static/', // Match Django's STATIC_URL
//   server: {
//     cors: {
//       origin: 'http://localhost:8000', // Allow CORS from Django backend during development
//     },
//   },
//   build: {
//     manifest: true, // Generate manifest.json (useful for Django integration if needed)
//     outDir: '../../Backend/static/', // Output directly to Django's static folder
//     assetsDir: '', // No nested subdirectory for assets
//     emptyOutDir: true, // Clear the directory before each build
//     sourcemap: true,
//   },
//   resolve: {
//     alias: {
//       '@': resolve(__dirname, './src'), // Alias for src directory
//     },
//   },
// });



// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';
// import { resolve } from 'path';

// export default defineConfig({
//   plugins: [react()],
//   base: '/static/dashboard/', // Updated base
//   server: {
//     cors: {
//       origin: 'http://localhost:8000',
//     },
//   },
//   build: {
//     manifest: true,
//     outDir: '../../Backend/static/dashboard/', // Output to static/dashboard/
//     assetsDir: '',
//     emptyOutDir: true, // Safe to clear since it’s a subdirectory
//     sourcemap: true,
//   },
//   resolve: {
//     alias: {
//       '@': resolve(__dirname, './src'),
//     },
//   },
// });



import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  base: '/static/dashboard/',
  server: {
    cors: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: resolve(__dirname, '../../Backend/static/dashboard'),
    assetsDir: 'assets',
    emptyOutDir: true,
    manifest: true,
    sourcemap: true,
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});


