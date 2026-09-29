// REVIEW: copy by Claude, needs native review
//
// Every Romanian string of "Poarta membranei" (G2), both modes. The biology sentences (one per
// molecule) live in ../membrane-molecules.ts. Placeholders: {name}, {n}, ... filled by fill().

export const MEMBRANE = {
  baza: {
    title: 'Poarta membranei',
    tagline: 'Ești paznicul membranei celulare: decide ce trece singur prin dublul strat lipidic și ce nu.',
    instructions: [
      'Moleculele vin spre membrană din exterior și din citoplasmă.',
      'Trimite fiecare moleculă la poarta potrivită înainte să ajungă la membrană.',
      'Moleculele mici și nepolare trec singure prin dublul strat lipidic. Celelalte nu trec singure.',
      'O poartă greșită rănește membrana. Între valuri, ține hematia în zona sigură.',
    ],
  },
  avansat: {
    title: 'Poarta membranei: avansat',
    level: 'Avansat · curriculum de specialitate',
    tagline: 'Difuzie simplă, difuzie facilitată sau transport activ: alege poarta și drămuiește ATP-ul.',
    instructions: [
      'Moleculele vin spre membrană din exterior și din citoplasmă.',
      'Dublul strat: molecule mici și nepolare. Canalul sau transportorul: molecule polare și ioni, în sensul gradientului.',
      'Pompa mută substanțe împotriva gradientului și consumă ATP. Fără ATP, pompa nu funcționează.',
      'O poartă greșită rănește membrana. Între valuri, ține hematia în zona sigură.',
    ],
  },
  controls: {
    touch: 'Trage molecula pe o poartă, sau atinge molecula și apoi poarta. Butoanele de sub joc dau indicii și reglează soluția.',
    mouse: 'Trage molecula pe o poartă, sau dă clic pe moleculă și apoi pe poartă.',
    keyboard: 'Tab sau ← → alege molecula, cifrele de pe porți o trimit, H cere un indiciu, S și D reglează soluția, Esc pune pauză.',
  },
  stage: 'Membrana celulară. Moleculele vin spre membrană din exterior și din citoplasmă.',
  sides: { exterior: 'Extracelular', interior: 'Citoplasmă' },
  gates: {
    'dublu-strat': { name: 'Dublul strat', process: 'difuzie simplă' },
    canal: { name: 'Canal / transportor', short: 'Canal', process: 'difuzie facilitată' },
    pompa: { name: 'Pompă', process: 'transport activ, cu ATP' },
    blocat: { name: 'Blocat', process: 'nu trece singură' },
  },
  keyHint: 'tasta {n}',

  strip: {
    idle: 'Alege o moleculă, apoi o poartă.',
    idleKeys: 'Tab alege molecula, cifrele aleg poarta.',
    wrong: 'Poartă greșită.',
    late: '{name} a ajuns la membrană înainte să-i alegi o poartă.',
    noAtp: 'Pompa a rămas fără ATP și nu a putut lucra. Mitocondriile refac ATP-ul în câteva secunde.',
    hint: 'Indiciu',
    hintKey: 'H',
    atp: 'ATP',
    atpValue: '{n} din {max}',
  },
  notices: {
    slow: 'Am încetinit puțin moleculele. Ia-ți timp: uită-te la săgeată și la puncte.',
    tutorial: 'Prima moleculă are poarta evidențiată. Trimite-o acolo.',
    'hint-none': 'Nu e nicio moleculă de ales acum.',
  },
  cue: 'Săgeata arată încotro merge molecula; punctele arată unde e mai concentrată.',

  phase: {
    wave: 'Valul {n} din {total}',
    osmosis: 'Osmoză',
    osmosisSub: 'Ține hematia în zona sigură',
    done: 'Membrana a rezistat',
    next: { wave: 'Urmează valul {n}', osmosis: 'Urmează: osmoza', end: 'Gata' },
  },

  osmosis: {
    heading: 'Hematia într-o soluție',
    salt: 'Adaugă sare',
    dilute: 'Diluează',
    saltKey: 'S',
    diluteKey: 'D',
    outside: 'Soluția din jur',
    tonicity: { hipotonica: 'hipotonică', izotonica: 'izotonică', hipertonica: 'hipertonică' },
    zone: { crenare: 'pierde apă și se zbârcește (crenare)', sigur: 'volum normal', liza: 'se umflă, risc de liză' },
    gauge: { crenare: 'crenare', sigur: 'zona sigură', liza: 'liză' },
    changes: {
      distilata: 'S-a adăugat apă distilată.',
      sare: 'S-a adăugat o soluție concentrată de sare.',
      ser: 'Hematia e acum în ser fiziologic, o soluție izotonică.',
    },
    water: { in: 'Apa intră în hematie.', out: 'Apa iese din hematie.', none: 'Apa intră și iese în egală măsură.' },
    left: 'mai sunt {n} s',
    takeaways: {
      perfuzie:
        'Apa trece spre soluția mai concentrată, de aceea în perfuzie se folosește ser fiziologic, izotonic, nu apă distilată, în care hematiile s-ar umfla până la liză.',
      crenare: 'Într-o soluție hipertonică hematiile pierd apă și se zbârcesc (crenare), iar în ser fiziologic, izotonic, își păstrează volumul.',
    },
  },

  a11y: {
    selected: 'Selectat: {name}, {formula}, {situation}.',
    gateLabel: '{key}: {name}, {process}',
    osmosisStatus: 'Soluția din jur este {tonicity}. Hematia: {zone}.',
    atp: 'ATP: {n} din {max}.',
  },

  howTo: {
    label: 'Cum se joacă, în trei pași',
    steps: {
      baza: [
        { title: 'Citește molecula', text: 'Săgeata arată încotro merge molecula; punctele, unde este mai concentrată.' },
        { title: 'Alege poarta', text: 'Trage-o pe poarta potrivită sau apasă cifra porții, înainte să atingă membrana.' },
        { title: 'Echilibrează apa', text: 'Între valuri, adaugă sare sau diluează, ca hematia să rămână în zona sigură.' },
      ],
      avansat: [
        { title: 'Citește molecula', text: 'Săgeata arată încotro merge; dacă merge spre partea cu mai multe puncte, e împotriva gradientului.' },
        { title: 'Alege poarta', text: 'Canalul lucrează în sensul gradientului, fără ATP. Pompa lucrează împotriva lui și consumă ATP.' },
        { title: 'Echilibrează apa', text: 'Între valuri, adaugă sare sau diluează, ca hematia să rămână în zona sigură.' },
      ],
    },
  },
};

/** Fills {placeholders}. */
export const fill = (text, vars) => text.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
