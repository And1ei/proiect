// REVIEW: copy by Claude, needs native review and a teacher's check of the classification
//
// Interface strings of "Safari la microscop" (G4a), both modes. The biology (groups, clues,
// organisms, explanations) lives in ../safari-organisms.ts.

export const SAFARI = {
  baza: {
    title: 'Safari la microscop',
    tagline: 'Prin câmpul microscopului trec viețuitoare mici. Citește-le semnele și pune-le în grupul lor.',
    instructions: [
      'Pe fiecare lamă e o probă adevărată: infuzie de fân, apă de baltă, iaurt de casă.',
      'Atinge un organism ca să-i vezi fișa: două sau trei lucruri pe care le vezi la microscop.',
      'Alege grupul după semnul care decide, nu după nume. Cele corecte intră în carnetul tău.',
      'Un grup greșit sparge o lamă. Ce scapă sau greșești revine pe o lamă următoare.',
    ],
  },
  avansat: {
    title: 'Safari la microscop: avansat',
    level: 'Avansat · curriculum de specialitate',
    tagline: 'Șapte grupuri, cu arhee și animale, iar la protozoare, ciuperci și Chromista alegi și tipul.',
    instructions: [
      'Patru lame, printre ele un lac sărat și o baltă cu animale mici.',
      'Atinge un organism, citește-i fișa și alege grupul după semnul care decide.',
      'La protozoare, ciuperci și Chromista mai e un pas: tipul (de exemplu ciliat sau amibă).',
      'Un grup greșit sparge o lamă. Ce scapă sau greșești revine mai târziu.',
    ],
  },
  controls: {
    touch: 'Atinge un organism, apoi grupul lui din butoanele de sub microscop.',
    mouse: 'Clic pe un organism, apoi pe grupul lui.',
    keyboard: 'Tab sau ← → alege organismul, cifrele aleg grupul (și tipul), H cere un indiciu, Esc pune pauză.',
  },
  stage: 'Câmpul microscopului, cu organisme care trec prin el',
  slide: 'Preparat {n}',
  card: {
    empty: 'Atinge un organism din câmp ca să-i vezi fișa.',
    seen: 'Ce se vede',
    decides: 'semnul care decide',
    pickGroup: 'În ce grup îl pui?',
    pickType: 'Ce tip de {group} este?',
  },
  wrong: 'Nu e aici.',
  escaped: '{name} a ieșit din câmp înainte să-l sortezi. Revine pe o lamă următoare.',
  typeRight: 'Tip corect: {type}.',
  typeWrong: 'Tipul potrivit era {type}: {clue}',
  notices: {
    tutorial: 'Citește fișa: semnul subliniat este cel care decide grupul.',
    slow: 'Am încetinit puțin câmpul. Citește fișa cu calm, organismele nu fug.',
    pickFirst: 'Alege întâi un organism din câmp.',
    hintNone: 'Alege un organism, apoi cere indiciul.',
  },
  hint: 'Indiciu',
  hintKey: 'H',
  carnet: 'Carnetul tău',
  carnetEmpty: 'Aici se adună ce ai sortat corect.',
  carnetCount: { one: 'o specie', few: '{n} specii', other: '{n} de specii' },
  a11y: {
    selected: 'Selectat: {name}. {clues}',
    right: 'Corect: {name}, {group}.',
    lives: 'Ai pierdut o lamă.',
  },
  recapTitle: '{group}: cum îl recunoști',
  howTo: {
    label: 'Cum se joacă, în trei pași',
    steps: [
      { title: 'Atinge un organism', text: 'Organismele trec prin câmpul microscopului. Atinge unul și se oprește puțin.' },
      { title: 'Citește fișa', text: 'Fișa arată ce se vede: nucleu, cloroplaste, cili, flagel, perete. Un semn decide grupul.' },
      { title: 'Alege grupul', text: 'Apasă grupul potrivit. Dacă e corect, intră în carnetul tău.' },
    ],
  },
};

/** Fills {placeholders}. */
export const fill = (text, vars) => text.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
