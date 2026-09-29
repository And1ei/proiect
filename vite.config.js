import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
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

// Theme colours for the web manifest come from the design tokens, never a second copy
const tokens = readFileSync(new URL('./src/styles/tokens.css', import.meta.url), 'utf8');
const paper = tokens.match(/--paper:\s*(#[0-9a-fA-F]{6})/)[1];

// Offline: every built file is precached (including the lazy Phaser chunk, fonts, sprites and
// sounds), so after the first visit the whole site works with no network. Disabled in dev.
const pwa = () =>
  VitePWA({
    registerType: 'autoUpdate',
    injectRegister: 'auto',
    devOptions: { enabled: false },
    manifest: {
      name: ui.brand,
      short_name: ui.brand,
      description: ui.meta.description,
      lang: ui.lang,
      start_url: '/',
      scope: '/',
      display: 'standalone',
      theme_color: paper,
      background_color: paper,
      icons: [
        { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,svg,woff2,mp3,png,webmanifest}'],
      // Phaser is ~1.2 MB: raise Workbox's 2 MB default with room to spare
      maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      navigateFallback: '/index.html',
      skipWaiting: true,
      clientsClaim: true,
      cleanupOutdatedCaches: true,
    },
  });

export default defineConfig(({ command }) => ({
  plugins: [htmlStrings(), react(), pwa()],
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
