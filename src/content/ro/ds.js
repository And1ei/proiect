// Design-system page strings (dev only). Registered into i18n by DesignSystem.jsx, so they
// never ship in the production bundle.

const ds = {
  title: 'Sistem de design',
  label: 'Index planșe / Modulul 01',
  heading: { before: 'Masa de lucru, ', mark: 'pregătită' },
  intro:
    'Toate culorile, fonturile și componentele din care e făcut Soft Educational, puse pe o singură pagină ca să le poți verifica. Nimic de aici nu e conținut final.',
  contentsLabel: 'Conținut',
  contentsAria: 'Planșele de pe această pagină',
  plates: {
    color: 'Culoare',
    type: 'Tipografie',
    surface: 'Suprafață',
    buttons: 'Butoane',
    cards: 'Carduri',
    annotation: 'Adnotări',
    motion: 'Mișcare',
    cursor: 'Cursor',
    focus: 'Focalizare',
  },

  color: {
    name: 'Colorant',
    title: 'Culoare: o paletă de coloranți histologici',
    intro:
      'Culorile poartă numele coloranților cu care faci celulele vizibile la microscop. Nuanțele de bază sunt pentru fundaluri și contururi. Fiecare familie are și o nuanță închisă, sigură ca text pe hârtie (WCAG AA).',
    textSafe: 'Text AA',
    families: {
      paper: { name: 'Hârtie și cerneală', note: 'Pagina și stiloul. Cerneala estompată e doar pentru linii, niciodată pentru text.' },
      eosin: { name: 'Eozină', note: 'Accentul principal. În preparatele colorate H&E, colorează citoplasma în roz.' },
      methylene: { name: 'Albastru de metilen', note: 'Accentul secundar. Se leagă de nuclei și de ADN.' },
      iodine: { name: 'Iod', note: 'Evidențiere, folosit cu măsură. Colorează amidonul în negru-albăstrui.' },
    },
  },

  type: {
    name: 'Litere',
    title: 'Tipografie',
    intro:
      'Trei voci: un serif moale și puțin năzdrăvan pentru titluri, un sans limpede pentru citit și un mono pentru etichetele de preparat. Mărimile cresc fluid de la ecranul de telefon la cel de laptop.',
    families: [
      { name: 'Fraunces', role: 'Titluri · SOFT 100 și WONK 1 la mărimi mari', sample: 'Orice celulă vine dintr-o altă celulă' },
      {
        name: 'Instrument Sans',
        role: 'Text · 400 și 500',
        sample:
          'Membrana celulară e semipermeabilă: moleculele mici și fără sarcină trec ușor, iar ionii au nevoie de un canal proteic.',
      },
      { name: 'DM Mono', role: 'Etichete · majuscule, spațiere 0,08 em', sample: 'Fig. 07 / Mitocondrie · ×{zoom}' },
    ],
    step: 'treapta {n}',
    scale: {
      6: 'Mitoza',
      5: 'Mozaicul fluid',
      4: 'Osmoza prin membrană',
      3: 'Ribozomii citesc ARN-ul mesager',
      2: 'Cloroplastele captează lumina',
      1: 'Enzimele scad energia de activare',
      0: 'Difuzia mută particulele de unde sunt multe spre unde sunt puține.',
      '-1': 'Mărire ×400, colorat cu hematoxilină.',
      '-2': 'Fig. 3 · epidermă de ceapă',
    },
    glyphs: {
      heading: 'Test de diacritice',
      intro:
        'Fiecare font trebuie să deseneze singur ă, â, î, ș și ț, cu virgulă dedesubt, în toate grosimile folosite. Testul rulează în browserul tău și compară fiecare glif cu fontul de rezervă.',
      sample: 'Ăă Ââ Îî Șș Țț',
      upperSample: 'fișă, țesut, înșirat',
      weight: 'grosime {w}',
      italic: 'cursiv',
      uppercase: 'majuscule',
      checking: 'se verifică',
      native: 'nativ',
      fallback: 'din fontul de rezervă',
      subsetOk: 'subsetul latin-ext e încărcat',
      subsetMissing: 'subsetul latin-ext lipsește',
    },
    conventions: {
      heading: 'Ghilimele și numere',
      quote: 'Soluția fiziologică are {percent} clorură de sodiu.',
      number: 'Un milimetru cub de sânge are aproximativ {count} de globule roșii.',
      decimal: 'Diametrul unui globul roșu: {size} micrometri.',
    },
  },

  surface: {
    name: 'Suprafață',
    title: 'Textură, adâncime și formă',
    intro:
      'Suprafețele sunt presate în hârtie, nu plutesc deasupra ei: toate umbrele sunt interioare. Nimic nu e un simplu dreptunghi rotunjit. Granulația de pe toată pagina e un filtru SVG de zgomot, fix.',
    depthHeading: 'Adâncime tactilă',
    depth: {
      'shadow-rest': 'Butoane în repaus: lumină din stânga sus și o buză fină dedesubt.',
      'shadow-pressed': 'Apăsare: suprafața se afundă în pagină.',
      'shadow-card': 'Carduri: un suport abia ridicat, cu margine interioară moale.',
      'shadow-well': 'Godeuri și ferestre de lamă: adâncite în hârtie.',
    },
    radiiHeading: 'Rotunjiri organice',
    blobsHeading: 'Forme care respiră',
    blobsIntro:
      'Cresc de la 1 la {scale} și înapoi, în bucle lente de 6 până la 9 secunde, decalate ca să nu respire niciodată deodată. Conturul punctat e varianta membrană: capetele fosfolipidelor, desenate ca o linie punctată.',
    shapes: { cell: 'celulă', amoeba: 'amibă', bean: 'bob', vesicle: 'veziculă' },
  },

  buttons: {
    name: 'Buton',
    title: 'BlobButton',
    intro:
      'Treci cu mouse-ul peste el și conturul se transformă în forma următoare. Apasă-l și se turtește, ca ceva care are greutate. Poate fi buton, link obișnuit sau link între paginile site-ului.',
    stain: 'Colorează proba',
    count: 'Numără nucleii',
    note: 'Adaugă o notiță',
    starch: 'Testează amidonul',
    small: 'Mic',
    medium: 'Mediu',
    next: 'Lamela următoare',
    disabled: 'Dezactivat',
    divide: 'Divide celula',
    cells: 'Celule în câmp: {n}',
  },

  cards: {
    name: 'Card',
    title: 'SpecimenCard',
    intro:
      'Un preparat montat: etichetă, fereastră de lamă opțională, titlu, notițe și o bandă de detalii. Când duce undeva, tot cardul devine un singur link și se clatină ușor sub cursor.',
    membrane: {
      name: 'Celulă',
      title: 'Membrana plasmatică',
      body: 'Un strat dublu de fosfolipide, presărat cu proteine. Lasă apa și oxigenul să treacă liber, dar glucoza și ionii trebuie să ceară voie.',
      meta: ['×1000, imersie în ulei', 'Unitatea 1 · Celula'],
    },
    mitochondria: {
      name: 'Organit',
      title: 'Mitocondria',
      body: 'Membrana internă e pliată în criste, ca enzimele respirației aerobe să aibă mai mult loc de lucru. Mai multe pliuri, mai mult ATP.',
    },
    potato: {
      name: 'Țesut',
      title: 'Tubercul de cartof, testul cu iod',
      body: 'Amiloplastele pline cu amidon se înnegresc în câteva secunde după o picătură de soluție Lugol.',
    },
  },

  annotation: {
    name: 'Note',
    title: 'Etichete, sublinieri și săgeți',
    intro:
      'Semnele pe care le-ai face pe marginea unui caiet de laborator. Sublinierile și săgețile se desenează singure, o singură dată, când ajung pe ecran.',
    labels: ['Celulă', 'Nucleu', 'Citoplasmă', 'Grăunte de amidon'],
    freeLabel: 'Proba 12 · Allium cepa',
    underlines: [
      { before: 'Nucleul păstrează ', mark: 'codul genetic', after: '.' },
      { before: 'Apa trece prin membrană prin ', mark: 'osmoză', after: '.' },
      { before: 'ATP-ul e ', mark: 'moneda energetică', after: ' a celulei.' },
      { before: 'Doar celulele ', mark: 'vegetale', after: ' au perete celular.' },
    ],
    headings: { label: 'SpecimenLabel', underline: 'HandUnderline', arrow: 'HandArrow' },
    arrows: { curve: 'curbă', loop: 'buclă', short: 'scurtă' },
  },

  motion: {
    name: 'Mișcare',
    title: 'Mișcare',
    intro:
      'Totul se mișcă pe arcuri, fără tranziții liniare. Singura excepție e respirația formelor, o buclă lentă și lină. Când reducerea mișcării e activă, tranzițiile devin instantanee, formele nu mai respiră, liniile apar deja desenate și cursorul moale dispare.',
    simulate: 'Simulează reducerea mișcării',
    simulateHint: 'Comutator doar pentru dezvoltare. Nu apare pe site-ul publicat.',
    status: 'Reducerea mișcării: {state}',
    on: 'activă',
    off: 'inactivă',
    fromSystem: 'din setările sistemului',
    fromToggle: 'simulată',
    release: 'Eliberează proba',
    back: 'Trimite-o înapoi',
    presets: {
      spring: 'Interacțiuni: treceri cu mouse-ul, apăsări, comutatoare',
      springSettle: 'Lucruri care se deplasează prin spațiu',
    },
    presetMeta: 'rigiditate {k} · amortizare {c}',
    demosHeading: 'Probe de mișcare',
    squash: 'Apasă și ține',
    squashHint: 'Se turtește la apăsare și revine elastic.',
    breathe: 'Respiră încet',
  },

  cursor: {
    name: 'Cursor',
    title: 'Cursor',
    intro:
      'Pe mouse sau touchpad, un inel moale urmează cursorul cu o mică întârziere. Apropie-te de un buton sau de un link și inelul se umflă și se întinde spre el. Apasă ca să-l turtești. Pe ecranele tactile nu apare deloc.',
    target: 'Țintă',
    bigTarget: 'Țintă mai mare',
    surfacesHeading: 'Pe orice fundal',
    surfacesHint: 'Inelul are un contur dublu, deschis și închis, ca să se vadă și pe hârtie, și pe culori închise.',
    inputLabel: 'Notează o observație',
    inputPlaceholder: 'de exemplu: nucleul s-a colorat în albastru',
    inputHint: 'În câmpurile de text rămâne cursorul obișnuit de scris.',
  },

  focus: {
    name: 'Focalizare',
    title: 'Focalizare',
    intro:
      'Apasă Tab. Inelul apare doar când navighezi cu tastatura, urmează forma fiecărui element și stă puțin depărtat de el. Are contrast de cel puțin 3:1 pe orice suprafață.',
    surfaces: { paper: 'Pe hârtie', eosin: 'Pe eozină', methylene: 'Pe metilen', dark: 'Pe fundal închis' },
    button: 'Focalizează-mă',
    buttonAlt: 'Și pe mine',
    link: 'Un link în text',
  },
};

export default ds;
