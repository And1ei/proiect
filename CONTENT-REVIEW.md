# Content review checklist

The site covers **Biologie, clasa a IX-a** (2026 programa) in five lessons,
`src/content/ro/lessons/<slug>.ts`, each with its "Verifică-te" questions. All lesson text, game copy
and species/molecule data were written by Claude and are marked `// REVIEW`. Nothing has been checked
by a teacher or a native speaker yet.

## Everything needs a teacher's check

- The five lessons: every section, margin note, "Gândește-te" answer, "Pe scurt" point and question.
- `src/content/ro/membrane-molecules.ts` (Poarta membranei): one explanation per molecule and mode.
- `src/content/ro/ecosystem-species.ts` (Echilibrul): species roles and facts, event mechanisms.
- `src/content/ro/safari-organisms.ts` (Safari la microscop): the groups, the clue catalogue, the
  classification and the explanation of each of the 18 organisms.
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

- Safari la microscop (G4a), classification:
  - *Euglena* is filed under **Protozoare** (flagellate without a cell wall, as Euglenozoa in the
    seven-kingdom system), although it has chloroplasts. Lowest confidence of the roster.
  - Green algae (*Closterium*, *Chlamydomonas*, *Volvox*) are "Plante (alge)"; diatoms and
    dinoflagellates are Chromista. Check this matches the programa's grouping.
  - Base mode has only 2 bacteria (*Bacillus subtilis*, *Streptococcus* sp.).
  - "ciupercă cu pălărie" and "algă brună" are type options with no organism behind them (they are
    wrong choices only).
  - Slide 3 context: homemade yogurt left in the fridge, with the lactic bacteria that made it and
    the yeast and moulds that grew on it.
- Safari organism swaps (all for licensing: only CC-BY-SA or NC images existed, or none):
  *Lactobacillus* → *Streptococcus* sp.; *Nostoc* → *Arthrospira platensis* (spirulină);
  *Halobacterium salinarum* → *Halobacterium* sp.; *Pinnularia*/*Navicula* → *Nitzschia* and
  *Asterionella*; *Spirogyra* → *Closterium* and *Chlamydomonas*; *Ceramium rubrum* dropped (marine);
  *Daphnia magna* → *D. pulex*.

## Changed in F1 (teacher please re-check)

- `src/content/ro/lessons/diversitatea-vietii.ts`: the game tests things the lesson didn't teach, so
  it gained the smallest sentences that teach them before the game: cyanobacteria (photosynthesis
  without a nucleus) and "protists split into protozoa and Chromista" (`#trei-domenii`); protozoa
  have no cell wall and move with cilia, pseudopods or a flagellum (euglena, with chloroplasts);
  Chromista (diatoms with a silica case, dinoflagellates with plates, brown algae); fungi absorb
  food through the wall, yeast buds, moulds have hyphae and spores (`#microorganisme`);
  chloroplasts, green algae belong with plants, animals are multicellular with tissues and organs
  (`#plante-animale`). Chromista links in the game now go to `#microorganisme`.
- `src/content/ro/lessons/ecosisteme.ts` (`#echilibru`): "vânat sau pescuit prea mult" and a margin
  note on eutrophication, both tested by Echilibrul before this.
- `src/content/ro/lessons/celula.ts` (`#membrana` margin): no longer mentions the game; proteins
  enter in vesicles.
- `src/content/ro/lessons/impactul-uman.ts` and `laboratorul.ts`: no game in these topics, so
  "Verifică-te" now has 5 why/what-happens-if questions (3 new or rewritten in each).
- Not added (would break the rules, or it's only a name): the species names in Echilibrul
  (huhurez, plătică, știucă, pelican, molia mestecănului) are not all named in `ecosisteme`; the game
  only tests their role (producer, consumer of order I/II/III), which the lesson teaches.
- `impactul-uman#poluare-deseuri`: the "Gândește-te" card asks about reduce/reuse vs recycle, which
  the section body doesn't teach (from S1; left as is, please decide).

## Native-speaker review

- Every `// REVIEW` file: the lessons, `src/content/ro/games/*.js`, `encouragement.js`, `ui.js`
  strings added in G2, G3 and S1.
- Voice rules are in `SITE-COPY.md`.
