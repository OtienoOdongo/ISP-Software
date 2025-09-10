




// // Frontend/landingpage/vite.config.js

// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';
// import { resolve } from 'path';

// export default defineConfig({
//   plugins: [react()],
//   base: '/static/landing/', // for production
//   server: {
//     port: 5174,
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

const isProduction = process.env.NODE_ENV === 'production';

export default defineConfig({
  plugins: [react()],
  base: isProduction ? '/static/landing/' : '/',  // dynamic base
  server: {
    port: 5174, // different from dashboard to avoid conflict
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
    outDir: resolve(__dirname, '../../Backend/static/landing'),
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






// // frontend/landingpage/vite.config.js
// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';
// import { resolve } from 'path';

// export default defineConfig(({ mode }) => ({
//   plugins: [react()],
//   base: mode === 'production' ? '/static/landingpage/' : '/',
//   server: {
//     port: 5174,
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
//     outDir: resolve(__dirname, '../../Backend/static/landingpage'),
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
// }));