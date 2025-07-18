




// // Frontend/dashboard/vite.config.js

// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';
// import { resolve } from 'path';

// export default defineConfig({
//   plugins: [react()],
//   base: '/static/dashboard/', // for production
//   server: {
//     port: 5173,
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
//     outDir: resolve(__dirname, '../../Backend/static/dashboard'),
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



// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

const isProduction = process.env.NODE_ENV === 'production';

export default defineConfig({
  plugins: [react()],
  base: isProduction ? '/static/dashboard/' : '/', // <- dynamic base
  server: {
    port: 5173,
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
