# Content review checklist

All five lessons have `reviewed: false`. This list is what to check first: the claims, numbers
and terms most likely to be wrong, or to differ from the manual your students use. Nothing
here was invented, but these are the points where Romanian textbooks disagree with each
other, or where I chose one standard form over another.

When a lesson passes review, set `reviewed: true` in its file under `src/content/ro/topics/`.
`npm run check:content` stops warning about it.

---

## 01 · Neuronul și arcul reflex (`neuron-arc-reflex.js`)

1. **„con de emergență”**: some manuals say „conul axonal” or „conul de emergență al axonului”. It's also a figure label.
2. **„strangulații Ranvier”**: some manuals prefer „noduri Ranvier”. It's used in the text, the glossary and the figure label.
3. **Resting potential „aproximativ −70 mV”**: manuals give −70 mV, others −65 to −90 mV. Check which value your manual uses.
4. **Depth of the ionic mechanism.** I mention the Na⁺/K⁺ pump and Na⁺ in, K⁺ out, but not the 3 Na⁺ / 2 K⁺ ratio or voltage-gated channels. Check the level the programme expects.
5. **Synapse steps skip Ca²⁺.** The text says the vesicles release the neurotransmitter by exocytosis, without mentioning Ca²⁺ entry. Add it if your manual does.
6. **Patellar reflex.** I describe the receptors as „receptorii din mușchi”, without naming the fusul neuromuscular, and I don't give the medullary segments (L2 to L4). Add them if they're expected.
7. **„Multe deprinderi … se bazează pe reflexe condiționate”**: this is the usual framing (stereotip dinamic), but check the wording.
8. **Pavlov example.** It says „un sunet”; manuals variously say a bell, a metronome or a light. I kept it generic on purpose.

## 02 · Inima și circulația sângelui (`inima-circulatia.js`)

**Reviewed (Module 3).** „valvă” is used for the four named valves (mitrală, tricuspidă, aortică, pulmonară) and „valvulă” only for a single cusp: mitrală 2, tricuspidă 3, each semilunar valve 3. The glossary has separate, cross-linked entries for „valvă” and „valvulă”. The remaining points (0,8 s cycle, „nodulul sinoatrial”) were accepted as written.

## 03 · Ventilația pulmonară (`ventilatia-pulmonara.js`)

**Reviewed (Module 3).** Volumes corrected to VT 500 ml, VIR 3.000 ml, VER 1.000-1.100 ml, VR 1.200 ml, and CV „aproximativ 4.500-5.000 ml, cu variații după sex, vârstă și înălțime”. Total lung capacity recomputed as about 5.700-6.200 ml. The abbreviation for volum curent is now VT everywhere (text, glossary, quiz, interactive). The ventilation interactive reads these same values from `src/content/ro/interactives/ventilation.js`.

## 04 · De la ADN la proteină (`adn-proteine.js`)

1. **„translație” vs „traducere”**: the text says „traducerea, numită și translație”, and the glossary entry is „translație”. Pick the manual's main term.
2. **RNA processing** (introni eliminated, exoni joined). Check it's in the grade XII programme and what it's called: „maturare”, „procesare” or „matisare”.
3. **Replication enzymes.** Only ADN-polimeraza is named. Some manuals also expect helicaza, ligaza or fragmentele Okazaki.
4. **Genetic code properties**: universal, degenerat, nesuprapus, fără separatori. Some manuals add „neambiguu” or phrase it as „fără virgule”.
5. **„aproape toate organismele”**: I hedged universality because of known exceptions, e.g. mitochondria. Check the manual doesn't say plainly „universal”.
6. **Sickle-cell example**: Glu → Val substitution in a hemoglobin chain gene. The position (6, β chain) is left out on purpose.
7. **Watson și Crick, 1953**; hydrogen bonds 2 (A–T) and 3 (G–C).
8. **Quiz item 5** (TAC → AUG) assumes students read the template strand 3′→5′ without the direction being stated. Check that's how the manual phrases these exercises.

## 05 · Legile lui Mendel (`mendel.js`)

1. **Names of the laws.** I used Legea I = „legea purității gameților” and Legea a II-a = „legea segregării independente a perechilor de caractere”. Some manuals number them differently, or add „legea uniformității hibrizilor din F1” as a separate law.
2. **„pătratul lui Punnett”**: also „careul lui Punnett” or „rețeaua Punnett”. This matters for the Module 3 interactive's name.
3. **Dates**: published 1866, recognised in 1900. Mendel presented the work in 1865 and published it in 1866.
4. **„genotip = totalitatea genelor”** and „fenotip = interacțiunea genotip–mediu”: standard definitions, but check the wording.
5. **Pea traits**: galben (A) dominant over verde; netedă (B) dominant over zbârcită.
6. **Test cross (retroîncrucișare / test-cross) isn't covered.** Add it if the programme expects it in this lesson.
7. **Probability notation** in the solving steps (sum = 1, adică 100 %). Check it matches how Bac solutions are written.

## Glossary (`glossary.js`)

- Each definition was written to match the lesson text. Check them together with the terms above, especially **valvă atrioventriculară / semilunară**, **translație**, **capacitate vitală** (depends on the volumes) and **teacă de mielină** (mentions strangulațiile Ranvier).

## About the „Știai că?” notes

Only facts I consider well established were used: the monosynaptic patellar reflex, cardiac automatism, residual volume, frameshift mutations, and the 1866 → 1900 timeline. If any feels too advanced for your students, it can simply be removed; the content check allows zero or one per lesson.
