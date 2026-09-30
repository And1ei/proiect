# Soft Educational

An interactive biology notebook for Romanian high school students (Biologie, clasa a IX-a, 2026
programa): five short lessons, each with a "Verifică-te" quiz, and learning games placed inside the
lessons where the knowledge they need has just been taught. Everything is in Romanian.

React + Vite, Tailwind CSS, Motion, React Router, zustand; Phaser 3 for the canvas games. New code
is TypeScript (`allowJs`: older app code stays JS). No backend, no accounts, no analytics, no runtime
network requests. Works offline after the first visit (PWA).

## Commands

```bash
npm install
npm run dev      # http://localhost:3000 (also shows /sistem-de-design and the sandbox games)
npm run build    # quick checks (Romanian text, lessons, progress, asset licenses, tests, tsc), then dist/
npm run verify   # everything, in order; non-zero exit on the first failure (see below)
```

`npm run verify` runs `tsc --noEmit`, the unit tests, `assets:check`, `lessons:check`, the
production build (and checks it contains no sandbox code), then serves the build with `vite preview`
and runs `site:check` (every route, links, games, axe accessibility and contrast, keyboard, the
learning loop, consistency of every count with `src/content/stats.ts`, the scroll indicator,
Lighthouse; it rewrites `SITE-CHECK.md`) and the offline test. It takes a few minutes. The browser
checks use a local Chromium; set `CHROMIUM_PATH` if it isn't at
`%LOCALAPPDATA%\Chromium\Application\chrome.exe`.

## Adding a game

Read **[GAME-DEV.md](GAME-DEV.md)**: the `GameDefinition` contract (a base level and its advanced
twin share a `family`), the shell, Phaser rules, assets and licences, and how a game is placed in a
lesson (`games: [{ gameId, afterSection }]` in `src/content/ro/lessons/<slug>.ts`). The site's counts,
the landing page, `/jocuri`, the navigation and the progress stamps follow the registry by themselves:
never type a number, read it from `src/content/stats.ts`. A topic without a game is a complete
lesson plus a 5-question "Verifică-te"; `lessons:check` enforces that, and fails a lesson that
mentions a game that isn't placed there.

## Structure

```
src/
  content/stats.ts        every count shown on the site, computed (games, levels, topics, plurals)
  content/ro/lessons/     the five lessons (index.ts lists them in programa order)
  content/ro/*.ts         game data: membrane molecules, ecosystem species, safari organisms
  content/ro/ui.js        every interface string (read with t() from lib/i18n.js)
  games/                  registry, shell, session, feel toolkit, Phaser wrapper, the games
  assets/                 manifest.ts (every asset with its licence) and the cleaned files
  components/             layout (nav, footer, scroll rail), lesson, quiz, primitives
  pages/                  landing (Contents), topic, /jocuri, game, about, credits, 404
assets-src/               untouched asset originals (input of npm run assets:clean)
scripts/                  checks, audits, verify, asset pipeline, PWA icons
```

## Offline mode

The service worker (Workbox, via vite-plugin-pwa) precaches the whole built site on the first
online visit: pages, fonts, assets, sounds and the Phaser chunk. After that every route and every
game works without a network. **Before presenting, open the site once while online** and let it
load. A hard reload (Ctrl+Shift+R) bypasses the service worker, so do not use it while offline.

## Progress

Stored only in the browser (`localStorage` key `soft-educational:v1`): sections read, best quiz
score, and per game the best score, stars and plays. Broken or old data is dropped or migrated
without errors; with storage blocked, progress lives in memory for the visit.

## Deploying

Vercel, as a static SPA: `vercel.json` rewrites every route to `index.html`, never caches `sw.js`,
and caches fingerprinted assets for a year. Performance numbers in `SITE-CHECK.md` are measured on a
local server without compression; re-measure on the deployed preview.

## Reviews

What still needs a person (teacher, native speaker, real phone, sound) is in
[HUMAN-REVIEW.md](HUMAN-REVIEW.md); content details in [CONTENT-REVIEW.md](CONTENT-REVIEW.md).
