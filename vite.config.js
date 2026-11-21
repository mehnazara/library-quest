
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/library-quest/',
  build: {
    outDir: 'dist',
    assetsInlineLimit: 100000000
  }
});
