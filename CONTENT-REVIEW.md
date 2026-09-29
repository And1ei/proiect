# Content review checklist

The site covers **Biologie, clasa a IX-a** (2026 programa) in five lessons,
`src/content/ro/lessons/<slug>.ts`, each with its "Verifică-te" questions. All lesson text, game copy
and species/molecule data were written by Claude and are marked `// REVIEW`. Nothing has been checked
by a teacher or a native speaker yet.

## Everything needs a teacher's check

- The five lessons: every section, margin note, "Gândește-te" answer, "Pe scurt" point and question.
- `src/content/ro/membrane-molecules.ts` (Poarta membranei): one explanation per molecule and mode.
- `src/content/ro/ecosystem-species.ts` (Echilibrul): species roles and facts, event mechanisms.
- `src/games/echilibrul/`: the population model is simplified on purpose; check that the directions
  it teaches (extinction of a predator, drought, eutrophication) are the ones the programa expects.

## Low confidence (needs teacher)

- `celula#moleculele-vietii` margin: "about 60% water in an adult" (common textbook figure; ranges vary).
- `celula#organite`: the short list of organelles and jobs; check which ones the programa names.
- `celula#transport-activ`: the Na⁺/K⁺ pump described without stoichiometry (3 Na⁺ out, 2 K⁺ in);
  check whether the programa expects the numbers.
- `ecosisteme#dominanta`: the worked example uses round numbers; check the formula notation used in class.
- `diversitatea-vietii#trei-domenii`: "arheele trăiesc des în medii extreme" (true for many, not all).
- `diversitatea-vietii#conservare` and the species fact: "cea mai mare colonie de pelicani comuni din Europa".
- `diversitatea-vietii` whyItMatters: medicines "from a mushroom or a plant" (penicillin, aspirin).
- `impactul-uman#amprenta`: "amprenta pozitivă" (handprint); check the term used in Romanian materials.
- `laboratorul#date-concluzie`: the germination numbers (4 vs 11 days) are illustrative, not measured.
- Species swaps in Echilibrul: *Biston betularia* instead of *Lymantria dispar* (no licensed
  silhouette; its caterpillars do eat oak), *Daphnia pulex* instead of *D. magna*.

## Native-speaker review

- Every `// REVIEW` file: the lessons, `src/content/ro/games/*.js`, `encouragement.js`, `ui.js`
  strings added in G2, G3 and S1.
- Voice rules are in `SITE-COPY.md`.
