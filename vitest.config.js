// Unit tests (npm test). Kept apart from vite.config.js so tests don't load the PWA or React plugins.
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
    passWithNoTests: true,
  },
});
