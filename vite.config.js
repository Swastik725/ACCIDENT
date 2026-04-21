import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    cssMinify: 'esbuild',     // ← This is the key line that fixes the parser crash
    sourcemap: true,
    cssCodeSplit: false,
  },
  css: {
    devSourcemap: true,
  },
});