// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';
// import { resolve } from 'path';

// export default defineConfig({
//   plugins: [react()],
//   base: '/static/landing/', // Updated base
//   server: {
//     cors: {
//       origin: 'http://localhost:8000',
//     },
//     proxy: {
//       '/api': {
//         target: 'http://localhost:8000',
//         changeOrigin: true,
//         secure: false,
//       },
//     },
//   },
//   build: {
//     manifest: true,
//     outDir: '../../Backend/static/landing/', // Output to static/landing/
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


// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';
// import { resolve } from 'path';

// export default defineConfig({
//   plugins: [react()],
//   base: '/static/landing/',
//   server: {
//     cors: true,
//     proxy: {
//       '/api': {
//         target: 'http://localhost:8000',
//         changeOrigin: true,
//         secure: false,
//       },
//     },
//   },
//   build: {
//     outDir: resolve(__dirname, '../../Backend/static/landing'),
//     assetsDir: 'assets',
//     emptyOutDir: true,
//     manifest: true,
//     sourcemap: true,
//     rollupOptions: {
//       output: {
//         assetFileNames: 'assets/[name]-[hash][extname]',
//         chunkFileNames: 'assets/[name]-[hash].js',
//         entryFileNames: 'assets/[name]-[hash].js',
//       },
//     },
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
  base: '/static/landing/',
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
    outDir: 'dist',
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
