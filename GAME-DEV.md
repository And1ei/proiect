# GAME-DEV: building games for Soft Educational

How games are built here. Modules G1 onwards follow this file. The two sandbox games
(`src/games/sandbox/`) are working references: copy their patterns.

## Folder map

```
src/games/
  core/          the contract and the shell every game runs in
    types.ts         GameDefinition, GameProps, RunResult, HudConfig
    defineGame.ts    builds a definition (wraps load() in React.lazy)
    session.ts       zustand session store: score, lives, streak × multiplier, hints, status
    scoring.ts       pure multiplier / milestone rules (safe to import from scenes)
    useGameSession.ts   one store per shell + useSessionState(selector)
    GameShell.tsx    intro → playing ⇄ paused → won/lost; HUD, clock, auto-pause, a11y, feel, progress
    Hud.tsx, IntroScreen.tsx, PauseOverlay.tsx, HelpDialog.tsx, ResultsScreen.tsx, Lives.tsx, Stars.tsx
    preload.ts       preloadGame(): fetch a game's chunk (and Phaser) on intent
  feel/          game feel toolkit
    sfx.ts           Howler wrapper: play('correct'), muted by default, never throws
    burst.ts         palette confetti: burst('success' | 'streak', origin?)
    juice.tsx        useShake, usePulse/<Pulse>, useSquash, useFloatingText/<FloatingText>
    encouragement.ts encourage('correct' | 'wrong' | 'streak' | 'nearWin' | 'finish' | 'tryAgain')
    SpecimenStamp, FeedbackFlash, StreakBadge, HintBox, SoundToggle   (from Module 3)
  phaser/        Phaser 3 integration
    loadPhaser.ts    the only runtime import of 'phaser' outside scene modules
    PhaserGame.tsx   React component that mounts a game
    BaseScene.ts     base class for every scene
    bus.ts           typed React ⇄ Phaser event bus
    palette.ts       design tokens → numbers/strings for scenes
    bridge.ts, fonts.ts
  sandbox/       dev-only reference games (A: Phaser, B: dnd-kit)
  celula/poarta-membranei/   G2, the first real game: the pattern for G3–G6 (below)
  registry.ts    GAMES: every playable game
src/assets/
  manifest.ts    every shipped image and sound: source, author, license, changes
  urls.ts        getAsset(id) / soundUrl(event): id → bundled URL
  icons/ organisms/ ui/ sounds/ textures/   cleaned files (generated, don't edit by hand)
assets-src/      untouched originals, the input of npm run assets:clean
src/components/illustration/Sprite.tsx   <Sprite id>: the shared visual treatment
src/content/ro/encouragement.js          reaction lines (needs native review)
```

Routes: `/jocuri` lists games by topic, `/joc/:gameId` plays one.

## Adding a game: checklist

1. **Assets first.** List every sprite and sound the game needs. Source them through the asset
   pipeline (below). If something doesn't exist in a licensed source, stop and ask. Never draw it.
2. **Strings.** Put the Romanian copy in `src/content/ro/games/<game-id>.js` (title, tagline,
   instructions, controls, in-game text). Comma-below ș ț, `„ ”` quotes, no em dashes, no
   exclamation-mark spam, gender-neutral phrasing toward the player.
3. **Component.** `src/games/<topic>/<game-id>/<Name>Game.tsx`, default-exporting a component
   that takes `{ session }: GameProps`. DOM game: build it with React + dnd-kit (copy Sandbox B).
   Phaser game: render `<PhaserGame>` and put the gameplay in a scene module (copy Sandbox A).
4. **Definition.** Add a `defineGame({...})` entry to `REAL_GAMES` in `src/games/registry.ts`:
   `id`, `topicSlug`, `title`, `tagline`, `instructions`, `controls`, `estimatedMinutes`,
   `difficulty`, `usesPhaser`, `hud`, `stars`, `load: () => import('./…')`.
5. **Report through the session** (DOM) or the bus (Phaser): `hit`, `miss`, `loseLife`,
   `addScore`, `useHint`, `nearWin`, `finish('won' | 'lost')`. The shell turns these into
   score, streak, sound, particles, reaction lines, announcements and saved progress. Don't
   duplicate that inside the game.
6. **Focus target.** Mark the element that should get keyboard focus on start/resume with
   `data-game-stage` (`<PhaserGame>` does this for you).
7. **Check:** `npm run typecheck`, `npm run assets:check`, `npm run build`, then play it with
   keyboard only, on a 375 px wide viewport, with reduced motion on (the design-system page has
   a dev toggle), and with sound on and off. `npm run audit:offline` on a `VITE_SANDBOX=1`-style
   build if you changed anything about loading.

## The GameDefinition contract

```ts
defineGame({
  id: 'membrana-celulara',            // /joc/membrana-celulara, also the progress key
  topicSlug: 'celula',                 // registry slug; "Înapoi la lecție" goes there
  title, tagline,                      // Romanian
  instructions: ['…', '…'],            // 2–5 short sentences (intro + "Cum se joacă")
  controls: { touch: '…', mouse: '…', keyboard: '…' },  // omit an input the game can't use
  estimatedMinutes: 3,
  difficulty: 'usor' | 'mediu' | 'greu',
  usesPhaser: true,                    // the shell preloads the Phaser chunk on intent
  hud: { lives: 3, timer: { mode: 'down', limitMs: 90_000, onTimeUp: 'won' }, hints: true },
  stars: (r) => (r.outcome !== 'won' ? 0 : r.misses === 0 ? 3 : r.misses < 3 ? 2 : 1),
  load: () => import('./MembranaGame'),
});
```

`stars(result)` gets a `RunResult`: `outcome, score, lives, maxLives, bestStreak, misses, hits,
hintsUsed, elapsedMs` (and `recap`, below). Keep it pure. Hints never lower stars: the stamp tells that story.

Two optional fields, added in G2 (games without them render exactly as before):

- **`recap`**: up to 3 `{ title, text }` "Ce ai învățat" items on the results screen, usually built
  from the player's most-missed items and their explanation sentences. DOM games call
  `session.setRecap(items)` or `session.finish(outcome, items)`; Phaser scenes emit
  `this.emit('recap', { items })` or `this.emit('finished', { outcome, recap })`. A run can end
  inside `loseLife()`, so a game that can lose on lives keeps the recap current *before* each
  `life-lost` (Poarta membranei emits `recap` right before `life-lost`).
- **`howTo`**: `() => import('./HowTo')`, an animated "Cum se joacă" shown full width on the intro
  screen instead of the plain instruction list. DOM only, no Phaser; preloaded with the game. The
  instructions still appear in the HUD's help dialog.

One more optional field, added in F1:

- **`family`**: entries that share a family are **one game with several levels** (the base entry
  first in the registry, then its advanced twin). Defaults to `id`. The site never types a count:
  `src/content/stats.ts` computes games (families), levels (entries), topics with and without games,
  play minutes and the Romanian plurals (`1 joc`, `3 jocuri`, `20 de jocuri`) from the registry.
  Show numbers from there only; `site:check` compares the rendered text with it.

## Session API

| Call | Effect |
| --- | --- |
| `session.hit(base = 10, at?)` | streak +1, then `base × multiplier` points |
| `session.miss(at?)` | streak back to 0 |
| `session.loseLife(at?)` | −1 life and streak; at 0 lives the run ends `lost` |
| `session.addScore(base, at?)` | bonus points × multiplier, streak untouched |
| `session.useHint()` | counts a hint; the result becomes "Completat cu ajutor" |
| `session.nearWin()` | one near-win reaction line per run |
| `session.finish('won' \| 'lost', recap?)` | ends the run → results screen, progress saved |
| `session.setRecap(items)` | "Ce ai învățat" items for the results screen (max 3) |
| `session.pause()` / `resume()` / `restart()` / `reset()` | normally the shell's job |

`at` is a viewport point (`clientX/clientY`, or an element's rect centre); DOM games get a
floating "+points" there. Multiplier: streak 3 → ×2, 6 → ×3, 10 → ×4 (`core/scoring.ts`).
Read state in components with `useSessionState(session, (s) => s.score)`. Actions are ignored
unless the status is `playing`, so a paused game can't score.

Progress (`src/lib/progress.js`, localStorage, schema v2) stores per game
`{ bestScore, stars, plays, usedHelp }`; `useProgress().game(id)` reads it.

## Game feel

The shell already plays the shared reactions: `correct`/`wrong`/`streak`/`win`/`lose` sounds,
a streak burst at the streak badge, a success burst on winning, a shake on a lost life,
reaction lines (throttled), aria-live announcements. Use the toolkit only for game-specific
moments:

- `play('pop' | 'whoosh' | 'levelUp' | …)`: nothing plays before a user gesture or while muted
  (the default), and a missing or broken sound is silently skipped.
- `burst('success' | 'streak', { x, y })`: palette colours, blob-shaped particles, off under
  reduced motion.
- `useShake()`, `usePulse()`, `useSquash()`, `useFloatingText()`: springs only, all inert under
  reduced motion.
- `encourage(situation, vars)`: never the same line twice in a row.
- `<FeedbackFlash>` + `useFlash()` for "this element was judged", `<HintBox>` for hints.

**Motion rule:** springs only (`src/lib/motion.js` presets or explicit `type: 'spring'`). No
linear, no default easing. In Phaser, which has no springs, use `Back.Out` / `Elastic.Out` eases.

## Phaser rules

- Never `import 'phaser'` in a React component. React code uses `<PhaserGame>`; the scene module
  imports Phaser and is passed as a dynamic import:
  `scenes={() => import('./scenes').then((m) => [MainScene])}` (see Sandbox A).
- Phaser is its own chunk (`vite.config.js`) and loads only when a Phaser game mounts or is
  preloaded. Check the build output: `index-*.js` must not grow by Phaser's ~1.2 MB.
- **Scale: FIT over a fixed design size**, e.g. `design={{ width: 960, height: 600 }}`. Why
  FIT and not RESIZE: in Phaser 3, RESIZE sets the canvas to CSS pixels, so it is blurry on every
  phone and makes each scene re-layout on every resize. FIT keeps one coordinate space
  (same difficulty and hit sizes everywhere) and we render it at design × min(devicePixelRatio, 2),
  with the camera zoomed back so scenes only ever see design units. The canvas letterboxes on paper.
  Pick the aspect ratio per game; for phone-first games consider a portrait design size.
- Extend `BaseScene`; call `this.setupView()` first in `create()`; reset every field in `init()`
  (restart reuses the scene instance).
- Colours: `this.palette.num.eosin` / `this.palette.hex.ink`. Never a hex literal in a scene.
- Text: `this.addText(...)` (site fonts, device resolution). `<PhaserGame>` waits for the fonts.
- Sprites: `this.loadSprites(ids, maxSize)` in `preload()`, `this.addSpecimen(id, x, y, size, { tone })`
  in `create()`: same ink outline + paper-cut shadow as `<Sprite>`.
- Talk to React only via `this.emit('hit' | 'miss' | 'life-lost' | 'score' | 'near-win' | 'finished' | 'sfx', …)`
  and `this.listen('pause' | 'resume' | 'mute' | 'restart', …)`. No zustand, React or Howler in scenes.
- Pause/resume/restart and tab-hidden are handled by `<PhaserGame>`; don't add your own.
- Honour `this.reducedMotion`: no camera shake, no wobble, fades instead of pops.
- Hit areas at least 44 CSS px at a 375 px viewport (design size × scale; see `drift/config.ts`).
- Dev only: `window.__phaserGame` is the running game, for audits and the console.

## Poarta membranei: the pattern for G3–G6

`src/games/celula/poarta-membranei/`: two registry entries (`poarta-membranei`,
`poarta-membranei-avansat`) sharing one component with a `mode` prop.

- **Content is data.** The biology is `src/content/ro/membrane-molecules.ts` (one entry per situation,
  with a route and one explanation sentence per mode). It is checked by a data-driven unit test
  (`membrane-molecules.test.ts`) that encodes the rules, e.g. the pump is always against the gradient.
  Copy lives in `src/content/ro/games/<id>.js`, marked `// REVIEW`.
- **Models are pure and tested.** `osmosisModel.ts` has no Phaser; `npm test` checks direction,
  equilibrium and bounds. All tuning (waves, speeds, ATP, osmosis events) is in `config.ts`.
- **Procedural art that isn't a living thing** (molecules, the bilayer, membrane proteins, cues,
  formula chips) is drawn with Canvas 2D in `art.ts` and baked into Phaser textures once, at device
  resolution. The intro's `HowTo.tsx` draws the same functions on DOM canvases, so both show the real
  visuals. Cells and organelles still come from the manifest.
- **Text sits in the DOM, over the canvas.** Gate names, key hints, banners and gauge labels are an
  `aria-hidden` overlay positioned in % of the design size, so they stay crisp and legible at 375 px.
  Explanations, notices and DOM controls sit in a strip under the canvas, with their own `LiveRegion`.
- **A game link** (`link.ts`) carries what only this game shows (selection, explanations, osmosis
  readouts, hint and control requests from DOM buttons). The scene gets it through a class factory
  (`membraneScenes(mode, link)`), so there are no globals. Shell events still go through the bus.
- **Formulas**: store real subscripts (`O₂`, `Na⁺`). DM Mono has no glyphs for them, so render with
  `formulaRuns()` (canvas) or `<Formula>` (DOM, `<sub>`/`<sup>`).
- **Adaptive help**: after 3 failures in a row, spawns slow down for a while and a kind line says so.

## Games and lessons (S1)

Every game belongs to a lesson: `topicSlug` is the lesson's slug (`src/content/ro/lessons/<slug>.ts`),
and the lesson places the game with `games: [{ gameId, afterSection }]`, right after the section
that teaches what the game needs. Nothing new to declare on the `GameDefinition`.

- **Lesson sheet.** The shell renders `<LessonSheet>` (a native `<dialog>` slide-over with the lesson,
  games hidden). Anything inside a game can open it with `useLessonSheet().open('celula#membrana')`
  (or `'celula'`). Opening pauses a running game; closing never resumes it (resuming is an explicit
  press on "Continuă"). Esc closes the sheet, not the game.
- **Intro.** The intro shows the lesson's "Pe scurt" and "Recitește lecția" (opens the sheet at the
  game's `afterSection`). Until that section has been read, reading is the suggested button and
  starting is "Sari peste, joc direct"; afterwards "Începe" is primary. Reading is never forced.
- **Explanations.** Game data may carry an optional `lessonSection: 'slug#section'` next to each
  explanation (`membrane-molecules.ts` per mode, `ecosystem-species.ts` per event). When present the
  game shows "→ vezi în lecție". `npm run lessons:check` fails if a `lessonSection` doesn't exist.
- **Results.** `RecapItem.section` (optional, `'slug#section'`) adds "→ vezi în lecție" to a recap
  item. After a run with a hint or 3+ misses, one line names the section that explains it. The primary
  button is "Înapoi la lecție" and goes to the next unread section of the lesson (else the topic page).

## Echilibrul: the pattern for simulation games without Phaser

`src/games/echilibrul/` (G3) is React + SVG, `usesPhaser: false`, so no Phaser chunk loads on its routes.

- **Model → engine → view.** `ecosystemModel.ts` is pure and seeded (direction-of-effect tests, determinism).
  `engine.ts` is a plain class that owns the run (events with telegraphs, tools and cooldowns, yearly
  scoring, extinctions and their causes) and returns *happenings*; the component turns them into session
  calls and announcements. Dev only: `window.__ecoEngine`.
- **Loop:** one `requestAnimationFrame` advances the engine; React re-renders at most every 150 ms.
  Heavy SVG pieces use `memo` with a comparator on what is *visible* (headcounts, rounded values,
  a chart point every 0.2 years). Never compare an array the engine mutates in place: pass its length.
- **Silhouettes in SVG:** `<image href={getAsset(id).url}>` inside a group with a tint + paper-cut
  shadow filter (`SilhouetteFilters`), one filter per species group, not per individual.
- **Charts on phones:** draw 1:1 in CSS pixels (measure the width) instead of scaling a viewBox, and
  move series labels into an HTML legend below ~480 px.
- 4× CPU-throttled: 45–54 fps (G3 report).

## Testing

`npm test` runs Vitest (`src/**/*.test.ts`, Node environment): pure models, data rules, the session.
It also runs in `prebuild`.

## Assets: rules and pipeline

**No placeholder art.** No coloured rectangles standing in for sprites, no organisms or cells
drawn as hand-written SVG paths. `getAsset()` and `addSpecimen()` throw for a missing id, on
purpose. UI chrome (rings, grid lines, the HUD icons) may be drawn; living things may not.

Adding an asset:

1. Find it on a licensed source and **check the license on the item's own page**:
   Bioicons (license is in the file's folder on GitHub), Servier Medical Art, PhyloPic (per
   image; filter to CC0 / CC BY), Kenney (CC0), OpenMoji / Twemoji (attribution),
   Wikimedia Commons (public-domain plates).
2. Save the untouched original in `assets-src/<source>/`.
3. Add an entry to `src/assets/manifest.ts`: `id`, `file`, `kind`, `title` (Romanian),
   `sourceName`, `sourceUrl` (the item page), `author`, `license`, `attributionRequired`,
   `modifications` (Romanian, shown on /credite), `raw`, and for SVGs `color: 'palette' | 'mono'`
   (`dropBackground` if the export has an artboard rectangle; `hue: 'eosin'` etc. snaps every colour
   into one stain family, so several states of one object stay the same colour). Sounds need an `event`.
4. `npm run assets:clean -- <id>` (needs Chromium for bbox cropping and ffmpeg for audio; set
   `CHROMIUM_PATH` / `FFMPEG_PATH`). It runs SVGO, inlines styles, crops and squares the viewBox,
   and snaps every colour to the stain palette (`palette`) or to `currentColor` (`mono`). Audio
   becomes mono 64 kbps MP3, under 50 KB.
5. `npm run assets:check`, also run before every build. It fails on unlisted files, missing
   originals, NC/ND or unknown licenses, BY licenses without attribution, and site-root source URLs.
   **CC-BY-SA is never auto-accepted:** it needs `licenseReview: { by, date, note }` from a person.
6. The credits page lists the new asset automatically.

Current sound mapping (`click`, `correct`, `wrong`, `streak`, `levelUp`, `win`, `lose`, `pop`,
`whoosh`) was chosen from Kenney's Interface Sounds by name and length. **Someone should listen to
them** and swap any that feel wrong (change the `raw` file in the manifest, rerun assets:clean).

## Accessibility requirements

- Every action has a keyboard path. dnd-kit games use the zone-to-zone `KeyboardSensor`
  (Sandbox B); arcade games give a keyboard reticle or equivalent (Sandbox A).
- Esc pauses. Resuming always needs an explicit press. The shell manages focus
  (stage on start/resume, "Continuă" on pause, the results heading at the end); keep your own
  focus sensible after DOM changes (Sandbox B moves focus to the next item after a drop).
- Everything important is announced (the shell does score, lives, streak, status); add
  Romanian dnd-kit announcements for drag games.
- Visible focus rings (global `:focus-visible` style), targets ≥ 44 px, no information by colour alone.
- `prefers-reduced-motion` (and the dev simulation): no shake, parallax or particles; keep text,
  colour and sound feedback.
- Canvas games: the canvas is `aria-hidden`; the stage has an accessible name (`label` prop).

## Performance budget

- 60 fps on a mid-range phone. Keep live sprites to a few dozen, prefer tweens over per-frame
  allocations, destroy what leaves the screen, cap particles.
- Phaser loads only on Phaser game routes (preloaded on hover/intro). The entry bundle for `/`
  was 144 KB gzip after G0; a game must not add to it.
- Sprites are rasterised at `size × dpr`; don't load them bigger than you draw them.
- Sounds are short one-shots (< 50 KB each), loaded after the first gesture.

## Offline

Everything is precached by the service worker (`vite-plugin-pwa`), including Phaser, sprites,
sounds and fonts. No runtime network requests: no CDNs, no hot-linked images, no Google Fonts.
To test: `VITE_SANDBOX=1 npm run build`, `npx vite preview --port 4173`, then
`npm run audit:offline` (real Chromium, network cut, every route reloaded). Never deploy a
`VITE_SANDBOX=1` build.
