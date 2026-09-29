// REVIEW: copy by Claude, needs native review (and a biology teacher's check of every fact).
//
// The biology of "Echilibrul" (G3): species, who eats whom, and the events, per scenario.
// Programa, clasa a IX-a: niveluri de organizare, lanțuri și rețele trofice, factori care
// influențează dimensiunea populației, echilibrul ecologic, extincția unui prădător (studiu de caz);
// indicii structurali ai biocenozei (dominanța), curriculum de specialitate.
//
// Swaps from the G3 brief (same guild, a licensed silhouette exists):
//   - Lymantria dispar → Biston betularia: no licensed silhouette of L. dispar exists; the caterpillars
//     of B. betularia also eat oak leaves (approved by the project owner).
//   - Daphnia magna → Daphnia pulex: D. magna silhouettes are non-commercial only.
// Diets are simplified on purpose; the texts say "model simplificat" where it matters.
//
// Plain data with erasable TypeScript only: unit tests import this file directly.

export type Guild = 'producator' | 'consumator-1' | 'consumator-2' | 'consumator-3';
export type ScenarioId = 'padure' | 'balta';

export const GUILD_LEVEL: Record<Guild, number> = { producator: 1, 'consumator-1': 2, 'consumator-2': 3, 'consumator-3': 4 };

export const GUILD_NAME: Record<Guild, string> = {
  producator: 'producător',
  'consumator-1': 'consumator de ordinul I',
  'consumator-2': 'consumator de ordinul II',
  'consumator-3': 'consumator de ordinul III',
};

export interface Species {
  id: string;
  /** Romanian common name. */
  name: string;
  /** Latin binomial (Genus species), or null for a group (fitoplancton). */
  binomial: string | null;
  /** For groups: what the group is, e.g. "alge microscopice, de exemplu diatomee". */
  group?: string;
  guild: Guild;
  /** Ids of the species it eats in this model. */
  eats: string[];
  /** Ids of the species that eat it in this model. */
  eatenBy: string[];
  /** One sentence: its place in the food chain. */
  role: string;
  /** One sentence: a concrete fact. */
  fact: string;
  /** Asset id in src/assets/manifest.ts. */
  sprite: string;
}

export type EventKind = 'seceta' | 'omizi' | 'vanatoare' | 'ingrasaminte' | 'pescuit';

export interface EcoEventText {
  kind: EventKind;
  /** Short newspaper-style headline for the pinned clipping. */
  headline: string;
  /** One sentence: the ecological mechanism (event log and recap). */
  mechanism: string;
  /** Optional (S1): the lesson section that explains it, 'slug#section' ("vezi în lecție"). */
  lessonSection?: string;
}

export interface ScenarioText {
  id: ScenarioId;
  name: string;
  place: string;
  species: Species[];
  events: EcoEventText[];
}

export const PADURE: ScenarioText = {
  id: 'padure',
  name: 'Pădurea de stejar',
  place: 'o pădure de stejar de câmpie',
  species: [
    {
      id: 'stejar',
      name: 'Stejar pedunculat',
      binomial: 'Quercus robur',
      guild: 'producator',
      eats: [],
      eatenBy: ['molia', 'soarece'],
      role: 'Producătorul pădurii: prin fotosinteză face substanța organică din care trăiesc toate celelalte specii.',
      fact: 'Ghindele lui hrănesc multe animale din pădure, de la șoareci la gaițe și mistreți.',
      sprite: 'stejar',
    },
    {
      id: 'molia',
      name: 'Molia mestecănului',
      binomial: 'Biston betularia',
      guild: 'consumator-1',
      eats: ['stejar'],
      eatenBy: ['soarece'],
      role: 'Consumator de ordinul I: omizile ei mănâncă frunzele stejarului.',
      fact: 'Este celebră pentru forma închisă la culoare, care s-a înmulțit în zonele poluate în timpul Revoluției Industriale.',
      sprite: 'molia-mestecanului',
    },
    {
      id: 'soarece',
      name: 'Șoarece de pădure',
      binomial: 'Apodemus sylvaticus',
      guild: 'consumator-1',
      eats: ['stejar', 'molia'],
      eatenBy: ['vulpe', 'huhurez'],
      role: 'Consumator de ordinul I: mănâncă mai ales ghinde și semințe, dar și omizi (model simplificat).',
      fact: 'Adună ghinde în ascunzători pentru iarnă, iar pe cele uitate le ajută să încolțească.',
      sprite: 'soarece-de-padure',
    },
    {
      id: 'vulpe',
      name: 'Vulpe roșie',
      binomial: 'Vulpes vulpes',
      guild: 'consumator-2',
      eats: ['soarece'],
      eatenBy: [],
      role: 'Consumator de ordinul II: vânează rozătoare mici, mai ales șoareci (model simplificat).',
      fact: 'Aude șoarecii sub zăpadă și sare asupra lor de sus, cu un salt în arc.',
      sprite: 'vulpe',
    },
    {
      id: 'huhurez',
      name: 'Huhurez mic',
      binomial: 'Strix aluco',
      guild: 'consumator-2',
      eats: ['soarece'],
      eatenBy: [],
      role: 'Consumator de ordinul II: bufniță care vânează noaptea, mai ales rozătoare.',
      fact: 'Zboară aproape fără zgomot, datorită marginilor moi ale penelor.',
      sprite: 'huhurez',
    },
  ],
  events: [
    {
      kind: 'seceta',
      lessonSection: 'ecosisteme#biotop-biocenoza',
      headline: 'Secetă: nu a plouat de două luni',
      mechanism: 'Fără apă, stejarul face mai puțină substanță organică, iar lipsa hranei ajunge, cu întârziere, la consumatori.',
    },
    {
      kind: 'omizi',
      lessonSection: 'ecosisteme#retele-trofice',
      headline: 'Invazie de omizi în coroanele stejarilor',
      mechanism: 'Omizile foarte numeroase mănâncă frunzele mai repede decât le reface stejarul, așa că producătorul scade.',
    },
    {
      kind: 'vanatoare',
      lessonSection: 'ecosisteme#echilibru',
      headline: 'Braconaj: vulpile sunt vânate ilegal',
      mechanism: 'Fără prădătorii lor, șoarecii se înmulțesc mult și consumă prea multe ghinde, apoi scad și ei din lipsă de hrană.',
    },
  ],
};

export const BALTA: ScenarioText = {
  id: 'balta',
  name: 'Balta din Delta Dunării',
  place: 'o baltă din Delta Dunării',
  species: [
    {
      id: 'fitoplancton',
      name: 'Fitoplancton',
      binomial: null,
      group: 'alge microscopice, de exemplu diatomee',
      guild: 'producator',
      eats: [],
      eatenBy: ['daphnia'],
      role: 'Producătorul bălții: algele microscopice fac fotosinteză și hrănesc zooplanctonul.',
      fact: 'Diatomeele au un înveliș de siliciu, ca o cutie de sticlă cu capac.',
      sprite: 'fitoplancton',
    },
    {
      id: 'daphnia',
      name: 'Purice de apă',
      binomial: 'Daphnia pulex',
      guild: 'consumator-1',
      eats: ['fitoplancton'],
      eatenBy: ['platica'],
      role: 'Consumator de ordinul I: filtrează apa și mănâncă algele microscopice.',
      fact: 'Are doar câțiva milimetri și înoată în salturi, cu ajutorul antenelor.',
      sprite: 'purice-de-apa',
    },
    {
      id: 'platica',
      name: 'Plătică',
      binomial: 'Abramis brama',
      guild: 'consumator-2',
      eats: ['daphnia'],
      eatenBy: ['stiuca', 'pelican'],
      role: 'Consumator de ordinul II: mănâncă zooplancton și mici nevertebrate de pe fund (model simplificat).',
      fact: 'Corpul ei înalt și turtit lateral o ajută să se strecoare printre plantele de apă.',
      sprite: 'platica',
    },
    {
      id: 'stiuca',
      name: 'Știucă',
      binomial: 'Esox lucius',
      guild: 'consumator-3',
      eats: ['platica'],
      eatenBy: [],
      role: 'Consumator de ordinul III: pește răpitor care pândește printre stuf și atacă brusc.',
      fact: 'Are sute de dinți ascuțiți, orientați spre gât, ca prada să nu poată scăpa.',
      sprite: 'stiuca',
    },
    {
      id: 'pelican',
      name: 'Pelican comun',
      binomial: 'Pelecanus onocrotalus',
      guild: 'consumator-3',
      eats: ['platica'],
      eatenBy: [],
      role: 'Consumator de ordinul III: pescuiește în grup, mânând peștii spre apă mică (model simplificat).',
      fact: 'Delta Dunării găzduiește cea mai mare colonie de pelicani comuni din Europa.',
      sprite: 'pelican',
    },
  ],
  events: [
    {
      kind: 'seceta',
      lessonSection: 'ecosisteme#biotop-biocenoza',
      headline: 'Secetă: nivelul apei din baltă scade',
      mechanism: 'Cu mai puțină apă, algele au mai puțin loc și mai puține substanțe, iar scăderea lor se transmite pe rând în rețeaua trofică.',
    },
    {
      kind: 'ingrasaminte',
      lessonSection: 'ecosisteme#echilibru',
      headline: 'Îngrășăminte scurse de pe câmpuri în baltă',
      mechanism: 'Nitrații și fosfații hrănesc algele, care se înmulțesc exploziv (înflorirea apelor), iar descompunerea lor consumă oxigenul din apă și peștii mor (eutrofizare).',
    },
    {
      kind: 'pescuit',
      lessonSection: 'ecosisteme#echilibru',
      headline: 'Pescuit excesiv de plătică',
      mechanism: 'Când se pescuiește mai mult decât se pot reface peștii, plătica scade, prădătorii ei rămân fără hrană, iar zooplanctonul se înmulțește.',
    },
  ],
};

export const SCENARIOS: Record<ScenarioId, ScenarioText> = { padure: PADURE, balta: BALTA };

export const speciesOf = (scenario: ScenarioId, id: string) => SCENARIOS[scenario].species.find((s) => s.id === id);
