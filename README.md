# Soft Educational

An interactive biology notebook and game collection for Romanian high school students (Biologie, clasa a IX-a).
React + Vite, Tailwind CSS, Motion, React Router; Phaser 3 and dnd-kit for games. New code is
TypeScript (`allowJs`: the older app code stays JS). Works offline after the first visit (PWA).

## Setup

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # runs the checks (Romanian text, content, progress, asset licenses, tsc), then builds to dist/
```

In development, `/sistem-de-design` shows every token and primitive, plus the games kit. It does
not exist in the production build, and neither do the sandbox games.

**Building a game? Read [GAME-DEV.md](GAME-DEV.md).**

## Structure

```
src/
  content/ro/
    ui.js                 every interface string (read with t() from lib/i18n.js)
    topics/registry.js    the five topics (stubs until written): the only list you edit
    topics/<slug>.js      one file per published lesson, merged over its stub
    figures.js            figure captions, alt text and part labels
    encouragement.js      game reaction lines (needs native review)
    about.js, ds.js       /despre page text; design-system page strings (dev only)
  games/                  game shell, session, feel toolkit, Phaser wrapper, registry (GAME-DEV.md)
  assets/                 manifest.ts (every asset + license) and the cleaned sprites and sounds
  components/
    topic/                Term, MarginNote, Figure, InteractiveSlot, TopicNav, ProgressStamp, …
    quiz/                 BacQuiz, QuizItem, ChoiceGroup (G1 turns BacQuiz into a plain Quiz)
    illustration/         Illustration, Annotation, Sprite (shared treatment for every asset)
    layout/               Nav, LessonsDropdown, MobileMenu, Footer, PageMeta, navLinks (generated)
    primitives/           Module 1 primitives
  figures/                figure components, loaded on demand (none yet)
  interactives/           in-lesson interactive registry (none since G0; games replace them)
  lib/                    i18n, progress store (localStorage), useProgress, motion presets
  pages/                  Contents, TopicPage/TopicComingSoon, GamesIndex, GamePage,
                          About, Credits, NotFound (all lazy)
assets-src/               untouched asset originals (input of npm run assets:clean)
scripts/                  checks, audits, asset pipeline, PWA icon renderer
```

## Lessons

Five lessons in programa order, one file each in `src/content/ro/lessons/` (`celula`, `ecosisteme`,
`diversitatea-vietii`, `impactul-uman`, `laboratorul`), listed in `index.ts`. A lesson has 4–5 short
sections (one idea each; terms defined in bold where they first appear), "Pe scurt", "Verifică-te"
and `games: [{ gameId, afterSection }]`. Routes, the landing page, the navigation and the counts are
generated from these files and the game registry. `npm run lessons:check` enforces the rules.
Terms are explained inside the lessons only. Voice rules: `SITE-COPY.md`.

## Progress

Stored only in the browser, under the `localStorage` key `soft-educational:v1` (schema v2):
`{ v: 2, topics: { [slug]: { sectionsRead, quizBest, completed } }, games: { [id]: { bestScore, stars, plays, usedHelp } }, settings: { sound } }`.
Older data is migrated (v1 → v2 drops the removed XI–XII topics and keeps the sound setting);
unknown topic slugs and broken JSON are dropped without errors. If storage is blocked, progress
lives in memory for the visit and the Cuprins page says so.

## Checks

```bash
npm run check:ro        # cedilla ş ţ in src/ text files, em dashes in strings
npm run check:progress  # old / broken localStorage payloads never throw; saveGame rules
npm run assets:check    # every shipped asset listed with an allowed license (build gate)
npm run lessons:check   # lesson rules: sections, words, games, links from game data
npm run site:check      # real browser, production build: every route, links, games, a11y, keyboard, Lighthouse
npm run typecheck       # tsc --noEmit
npm run audit:ds        # real browser: motion, cursor, focus, reduced motion, touch
npm run audit:ro        # real browser: no English UI, glyphs, fonts, quotes, numbers
npm run audit:offline   # real browser: service worker, every route offline, Phaser from precache
```

The `audit:*` scripts use a local Chromium; set `CHROMIUM_PATH` if it isn't at
`%LOCALAPPDATA%\Chromium\Application\chrome.exe`. `audit:ds` and `audit:ro` need the dev server;
`audit:offline` needs a `VITE_SANDBOX=1` build served by `vite preview` (see GAME-DEV.md).

`CONTENT-REVIEW.md` lists what needs a subject-matter or native-speaker review.

## Deploying

Vercel, as a static SPA (`vercel.json` rewrites every route to `index.html`; the service worker is
never cached). No backend, no accounts, no analytics, no runtime network requests.
