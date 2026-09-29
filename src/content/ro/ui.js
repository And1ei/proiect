// All user-facing Romanian interface strings. Components read these through t() in src/lib/i18n.js.
// Lesson text lives in ./topics, glossary in ./glossary.js, the about page in ./about.js.
// Diacritics use comma-below (ș ț Ș Ț), never cedilla. No em dashes. Quotes: „ ”.
// Also imported by vite.config.js to fill index.html, so keep this file plain data.

const ui = {
  lang: 'ro',
  locale: 'ro-RO',
  ogLocale: 'ro_RO',
  quotes: ['„', '”'],

  brand: 'Soft Educational',
  tagline: 'Biologie de liceu, pe care o poți atinge.',

  meta: {
    title: 'Soft Educational · Biologie de liceu, pe care o poți atinge.',
    description:
      'Un caiet de biologie interactiv pentru Bacalaureat: sistemul nervos, inima, respirația, ADN-ul și legile lui Mendel, explicate pe înțeles.',
    titleTemplate: '{page} · Soft Educational',
    noscript:
      'Soft Educational are nevoie de JavaScript ca să funcționeze. Activează-l în browser și reîncarcă pagina.',
  },

  a11y: {
    skipLink: 'Sari la conținut',
    homeLink: 'Soft Educational, pagina principală',
  },

  common: {
    loading: 'Se încarcă',
    readMinutes: '{n} min de citit',
    grade: 'Clasa {grade}',
    unit: 'Unitatea {n}',
    lessonNumber: 'Lecția {n}',
  },

  specimen: {
    figPrefix: 'FIG.',
  },

  nav: {
    primaryLabel: 'Navigare principală',
    menuOpen: 'Meniu',
    menuClose: 'Închide',
    menuTitle: 'Meniu',
    lessons: 'Lecții',
    lessonsLabel: 'Lecțiile, pe unități',
    otherPages: 'Alte pagini',
    items: {
      contents: 'Cuprins',
      glossary: 'Dicționar',
      about: 'Despre proiect',
      credits: 'Surse și credite',
    },
  },

  footer: {
    label: 'Navigare în subsol',
    blurb:
      'Un caiet de teren pentru biologia de liceu. Fiecare pagină e un preparat pe care îl poți întoarce, colora și privi puțin mai de aproape.',
    slideSet: 'Set de lame {year} / Vol. 01',
    credit: 'Preparat de mână. Colorat cu eozină, albastru de metilen și soluție Lugol.',
    designSystem: 'Sistem de design',
  },

  contents: {
    title: 'Cuprins',
    label: 'Cuprins',
    heading: 'Cuprins',
    intro:
      'Cinci lecții pentru Bacalaureat, în ordinea din programă. Le poți citi pe rând sau poți sări direct la cea de care ai nevoie.',
    sectionsRead: '{read} din {total} secțiuni citite',
    bestScore: 'Test: {score} din {total}',
  },

  progress: {
    heading: 'Progresul tău',
    completedCount: '{done} din {total} lecții completate',
    stored: 'Progresul se păstrează doar în acest browser.',
    blocked:
      'Browserul nu permite salvarea datelor locale. Lecțiile funcționează, dar progresul se pierde la reîncărcare.',
    reset: 'Șterge progresul',
    confirm: 'Sigur? Se șterg secțiunile citite și scorurile de la toate testele.',
    confirmYes: 'Da, șterge',
    confirmNo: 'Anulează',
    cleared: 'Progresul a fost șters.',
    stamp: 'Completat',
  },

  topic: {
    objectives: 'Ce vei învăța',
    onThisPage: 'Pe această pagină',
    sectionRead: 'citită',
    prev: 'Lecția anterioară',
    next: 'Lecția următoare',
    lessonsNav: 'Alte lecții',
    quizHeading: 'Verifică-te',
    quizIntro: 'Cinci întrebări în stilul Subiectului I de la Bacalaureat.',
    notes: { retine: 'Reține', stiai: 'Știai că?' },
  },

  term: {
    glossaryLink: 'Vezi în dicționar',
  },

  figure: {
    missing: 'Figura nu este disponibilă.',
  },

  interactive: {
    label: 'Interactiv',
    pending: 'În lucru',
    placeholder: 'Aici va apărea exercițiul interactiv al lecției „{topic}”.',
    types: {
      punnett: 'Constructor de pătrate Punnett',
      decoder: 'Decodor ADN',
      heart: 'Inima în mișcare',
      reflexArc: 'Arcul reflex, pas cu pas',
      ventilation: 'Mecanica ventilației',
    },
  },

  game: {
    streak: 'Serie: {n}',
    soundOn: 'Sunet: pornit',
    soundOff: 'Sunet: oprit',
    hint: 'Indiciu',
    hideHint: 'Ascunde indiciul',
    stampAssisted: 'Cu ajutor',
    check: 'Verifică',
    next: 'Mai departe',
    restart: 'Ia-o de la capăt',
    pickHelp: 'Trage o etichetă la locul ei. Sau apas‑o, apoi apasă locul unde vrei s‑o pui.',
    picked: 'Ai ales {label}. Acum alege locul.',
    empty: 'loc liber',
    done: 'Gata. Ai terminat exercițiul.',
    solved: 'rezolvat',
  },

  quiz: {
    progress: 'Întrebarea {n} din {total}',
    types: { grila: 'Grilă', af: 'Adevărat sau fals', completare: 'Completare' },
    optionsLabel: 'Variante de răspuns',
    true: 'Adevărat',
    false: 'Fals',
    tfLabel: 'Afirmația este',
    chooseFix: 'Alege varianta corectă a afirmației',
    blank: 'spațiul liber',
    check: 'Verifică',
    correct: 'Răspuns corect',
    retry: 'Mai încearcă',
    next: 'Întrebarea următoare',
    finish: 'Vezi rezultatul',
    resultHeading: 'Rezultat',
    score: {
      one: 'Ai răspuns corect la {score} întrebare din {total}.',
      few: 'Ai răspuns corect la {score} întrebări din {total}.',
      other: 'Ai răspuns corect la {score} de întrebări din {total}.',
    },
    scoreNote: 'Se punctează doar primul răspuns la fiecare întrebare.',
    best: 'Cel mai bun scor: {score} din {total}',
    restart: 'Reia testul',
  },

  glossary: {
    title: 'Dicționar',
    label: 'Dicționar',
    heading: 'Dicționar',
    intro: 'Toți termenii din lecții, în ordine alfabetică. Poți căuta și fără diacritice.',
    searchLabel: 'Caută un termen',
    searchPlaceholder: 'de exemplu: sinapsa',
    count: { one: '{n} termen', few: '{n} termeni', other: '{n} de termeni' },
    empty: 'Niciun termen nu se potrivește cu {query}.',
    usedIn: 'Apare în',
    seeAlso: 'Vezi și',
  },

  about: {
    title: 'Despre proiect',
    label: 'Despre',
  },

  credits: {
    title: 'Surse și credite',
    label: 'Credite',
    heading: 'Surse și credite',
    intro: 'Tot ce stă la baza acestui caiet, cu mulțumiri celor care l-au făcut posibil.',
    fontsHeading: 'Fonturi',
    fonts: [
      { name: 'Fraunces', by: 'Undercase Type', license: 'licența SIL Open Font' },
      { name: 'Instrument Sans', by: 'Instrument', license: 'licența SIL Open Font' },
      { name: 'DM Mono', by: 'Colophon Foundry', license: 'licența SIL Open Font' },
    ],
    codeHeading: 'Cod',
    code: [
      { name: 'React', license: 'licența MIT' },
      { name: 'React Router', license: 'licența MIT' },
      { name: 'Motion', license: 'licența MIT' },
      { name: 'Tailwind CSS', license: 'licența MIT' },
      { name: 'Vite', license: 'licența MIT' },
    ],
    by: 'de {name}',
    figuresHeading: 'Figuri',
    figures: 'Toate figurile sunt desenate special pentru acest site. Nu reproducem imagini din manuale.',
    sourcesHeading: 'Conținut',
    sources:
      'Lecțiile urmează programa de Bacalaureat „Anatomie și fiziologie umană, genetică și ecologie umană”, pentru clasele a XI-a și a XII-a. Textele sunt originale și sunt încă în curs de verificare.',
  },

  notFound: {
    title: 'Pagina nu a fost găsită',
    label: 'Pagină lipsă',
    heading: 'Pagina nu a fost găsită',
    body: 'Preparatul pe care îl cauți nu e pe lamă. Poate linkul e greșit sau pagina s-a mutat.',
    cta: 'Înapoi la cuprins',
  },

  error: {
    title: 'Ceva nu a mers bine',
    label: 'Eroare',
    heading: 'Ceva nu a mers bine',
    body: 'Pagina s-a blocat în timp ce se încărca. Reîncarcă-o și, dacă tot nu merge, mai încearcă puțin mai târziu.',
    retry: 'Reîncarcă pagina',
  },
};

export default ui;
