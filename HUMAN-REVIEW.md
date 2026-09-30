# What still needs a human

Everything below was built and checked by scripts, not by people. Content details are in
[CONTENT-REVIEW.md](CONTENT-REVIEW.md).

## 1. Teacher (biology)

- [ ] The five lessons in `src/content/ro/lessons/`: every section, margin note, "Gândește-te"
      answer, "Pe scurt" point and "Verifică-te" question. Start with "Changed in F1" in
      CONTENT-REVIEW.md (new sentences in diversitatea-vietii and ecosisteme, new 5-question quizzes
      in impactul-uman and laboratorul).
- [ ] Game facts: `membrane-molecules.ts` (Poarta membranei), `ecosystem-species.ts` (Echilibrul),
      `safari-organisms.ts` (Safari la microscop), including the classification of every organism.
      Lowest confidence: *Euglena* filed under Protozoare.
- [ ] The "Low confidence" list in CONTENT-REVIEW.md, and the organism and species swaps.
- [ ] Whether the two topics without a game (Omul și mediul, Laboratorul) should stay as lessons
      with a quiz (current), or be cut (a one-line change to the lesson list in `lessons/index.ts`).

## 2. Native speaker (Romanian)

- [ ] Every file marked `// REVIEW`: the lessons, `src/content/ro/games/*.js`, `encouragement.js`,
      `ui.js`, the game data files. Voice rules: `SITE-COPY.md`.

## 3. Real phone

- [ ] Touch in all three games (both levels), the bottom bar with the home indicator, the lesson
      sheet opened from a game, the scroll rail on the left edge, landscape.
- [ ] Offline: open the site once online, then airplane mode, then every page and game.

## 4. Sound

- [ ] Listen to every game with sound on: volume, the win/lose sounds, nothing annoying on repeat.

## 5. Deploy preview

- [ ] Deploy a Vercel preview; click through every route from a direct link (SPA rewrite).
- [ ] Re-measure Lighthouse there. The numbers in `SITE-CHECK.md` come from a local server without
      compression and under a simulated slow connection, so they understate the real site.

## 6. Fresh eyes

- [ ] Someone who did not build the site clicks through all of it, reads one lesson, plays one game
      to the end, takes one quiz, and says where they got lost.
