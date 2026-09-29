// Sandbox strings (dev-only games). Kept out of ui.js so they never reach production bundles.
// Real games put their copy in src/content/ro/games/<game-id>.js.

export const DRIFT = {
  title: 'Sandbox A: Prinde organismele',
  tagline: 'Joc de probă pentru stratul Phaser. Prinde protistele, ferește-te de bacteriofagi.',
  instructions: [
    'Organisme unicelulare trec prin câmpul microscopului.',
    'Atinge parameciul, euglena, amiba sau volvoxul ca să le prinzi.',
    'Nu atinge bacteriofagii: fiecare te costă o viață.',
    'Prinde 15 organisme ca să câștigi.',
  ],
  controls: {
    touch: 'Atinge un organism ca să-l prinzi.',
    mouse: 'Dă clic pe un organism.',
    keyboard: 'Săgețile mută ținta, Spațiu sau Enter prinde. Escape pune pauză.',
  },
  stage: 'Câmpul microscopului, cu organisme în mișcare',
};

export const SORT = {
  title: 'Sandbox B: Una sau mai multe celule',
  tagline: 'Joc de probă pentru tragere și plasare. Sortează organismele după numărul de celule.',
  instructions: [
    'Trage fiecare organism în zona potrivită.',
    'Unicelular: tot organismul e o singură celulă. Pluricelular: e format din multe celule.',
    'Dacă te blochezi, deschide indiciul. Rezultatul va fi marcat „completat cu ajutor”.',
  ],
  controls: {
    touch: 'Ține apăsat pe un organism și trage-l într-o zonă.',
    mouse: 'Trage organismul cu mouse-ul.',
    keyboard: 'Tab până la un organism, Spațiu îl ridică, săgețile îl mută între zone, Spațiu îl lasă. Escape anulează.',
  },
  trayLabel: 'Organisme de sortat',
  zones: { uni: 'Unicelular', pluri: 'Pluricelular' },
  items: { parameci: 'Parameci', euglena: 'Euglenă', hidra: 'Hidră' },
  hint: 'Unicelular înseamnă o singură celulă, care face totul: se hrănește, se mișcă și se înmulțește. Hidra are țesuturi, deci multe celule.',
  a11y: {
    instructions:
      'Ca să ridici un organism, apasă Spațiu sau Enter. Săgețile îl mută între zone. Spațiu sau Enter îl lasă jos, Escape anulează.',
    start: 'Ai ridicat: {item}.',
    over: '{item} este deasupra zonei {zone}.',
    notOver: '{item} nu este deasupra niciunei zone.',
    end: 'Ai lăsat {item} în zona {zone}.',
    endNowhere: 'Ai lăsat {item} în afara zonelor. S-a întors la locul lui.',
    cancel: 'Mutare anulată. {item} s-a întors la locul lui.',
  },
};

export const fill = (s: string, vars: Record<string, string>) => s.replace(/\{(\w+)\}/g, (m, k: string) => vars[k] ?? m);
