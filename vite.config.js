import { sveltekit } from '@sveltejs/kit/vite';
import viteBasicSslPlugin from '@vitejs/plugin-basic-ssl';
import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [viteBasicSslPlugin(), sveltekit()],
  define: {
    meta: {
      version: JSON.parse(readFileSync('package.json', 'utf8')).version,
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })
    }
  },
  build: {
    target: 'esnext'
  }
});
