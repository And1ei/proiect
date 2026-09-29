# Soft Educational

An interactive biology notebook and game collection for Romanian high school students (Biologie, clasa a IX-a).
React + Vite, Tailwind CSS, Motion, React Router. New code is TypeScript (`allowJs`: the older app code stays JS).

## Setup

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # runs check:ro and check:content first, then builds to dist/
```

In development, `/sistem-de-design` shows every token and primitive. It does not exist in the
production build.

## Structure

```
src/
  content/ro/
    ui.js                 every interface string (read with t() from lib/i18n.js)
    schema.js             JSDoc types for lessons, blocks, quiz items, glossary terms
    markup.js             [[id|text]] glossary markup parser (shared with the checks)
    topics/registry.js    lesson slugs and units: the only list you edit to add a lesson
    topics/<slug>.js      one file per lesson
    glossary.js           global glossary, each id owned by one lesson
    figures.js            figure captions, alt text and part labels
    about.js              /despre page text
    ds.js                 design-system page strings (dev only)
    feedback.js           reaction lines for right / wrong answers
    interactives/         text and data for each interactive (crosses, circuits, volumes…)
  content/data/
    geneticCode.js        standard genetic code (NCBI table 1), language-neutral
  components/
    topic/                Term, MarginNote, Figure, InteractiveSlot, TopicNav, ProgressStamp,
                          ReadingProgress, SectionIndex, BlockList, TopicHeader, ResetProgress
    quiz/                 BacQuiz, QuizItem, ChoiceGroup
    illustration/         Illustration (plate + wobble filter), Annotation (label + leader)
    layout/               Nav, LessonsDropdown, MobileMenu, Footer, PageMeta, navLinks (generated)
    primitives/           Module 1 primitives
  features/
    gamefeel/             FeedbackFlash, useStreak + StreakBadge, SpecimenStamp, sound, HintBox,
                          useGameSession, InteractiveFrame: shared by every interactive
    interactives/         punnett, decoder, heart, reflex, ventilation (+ shared PickPlace, Tabs,
                          ChoiceQuestion); logic lives in hooks/pure files next to each component
  figures/                SVG drawings (neuron, heart), loaded on demand
  interactives/           registry.js maps interactive type → lazy component
  lib/                    i18n, progress store (localStorage), useProgress, motion presets
  pages/                  Contents, TopicPage, Glossary, About, Credits, NotFound (all lazy)
```

## Adding a lesson

1. Create `src/content/ro/topics/<slug>.js`, following `schema.js` (copy an existing lesson).
2. Add the slug to `TOPIC_SLUGS` in `src/content/ro/topics/registry.js`.
3. Add its glossary terms to `glossary.js`.
4. Run `npm run check:content`.

Routes, navigation, the table of contents and the glossary pick it up automatically.

## Progress

Stored only in the browser, under the `localStorage` key `soft-educational:v1`:
`{ v: 1, topics: { [slug]: { sectionsRead, quizBest: { score, total }, completed } } }`.
A lesson is completed once every section has scrolled into view and its quiz has been finished
once. If storage is blocked, progress lives in memory for the visit and the Cuprins page says so.

## Checks

```bash
npm run check:ro       # cedilla ş ţ anywhere in src/, em dashes in strings
npm run check:content  # lesson structure, glossary refs, quiz shape; warns on reviewed: false
npm run audit:ds       # real browser: motion, cursor, focus, reduced motion, touch
npm run audit:ro       # real browser: no English UI, glyphs, fonts, quotes, numbers
npm run audit:content  # real browser: lessons, glossary popovers, quiz by keyboard, progress
npm run audit:interactives  # real browser: all five interactives by keyboard, game feel, sound, drag
```

The `audit:*` scripts need the dev server running and use a local Chromium; set
`CHROMIUM_PATH` if it isn't at `%LOCALAPPDATA%\Chromium\Application\chrome.exe`.

`CONTENT-REVIEW.md` lists the claims and terms to verify before a lesson is marked reviewed.
