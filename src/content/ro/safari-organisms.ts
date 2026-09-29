// REVIEW: copy by Claude, needs native review and a teacher's check of the classification
//
// The biology of "Safari la microscop" (G4a): groups, observable clues and the organisms on each
// slide. Clues are a shared catalogue so the fairness test can check that every organism can be
// solved from what is on its card: each organism has at least one clue that points to its own group
// and to no other, and none of its clues points to a different group.
//
// Swaps from the G4a brief (a licensed, recognisable silhouette exists; same group):
//   - Lactobacillus sp. → Streptococcus sp. (only CC BY-SA images of Lactobacillus; S. thermophilus
//     is the other yogurt bacterium).
//   - Nostoc commune → Arthrospira platensis (Nostoc only CC BY-SA; also a cyanobacterium).
//   - Halobacterium salinarum → Halobacterium sp. (the species image is CC BY-SA; genus image CC0).
//   - Pinnularia / Navicula → Nitzschia sp. and Asterionella sp. (no images of the first two).
//   - Spirogyra → Closterium sp. and Chlamydomonas sp. (the only CC0 Spirogyra is an unreadable line).
//   - Ceramium rubrum → dropped: a marine red alga does not belong in a pond sample; the three algae
//     are freshwater green algae (Volvox, Closterium, Chlamydomonas).
//   - Penicillium and Mucor: both kept (the brief offered either).
//   - Daphnia: Daphnia pulex, the same species as in Echilibrul (D. magna images are NC only).
//
// Plain data with erasable TypeScript only: unit tests import this file directly.

export type GroupId = 'bacterii' | 'arhee' | 'protozoare' | 'chromista' | 'fungi' | 'plante' | 'animale';
export type SafariMode = 'baza' | 'avansat';
export type TypeId = 'amiba' | 'flagelat' | 'ciliat' | 'drojdie' | 'mucegai' | 'ciuperca-palarie' | 'diatomee' | 'dinoflagelat' | 'alga-bruna';

export interface Group {
  id: GroupId;
  name: string;
  /** Short line under the button: what decides it. */
  cue: string;
  /** Lesson section that explains the group ('slug#section'). */
  lessonSection: string;
  /** Advanced mode: the second step, when the programa names types in this group. */
  types?: TypeId[];
}

export const GROUPS: Record<GroupId, Group> = {
  bacterii: { id: 'bacterii', name: 'Bacterii', cue: 'fără nucleu, mediu obișnuit', lessonSection: 'diversitatea-vietii#trei-domenii' },
  arhee: { id: 'arhee', name: 'Arhee', cue: 'fără nucleu, medii extreme', lessonSection: 'diversitatea-vietii#trei-domenii' },
  protozoare: {
    id: 'protozoare',
    name: 'Protozoare',
    cue: 'o celulă, se mișcă, fără perete',
    lessonSection: 'diversitatea-vietii#microorganisme',
    types: ['amiba', 'flagelat', 'ciliat'],
  },
  chromista: {
    id: 'chromista',
    name: 'Chromista',
    cue: 'căsuță de siliciu sau plăci',
    lessonSection: 'diversitatea-vietii#trei-domenii',
    types: ['diatomee', 'dinoflagelat', 'alga-bruna'],
  },
  fungi: {
    id: 'fungi',
    name: 'Fungi',
    cue: 'fără clorofilă, absorb hrana',
    lessonSection: 'diversitatea-vietii#microorganisme',
    types: ['drojdie', 'mucegai', 'ciuperca-palarie'],
  },
  plante: { id: 'plante', name: 'Plante (alge)', cue: 'perete de celuloză, cloroplaste', lessonSection: 'diversitatea-vietii#plante-animale' },
  animale: { id: 'animale', name: 'Animale', cue: 'pluricelulare, cu organe', lessonSection: 'diversitatea-vietii#plante-animale' },
};

export const TYPE_NAMES: Record<TypeId, string> = {
  amiba: 'amibă',
  flagelat: 'flagelat',
  ciliat: 'ciliat',
  drojdie: 'drojdie',
  mucegai: 'mucegai',
  'ciuperca-palarie': 'ciupercă cu pălărie',
  diatomee: 'diatomee',
  dinoflagelat: 'dinoflagelat',
  'alga-bruna': 'algă brună',
};

/** Groups on the buttons, in key order (1–5 base, 1–7 advanced). */
export const MODE_GROUPS: Record<SafariMode, GroupId[]> = {
  baza: ['bacterii', 'protozoare', 'chromista', 'fungi', 'plante'],
  avansat: ['bacterii', 'arhee', 'protozoare', 'chromista', 'fungi', 'plante', 'animale'],
};

export interface Clue {
  text: string;
  /** The single group this clue decides, or null when several groups share it. */
  points: GroupId | null;
  /** Advanced mode: the type this clue decides inside its group. */
  type?: TypeId;
}

export const CLUES: Record<string, Clue> = {
  // prokaryotes
  'fara-nucleu-obisnuit': { text: 'Nu are nucleu, iar materialul genetic stă liber în citoplasmă; trăiește într-un mediu obișnuit.', points: 'bacterii' },
  'fara-nucleu-fotosinteza': { text: 'Nu are nucleu, dar face fotosinteză cu pigmenți verzi-albaștri.', points: 'bacterii' },
  'fara-nucleu-extrem': { text: 'Nu are nucleu și trăiește în saramură, unde aproape nimic altceva nu rezistă.', points: 'arhee' },
  'lant-sfere': { text: 'Celule mici și rotunde, legate în lanț.', points: null },
  bastonas: { text: 'O celulă în formă de bastonaș, cu mult mai mică decât un parameci.', points: null },
  spirala: { text: 'Filament răsucit ca un arc.', points: null },
  'rosu-portocaliu': { text: 'Coloniile lui colorează apa sărată în roz-portocaliu.', points: null },
  // protozoa
  cili: { text: 'Se deplasează cu cili: sute de perișori care bat ca niște vâsle.', points: 'protozoare', type: 'ciliat' },
  pseudopode: { text: 'Își schimbă forma tot timpul și înaintează cu pseudopode.', points: 'protozoare', type: 'amiba' },
  'flagel-fara-perete': { text: 'Înoată cu un flagel lung și nu are perete celular: învelișul e flexibil, își schimbă ușor forma.', points: 'protozoare', type: 'flagelat' },
  'inghite-hrana': { text: 'Înghite hrană: bacterii și alge mici.', points: null },
  'o-celula-nucleu': { text: 'O singură celulă, cu nucleu.', points: null },
  cloroplaste: { text: 'Are cloroplaste verzi.', points: null },
  // chromista
  'casuta-siliciu': { text: 'Are o căsuță din siliciu, din două jumătăți, cu desene fine.', points: 'chromista', type: 'diatomee' },
  'placi-coarne': { text: 'Are un înveliș din plăci, cu coarne lungi, și doi flageli așezați în șănțuri.', points: 'chromista', type: 'dinoflagelat' },
  'pigment-auriu': { text: 'Cloroplastele sunt galben-aurii, nu verzi.', points: null },
  'colonie-stea': { text: 'Celulele stau lipite în formă de stea.', points: null },
  // fungi
  'absoarbe-hrana': { text: 'Nu are clorofilă și își absoarbe hrana direct din mediu, prin perete.', points: 'fungi' },
  inmugurire: { text: 'Celule ovale care se înmulțesc prin înmugurire: celula nouă crește ca un mugur pe cea veche.', points: 'fungi', type: 'drojdie' },
  'hife-spori': { text: 'Este format din filamente subțiri (hife) și capete cu spori.', points: 'fungi', type: 'mucegai' },
  fermentatie: { text: 'Transformă zahărul în alcool și dioxid de carbon (fermentație).', points: null },
  // plants (algae)
  'perete-celuloza-cloroplaste': { text: 'Are perete de celuloză și cloroplaste: face fotosinteză ca o plantă.', points: 'plante' },
  'doi-flageli-verde': { text: 'Înoată cu doi flageli scurți.', points: null },
  semiluna: { text: 'Celulă în formă de semilună, cu doi cloroplaști mari.', points: null },
  'colonie-sfera': { text: 'Sute de celule cu flageli, prinse într-o sferă care se rostogolește.', points: null },
  // animals
  'pluricelular-organe': { text: 'Pluricelular, cu organe: ochi, intestin, picioare cu peri pentru înot.', points: 'animale' },
  'pluricelular-tentacule': { text: 'Pluricelular, cu tentacule în jurul gurii, cu care prinde prada.', points: 'animale' },
};

export interface Organism {
  id: string;
  /** Romanian name. */
  name: string;
  /** Latin name: 'Genus species' or 'Genus sp.'. */
  binomial: string;
  group: GroupId;
  type?: TypeId;
  /** Slide id where it lives (see SLIDES). */
  slide: string;
  /** Clue ids shown on its observation card (2–3). */
  clues: string[];
  /** Clue ids that decide its group (a subset of clues). */
  diagnostic: string[];
  /** One sentence for a wrong answer. */
  explanation: string;
  /** Lesson section that explains it ('slug#section'). */
  lessonSection: string;
  fact: string;
  /** Asset id (mono silhouette) and stain tone. */
  sprite: string;
  tone: 'eosin-deep' | 'methylene-deep' | 'iodine-deep' | 'safranin-deep' | 'hematoxylin-deep';
  /** Drawn size class on the field: s (bacteria, yeast), m (most cells), l (colonies, molds, animals). */
  size: 's' | 'm' | 'l';
  /** How it moves on the field (animation only). */
  motion: 'drift' | 'cilia' | 'flagellum' | 'amoeboid' | 'roll';
  /** Only in the advanced mode. */
  cs?: true;
}

export interface Slide {
  id: string;
  /** Catalog number shown as "Preparat 02". */
  number: number;
  sample: string;
  /** One line of context in the slide label. */
  context: string;
  cs?: true;
}

export const SLIDES: Slide[] = [
  { id: 'infuzie-fan', number: 1, sample: 'infuzie de fân', context: 'Fân lăsat câteva zile în apă: viața din el se înmulțește.' },
  { id: 'apa-balta', number: 2, sample: 'apă de baltă', context: 'O picătură de apă luată de lângă stuf.' },
  { id: 'iaurt', number: 3, sample: 'iaurt de casă uitat în frigider', context: 'Bacteriile care l-au făcut și ce a crescut peste el între timp.' },
  { id: 'lac-sarat', number: 4, sample: 'apă dintr-un lac sărat', context: 'Saramură: aici trăiesc doar puțini specialiști.', cs: true },
];

const L = (section: string) => `diversitatea-vietii#${section}`;

export const ORGANISMS: Organism[] = [
  // ── Preparat 01 · infuzie de fân ──
  {
    id: 'parameci',
    name: 'Parameci',
    binomial: 'Paramecium caudatum',
    group: 'protozoare',
    type: 'ciliat',
    slide: 'infuzie-fan',
    clues: ['o-celula-nucleu', 'cili', 'inghite-hrana'],
    diagnostic: ['cili'],
    explanation: 'Parameciul este o singură celulă cu nucleu, fără perete, care se mișcă cu cili: un protozoar ciliat.',
    lessonSection: L('microorganisme'),
    fact: 'Își înghite hrana printr-o „gură” celulară, un șanț căptușit cu cili.',
    sprite: 'parameci',
    tone: 'hematoxylin-deep',
    size: 'm',
    motion: 'cilia',
  },
  {
    id: 'amiba',
    name: 'Amibă',
    binomial: 'Amoeba proteus',
    group: 'protozoare',
    type: 'amiba',
    slide: 'infuzie-fan',
    clues: ['o-celula-nucleu', 'pseudopode', 'inghite-hrana'],
    diagnostic: ['pseudopode'],
    explanation: 'Amiba își schimbă forma și înaintează cu pseudopode, fără perete celular: este un protozoar.',
    lessonSection: L('microorganisme'),
    fact: 'Își învelește prada cu pseudopodele și o închide într-o veziculă.',
    sprite: 'amoeba',
    tone: 'hematoxylin-deep',
    size: 'm',
    motion: 'amoeboid',
  },
  {
    id: 'euglena',
    name: 'Euglenă',
    binomial: 'Euglena viridis',
    group: 'protozoare',
    type: 'flagelat',
    slide: 'infuzie-fan',
    clues: ['cloroplaste', 'flagel-fara-perete'],
    diagnostic: ['flagel-fara-perete'],
    explanation:
      'Euglena are cloroplaste, dar nu are perete de celuloză și înoată cu un flagel, iar la lumină slabă se hrănește și heterotrof, de aceea programa o așază la protozoarele flagelate.',
    lessonSection: L('microorganisme'),
    fact: 'O pată roșie de lângă flagel, stigma, o ajută să se îndrepte spre lumină.',
    sprite: 'euglena',
    tone: 'methylene-deep',
    size: 'm',
    motion: 'flagellum',
  },
  {
    id: 'bacil-fan',
    name: 'Bacilul fânului',
    binomial: 'Bacillus subtilis',
    group: 'bacterii',
    slide: 'infuzie-fan',
    clues: ['bastonas', 'fara-nucleu-obisnuit'],
    diagnostic: ['fara-nucleu-obisnuit'],
    explanation: 'Bacilul fânului nu are nucleu și trăiește într-un mediu obișnuit, pe fân și în sol: este o bacterie.',
    lessonSection: L('trei-domenii'),
    fact: 'Formează spori care rezistă la fierbere, de aceea apare mereu în infuzia de fân.',
    sprite: 'bacillus-subtilis',
    tone: 'eosin-deep',
    size: 's',
    motion: 'drift',
  },
  // ── Preparat 02 · apă de baltă ──
  {
    id: 'nitzschia',
    name: 'Diatomee',
    binomial: 'Nitzschia sp.',
    group: 'chromista',
    type: 'diatomee',
    slide: 'apa-balta',
    clues: ['casuta-siliciu', 'pigment-auriu'],
    diagnostic: ['casuta-siliciu'],
    explanation: 'Căsuța de siliciu din două jumătăți este semnul diatomeelor, care fac parte din Chromista, nu din plante.',
    lessonSection: L('trei-domenii'),
    fact: 'Căsuțele diatomeelor moarte formează pe fundul apelor o rocă albă, diatomitul.',
    sprite: 'nitzschia',
    tone: 'iodine-deep',
    size: 'm',
    motion: 'drift',
  },
  {
    id: 'asterionella',
    name: 'Diatomee stelată',
    binomial: 'Asterionella sp.',
    group: 'chromista',
    type: 'diatomee',
    slide: 'apa-balta',
    clues: ['colonie-stea', 'casuta-siliciu'],
    diagnostic: ['casuta-siliciu'],
    explanation: 'Fiecare braț al stelei este o diatomee cu căsuță de siliciu, deci colonia face parte din Chromista.',
    lessonSection: L('trei-domenii'),
    fact: 'Primăvara se înmulțește atât de mult încât tulbură apa lacurilor.',
    sprite: 'asterionella',
    tone: 'iodine-deep',
    size: 'l',
    motion: 'roll',
  },
  {
    id: 'ceratium',
    name: 'Dinoflagelat',
    binomial: 'Ceratium hirundinella',
    group: 'chromista',
    type: 'dinoflagelat',
    slide: 'apa-balta',
    clues: ['placi-coarne', 'pigment-auriu'],
    diagnostic: ['placi-coarne'],
    explanation: 'Învelișul din plăci cu coarne și cei doi flageli din șănțuri arată un dinoflagelat, din grupul Chromista.',
    lessonSection: L('trei-domenii'),
    fact: 'Coarnele lungi îl ajută să plutească fără să se scufunde.',
    sprite: 'ceratium',
    tone: 'safranin-deep',
    size: 'm',
    motion: 'flagellum',
  },
  {
    id: 'volvox',
    name: 'Volvox',
    binomial: 'Volvox sp.',
    group: 'plante',
    slide: 'apa-balta',
    clues: ['colonie-sfera', 'perete-celuloza-cloroplaste'],
    diagnostic: ['perete-celuloza-cloroplaste'],
    explanation: 'Celulele volvoxului au perete de celuloză și cloroplaste verzi, deci este o algă verde, din regnul plantelor.',
    lessonSection: L('plante-animale'),
    fact: 'Coloniile-fiice cresc în interiorul sferei-mamă până când aceasta se rupe.',
    sprite: 'volvox',
    tone: 'methylene-deep',
    size: 'l',
    motion: 'roll',
  },
  {
    id: 'closterium',
    name: 'Algă semilună',
    binomial: 'Closterium sp.',
    group: 'plante',
    slide: 'apa-balta',
    clues: ['semiluna', 'perete-celuloza-cloroplaste'],
    diagnostic: ['perete-celuloza-cloroplaste'],
    explanation: 'Closterium are perete de celuloză și cloroplaste verzi: este o algă verde, deci o plantă.',
    lessonSection: L('plante-animale'),
    fact: 'La capete are vacuole cu cristale mici care tremură continuu.',
    sprite: 'closterium',
    tone: 'methylene-deep',
    size: 'm',
    motion: 'drift',
  },
  {
    id: 'chlamydomonas',
    name: 'Chlamydomonas',
    binomial: 'Chlamydomonas sp.',
    group: 'plante',
    slide: 'apa-balta',
    clues: ['doi-flageli-verde', 'perete-celuloza-cloroplaste'],
    diagnostic: ['perete-celuloza-cloroplaste'],
    explanation: 'Deși înoată cu flageli, Chlamydomonas are perete de celuloză și un cloroplast mare: este o algă verde, nu un protozoar.',
    lessonSection: L('plante-animale'),
    fact: 'Colorează în verde bălțile și chiar zăpada, primăvara.',
    sprite: 'chlamydomonas',
    tone: 'methylene-deep',
    size: 'm',
    motion: 'flagellum',
  },
  {
    id: 'daphnia',
    name: 'Purice de apă',
    binomial: 'Daphnia pulex',
    group: 'animale',
    slide: 'apa-balta',
    clues: ['pluricelular-organe', 'inghite-hrana'],
    diagnostic: ['pluricelular-organe'],
    explanation: 'Puricele de apă este pluricelular, cu ochi, intestin și picioare: este un animal, un crustaceu mic.',
    lessonSection: L('plante-animale'),
    fact: 'Prin corpul lui transparent i se vede inima bătând.',
    sprite: 'purice-de-apa',
    tone: 'iodine-deep',
    size: 'l',
    motion: 'flagellum',
    cs: true,
  },
  {
    id: 'hidra',
    name: 'Hidră',
    binomial: 'Hydra sp.',
    group: 'animale',
    slide: 'apa-balta',
    clues: ['pluricelular-tentacule', 'inghite-hrana'],
    diagnostic: ['pluricelular-tentacule'],
    explanation: 'Hidra este pluricelulară, cu tentacule în jurul gurii: este un animal (celenterat), nu o algă.',
    lessonSection: L('plante-animale'),
    fact: 'Dacă o tai în bucăți, fiecare bucată poate crește într-o hidră întreagă.',
    sprite: 'hidra',
    tone: 'eosin-deep',
    size: 'l',
    motion: 'drift',
    cs: true,
  },
  // ── Preparat 03 · iaurt de casă ──
  {
    id: 'streptococ',
    name: 'Streptococ lactic',
    binomial: 'Streptococcus sp.',
    group: 'bacterii',
    slide: 'iaurt',
    clues: ['lant-sfere', 'fara-nucleu-obisnuit'],
    diagnostic: ['fara-nucleu-obisnuit'],
    explanation: 'Streptococul lactic nu are nucleu și trăiește în lapte: este o bacterie, cea care transformă laptele în iaurt.',
    lessonSection: L('microorganisme'),
    fact: 'Transformă zahărul din lapte în acid lactic, de aceea iaurtul e acrișor.',
    sprite: 'streptococcus',
    tone: 'eosin-deep',
    size: 's',
    motion: 'drift',
  },
  {
    id: 'drojdie',
    name: 'Drojdie de bere',
    binomial: 'Saccharomyces cerevisiae',
    group: 'fungi',
    type: 'drojdie',
    slide: 'iaurt',
    clues: ['inmugurire', 'fermentatie'],
    diagnostic: ['inmugurire'],
    explanation: 'Celulele care se înmulțesc prin înmugurire și fac fermentație sunt drojdii, adică ciuperci (Fungi).',
    lessonSection: L('microorganisme'),
    fact: 'Dioxidul de carbon pe care îl produce face aluatul să crească.',
    sprite: 'saccharomyces',
    tone: 'iodine-deep',
    size: 's',
    motion: 'drift',
  },
  {
    id: 'penicillium',
    name: 'Mucegai verde',
    binomial: 'Penicillium sp.',
    group: 'fungi',
    type: 'mucegai',
    slide: 'iaurt',
    clues: ['hife-spori', 'absoarbe-hrana'],
    diagnostic: ['hife-spori', 'absoarbe-hrana'],
    explanation: 'Hifele cu capete pline de spori și hrana absorbită din mediu arată un mucegai, deci o ciupercă (Fungi).',
    lessonSection: L('microorganisme'),
    fact: 'Dintr-o specie de Penicillium s-a obținut penicilina, primul antibiotic.',
    sprite: 'penicillium',
    tone: 'methylene-deep',
    size: 'l',
    motion: 'drift',
  },
  {
    id: 'mucor',
    name: 'Mucegai alb',
    binomial: 'Mucor mucedo',
    group: 'fungi',
    type: 'mucegai',
    slide: 'iaurt',
    clues: ['hife-spori', 'absoarbe-hrana'],
    diagnostic: ['hife-spori', 'absoarbe-hrana'],
    explanation: 'Filamentele (hife) cu sporangi rotunzi în vârf sunt ale unui mucegai, o ciupercă din regnul Fungi.',
    lessonSection: L('microorganisme'),
    fact: 'Sporangii lui negri se văd cu ochiul liber ca un puf cu puncte pe pâinea veche.',
    sprite: 'mucor',
    tone: 'hematoxylin-deep',
    size: 'l',
    motion: 'drift',
  },
  // ── Preparat 04 · lac sărat (advanced) ──
  {
    id: 'halobacterium',
    name: 'Halobacterium',
    binomial: 'Halobacterium sp.',
    group: 'arhee',
    slide: 'lac-sarat',
    clues: ['fara-nucleu-extrem', 'rosu-portocaliu'],
    diagnostic: ['fara-nucleu-extrem'],
    explanation: 'Halobacterium nu are nucleu și trăiește în saramură, un mediu extrem: este o arhee, deși numele spune „bacterie”.',
    lessonSection: L('trei-domenii'),
    fact: 'Numele a fost dat înainte să se afle că arheele sunt un domeniu separat de bacterii.',
    sprite: 'halobacterium',
    tone: 'safranin-deep',
    size: 's',
    motion: 'drift',
    cs: true,
  },
  {
    id: 'spirulina',
    name: 'Spirulină',
    binomial: 'Arthrospira platensis',
    group: 'bacterii',
    slide: 'lac-sarat',
    clues: ['spirala', 'fara-nucleu-fotosinteza'],
    diagnostic: ['fara-nucleu-fotosinteza'],
    explanation: 'Spirulina nu are nucleu, dar face fotosinteză cu pigmenți verzi-albaștri: este o cianobacterie, deci o bacterie.',
    lessonSection: L('trei-domenii'),
    fact: 'Trăiește în lacuri calde și alcaline și se vinde uscată ca supliment alimentar.',
    sprite: 'arthrospira',
    tone: 'methylene-deep',
    size: 'm',
    motion: 'roll',
    cs: true,
  },
];

export const slidesFor = (mode: SafariMode) => SLIDES.filter((s) => mode === 'avansat' || !s.cs);
export const organismsFor = (mode: SafariMode) => ORGANISMS.filter((o) => mode === 'avansat' || !o.cs);
export const organismById = (id: string) => ORGANISMS.find((o) => o.id === id);
