import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import ui from './src/content/ro/ui.js';
import { lookup } from './src/lib/i18n.js';

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// Fills {{ key.path }} placeholders in index.html from the same string file the app uses
const htmlStrings = () => ({
  name: 'html-strings',
  transformIndexHtml: (html) =>
    html.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (m, key) => escapeHtml(lookup(ui, key))),
});

export default defineConfig(({ command }) => ({
  plugins: [htmlStrings(), react()],
  server: { port: 3000, strictPort: true },
  resolve: {
    alias: {
      // Sandbox games exist on the dev server and in VITE_SANDBOX=1 builds (offline test) only
      '@games-sandbox': fileURLToPath(
        new URL(
          command === 'serve' || process.env.VITE_SANDBOX === '1' ? './src/games/sandbox/index.ts' : './src/games/sandbox/disabled.ts',
          import.meta.url,
        ),
      ),
    },
  },
  build: {
    // Game assets stay real files (never data: URIs): Phaser's loader fetches them by URL and the
    // service worker precaches them by name. Other small files keep Vite's default inlining.
    assetsInlineLimit: (file) => (/\.(svg|mp3)$/.test(file) ? false : undefined),
    rolldownOptions: {
      output: {
        // Rolldown's replacement for Rollup's manualChunks (deprecated in Vite 8).
        // Phaser (~1 MB) gets a chunk of its own. It is only reached through the dynamic
        // import() in src/games/phaser/PhaserGame.tsx, so only Phaser game routes download it.
        codeSplitting: {
          groups: [{ name: 'phaser', test: /[\\/]node_modules[\\/]phaser[\\/]/, priority: 10 }],
        },
      },
    },
  },
}));
