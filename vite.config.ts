

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  
  plugins: [
    tailwindcss(),
    react(),
    nodePolyfills(),
    
    ],
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      stream: 'stream-browserify',
      buffer: 'buffer',
      process: path.resolve(__dirname, 'node_modules/process/browser.js'), // ✅ THIS IS THE FIX
    },
  },
  optimizeDeps: {
    include: [
      'buffer',
      'process',
      'stream-browserify',

      '@solana/web3.js',
      '@solana/spl-token',

      
      ],
  },
});
