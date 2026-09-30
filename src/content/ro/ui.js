// All user-facing Romanian interface strings. Components read these through t() in src/lib/i18n.js.
// Lesson text lives in ./lessons, the about page in ./about.js.
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
    description: 'Biologie · clasa a IX-a. Un caiet de biologie interactiv.',
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
    topics: 'Preparatele',
    home: 'Acasă',
    contentsSheet: 'Cuprins',
    backToLesson: 'Înapoi la {title}',
    backToGames: 'Înapoi la jocuri',
    items: {
      contents: 'Cuprins',
      games: 'Jocuri',
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
    intro: 'Biologie · clasa a IX-a. Cinci teme, în ordinea din programă.',
    sectionsRead: '{read} din {total} secțiuni citite',
    bestScore: 'Test: {score} din {total}',
  },

  progress: {
    heading: 'Progresul tău',
    completedCount: '{done} din {total} lecții completate',
    stored: 'Progresul se păstrează doar în acest browser.',
    blocked:
      'Browserul nu permite salvarea datelor locale. Lecțiile funcționează, dar progresul se pierde la reîncărcare.',
    reset: 'Resetează progresul',
    confirm: 'Sigur? Se șterg secțiunile citite, scorurile de la teste și rezultatele de la jocuri.',
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
    quizIntro: 'Câteva întrebări, ca să verifici ce ai reținut.',
    notes: { retine: 'Reține', stiai: 'Știai că?' },
    stubHeading: 'În curând',
    stubBody: 'Tema aceasta este în pregătire.',
    stubBack: 'Înapoi la cuprins',
  },

  term: {
  },

  figure: {
    missing: 'Figura nu este disponibilă.',
  },

  interactive: {
    label: 'Interactiv',
    pending: 'În lucru',
    placeholder: 'Aici va apărea exercițiul interactiv al lecției „{topic}”.',
    types: {},
  },

  game: {
    streak: 'Serie: {n}',
    soundOn: 'Sunet: pornit',
    soundOff: 'Sunet: oprit',
    hint: 'Indiciu',
    hideHint: 'Ascunde indiciul',
    stampAssisted: 'Completat cu ajutor',
    check: 'Verifică',
    next: 'Mai departe',
    restart: 'Ia-o de la capăt',
    pickHelp: 'Trage o etichetă la locul ei. Sau apas‑o, apoi apasă locul unde vrei s‑o pui.',
    picked: 'Ai ales {label}. Acum alege locul.',
    empty: 'loc liber',
    done: 'Gata. Ai terminat exercițiul.',
    solved: 'rezolvat',
  },

  games: {
    title: 'Jocuri',
    label: 'Jocuri',
    heading: 'Jocuri',
    intro: 'Jocuri pentru temele din programă, grupate pe teme.',
    empty: 'Aici nu sunt jocuri. Lecțiile și testele „Verifică-te” sunt pe pagina principală.',
    tag: 'Joc',
    levels: { label: 'Niveluri', base: 'Nivel de bază', advanced: 'Avansat · CS' },
    sandboxTag: 'Sandbox',
    minutes: 'aprox. {n} min',
    difficulty: { usor: 'Ușor', mediu: 'Mediu', greu: 'Greu' },
    best: 'Record: {score}',
    plays: { one: 'Jucat o dată', few: 'Jucat de {n} ori', other: 'Jucat de {n} de ori' },
    stars: '{n} din 3 stele',
    play: 'Joacă',
    topicHeading: 'Joacă',
    shell: {
      start: 'Începe',
      howTo: 'Cum se joacă',
      controls: 'Comenzi',
      controlTypes: { touch: 'Atingere', mouse: 'Mouse', keyboard: 'Tastatură' },
      pause: 'Pauză',
      pausedHeading: 'Pauză',
      autoPaused: 'Am oprit jocul cât ai fost în altă parte.',
      resume: 'Continuă',
      restart: 'Ia-o de la capăt',
      close: 'Închide',
      loading: 'Se pregătește jocul',
      loadError: 'Jocul nu s-a putut încărca. Verifică conexiunea și încearcă din nou.',
      retry: 'Încearcă din nou',
      stage: 'Zona de joc',
      reactions: 'Reacții',
    },
    hud: {
      label: 'Starea jocului',
      score: 'Scor',
      lives: 'Vieți',
      livesValue: '{n} din {max}',
      time: 'Timp',
      timeLeft: 'Timp rămas',
      streak: 'Serie',
      multiplier: 'puncte ×{n}',
      hints: { one: 'Un indiciu folosit', few: '{n} indicii folosite', other: '{n} de indicii folosite' },
    },
    announce: {
      started: 'Jocul a început.',
      score: 'Scor: {score}.',
      lives: { one: 'Ai pierdut o viață. Mai ai una.', few: 'Ai pierdut o viață. Mai ai {n}.', other: 'Ai pierdut o viață. Mai ai {n}.' },
      streak: 'Serie de {n}. Punctele se înmulțesc cu {m}.',
      hint: 'Indiciu folosit. Rezultatul va fi marcat cu ajutor.',
      paused: 'Joc în pauză.',
      resumed: 'Jocul continuă.',
      won: 'Ai reușit. Scor final: {score}.',
      lost: 'Joc încheiat. Scor final: {score}.',
    },
    results: {
      wonHeading: 'Ai reușit',
      lostHeading: 'Joc încheiat',
      score: 'Scor',
      stars: 'Stele',
      best: 'Record personal',
      newBest: 'Record nou',
      plays: 'Jocuri jucate',
      time: 'Timp',
      bestStreak: 'Cea mai lungă serie',
      again: 'Din nou',
      back: 'Înapoi la lecție',
      recapHeading: 'Ce ai învățat',
    },
  },

  landing: {
    set: 'Set de lame 2026 · Biologie · clasa a IX-a',
    title: 'Soft Educational',
    leadA: 'Lecții scurte de biologie, cu jocuri printre paragrafe. Citești o bucată, te joci, iar când greșești,',
    leadMark: 'jocul îți arată paragraful',
    leadB: ' care explică.',
    // With no game at all (see stats.ts), the lead talks about the quizzes instead
    leadNoGamesA: 'Lecții scurte de biologie, fiecare cu un test la final. Când greșești,',
    leadNoGamesMark: 'testul îți arată paragraful',
    minutes: '{n} min de citit în total',
    startHere: 'Începe de aici',
    orRead: 'sau citește întâi lecția',
    continue: 'Continuă: {label}',
    path: 'Preparatele, în ordinea programei',
    page: 'Deschide lecția pe pagina ei',
  },

  topicPage: {
    reading: 'Lectura',
    games: 'Jocuri',
    progress: 'Progres',
  },

  sheet: {
    back: 'Înapoi la joc',
    openPage: 'Deschide lecția pe pagina ei',
    reread: 'Recitește lecția',
    skip: 'Sari peste, joc direct',
    see: 'vezi în lecție',
    explains: 'Secțiunea {title} explică asta.',
  },

  safari: {
    count: { one: 'o specie', few: '{n} specii', other: '{n} de specii' },
  },

  stamps: {
    citit: 'citit',
    jucat: 'jucat',
    stapanit: 'stăpânit',
    aria: 'Progres: {list}',
    none: 'Încă fără progres',
  },

  lesson: {
    predict: 'Gândește-te',
    showAnswer: 'Arată răspunsul',
    hideAnswer: 'Ascunde răspunsul',
    slideGame: 'Joc',
    keyPoints: 'Pe scurt',
    why: 'De ce contează:',
    cs: 'Avansat · CS',
    margin: 'Notă pe margine',
    seen: 'citit',
    readingTime: '{n} min de citit',
    preparat: 'Preparat {n}',
    check: 'Verifică-te',
    checkIntro: '{count}. Dacă greșești, linkul te duce la secțiunea care explică.',
  },

  quiz: {
    seeSection: 'Vezi secțiunea',
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
      { name: 'Phaser', by: 'Phaser Studio', license: 'licența MIT' },
      { name: 'dnd kit', license: 'licența MIT' },
      { name: 'howler.js', license: 'licența MIT' },
      { name: 'canvas-confetti', license: 'licența ISC' },
      { name: 'Zustand', license: 'licența MIT' },
      { name: 'Workbox', license: 'licența MIT' },
    ],
    by: 'de {name}',
    figuresHeading: 'Ilustrații și sunete',
    figures:
      'Ilustrațiile și sunetele provin din colecții cu licențe libere. Fiecare apare mai jos, cu autorul, sursa, licența și ce am schimbat la ea. Nu reproducem imagini din manuale.',
    asset: {
      source: 'Sursa',
      license: 'Licența',
      changes: 'Modificări',
      attribution: 'Atribuire obligatorie',
      kinds: { icon: 'Celule și organite', organism: 'Organisme', ui: 'Interfață', sound: 'Sunete', texture: 'Texturi' },
    },
    sourcesHeading: 'Conținut',
    sources: 'Temele sunt cele din programa de biologie pentru clasa a IX-a. Textele sunt originale și sunt încă în pregătire.',
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
