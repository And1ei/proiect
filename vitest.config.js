// Unit tests (npm test). Kept apart from vite.config.js so tests don't load the PWA or React plugins.
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Tests see the production registry: no sandbox games
  resolve: { alias: { '@games-sandbox': fileURLToPath(new URL('./src/games/sandbox/disabled.ts', import.meta.url)) } },
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
    passWithNoTests: true,
  },
});
