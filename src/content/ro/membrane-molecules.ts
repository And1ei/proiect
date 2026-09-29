// REVIEW: copy by Claude, needs native review (and a biology teacher's check of every sentence).
//
// The biology of "Poarta membranei" (G2). One entry per situation: a molecule plus the direction it
// has to go. The table in the G2 spec is the source; do not add molecules or claims without asking.
// Programa, clasa a IX-a: "Schimbul de substanțe între celulă și mediu" (difuzie și osmoză: trunchi
// comun; difuzie facilitată și transport activ: curriculum de specialitate).
//
// Formulas use Unicode subscripts and superscripts (O₂, Na⁺). Canvas and DOM render them with
// src/games/celula/poarta-membranei/formula.ts, because the site's mono font has no ₂ or ⁺ glyphs.
//
// Plain data with erasable TypeScript only: unit tests import this file directly.

/** Where a molecule can go. 'blocat': the membrane doesn't let it cross on its own. */
export type Route = 'dublu-strat' | 'canal' | 'pompa' | 'blocat';

/** 'baza': trunchi comun (difuzie, osmoză). 'avansat': curriculum de specialitate. */
export type MembraneMode = 'baza' | 'avansat';

export type Side = 'exterior' | 'interior';

/** Drawing of the token (atom cluster); see art.ts. */
export type Species = 'O2' | 'CO2' | 'glucoza' | 'Na' | 'K' | 'proteina';

export interface ModeRule {
  route: Route;
  /** Optional (S1): the lesson section that explains it, 'slug#section' ("vezi în lecție"). */
  lessonSection?: string;
  /** One sentence, shown after a wrong route and in the results recap. */
  explanation: string;
}

export interface MoleculeSituation {
  id: string;
  species: Species;
  /** Romanian name with its article, as used in a sentence start ("Oxigenul"). */
  name: string;
  /** Short name for chips and announcements ("oxigen"). */
  short: string;
  formula: string;
  size: 'mica' | 'mare' | 'foarte-mare';
  polarity: 'nepolara' | 'polara';
  /** Electric charge in elementary units (ions only). */
  charge: number;
  /** The side it drifts in from (the side it is leaving). */
  from: Side;
  /** The side where this substance is more concentrated. */
  higher: Side;
  /** Situation text (Romanian), shown in the recap title and announcements: "intră în celulă". */
  situation: string;
  /** Which modes use this situation, with the correct route and explanation for each. */
  modes: Partial<Record<MembraneMode, ModeRule>>;
}

export const ROUTES: readonly Route[] = ['dublu-strat', 'canal', 'pompa', 'blocat'];

/** Routes offered in each mode, in gate order (keys 1, 2, 3, 4). */
export const MODE_ROUTES: Record<MembraneMode, readonly Route[]> = {
  baza: ['dublu-strat', 'blocat'],
  avansat: ['dublu-strat', 'canal', 'pompa', 'blocat'],
};

/** True when the molecule moves from the side where it is more concentrated (down the gradient). */
export const withGradient = (m: MoleculeSituation) => m.from === m.higher;

export const MOLECULES: readonly MoleculeSituation[] = [
  {
    id: 'oxigen',
    species: 'O2',
    name: 'Oxigenul',
    short: 'oxigen',
    formula: 'O₂',
    size: 'mica',
    polarity: 'nepolara',
    charge: 0,
    from: 'exterior',
    higher: 'exterior',
    situation: 'intră în celulă',
    modes: {
      baza: {
        route: 'dublu-strat',
        lessonSection: 'celula#difuzie-osmoza',
        explanation:
          'Oxigenul este o moleculă mică și nepolară, deci trece direct prin dublul strat lipidic, spre interior, unde mitocondriile îl consumă și concentrația lui rămâne mai mică.',
      },
      avansat: {
        route: 'dublu-strat',
        lessonSection: 'celula#difuzie-osmoza',
        explanation:
          'Oxigenul este mic și nepolar: trece direct prin dublul strat lipidic, în sensul gradientului, fără proteine și fără ATP (difuzie simplă).',
      },
    },
  },
  {
    id: 'dioxid-de-carbon',
    species: 'CO2',
    name: 'Dioxidul de carbon',
    short: 'dioxid de carbon',
    formula: 'CO₂',
    size: 'mica',
    polarity: 'nepolara',
    charge: 0,
    from: 'interior',
    higher: 'interior',
    situation: 'iese din celulă',
    modes: {
      baza: {
        route: 'dublu-strat',
        lessonSection: 'celula#difuzie-osmoza',
        explanation:
          'Dioxidul de carbon se produce în celulă prin metabolism, deci e mai concentrat înăuntru, și, fiind mic și nepolar, iese direct prin dublul strat lipidic.',
      },
      avansat: {
        route: 'dublu-strat',
        lessonSection: 'celula#difuzie-osmoza',
        explanation:
          'Dioxidul de carbon este mic și nepolar: iese direct prin dublul strat lipidic, în sensul gradientului, fără ATP (difuzie simplă).',
      },
    },
  },
  {
    id: 'glucoza',
    species: 'glucoza',
    name: 'Glucoza',
    short: 'glucoză',
    formula: 'C₆H₁₂O₆',
    size: 'mare',
    polarity: 'polara',
    charge: 0,
    from: 'exterior',
    higher: 'exterior',
    situation: 'intră în celulă',
    modes: {
      baza: {
        route: 'blocat',
        lessonSection: 'celula#membrana',
        explanation:
          'Glucoza este mare și polară, așa că membrana nu o lasă să treacă singură prin dublul strat lipidic; celula o primește totuși, cu ajutorul unor proteine transportoare din membrană.',
      },
      avansat: {
        route: 'canal',
        lessonSection: 'celula#transport-activ',
        explanation:
          'Glucoza este mare și polară, deci intră printr-o proteină transportoare, în sensul gradientului și fără consum de ATP (difuzie facilitată).',
      },
    },
  },
  {
    id: 'sodiu-intra',
    species: 'Na',
    name: 'Ionul de sodiu',
    short: 'ion de sodiu',
    formula: 'Na⁺',
    size: 'mica',
    polarity: 'polara',
    charge: 1,
    from: 'exterior',
    higher: 'exterior',
    situation: 'intră în celulă',
    modes: {
      baza: {
        route: 'blocat',
        lessonSection: 'celula#membrana',
        explanation:
          'Ionul de sodiu are sarcină electrică, așa că nu poate trece singur prin dublul strat lipidic; intră în celulă prin canale proteice din membrană.',
      },
      avansat: {
        route: 'canal',
        lessonSection: 'celula#transport-activ',
        explanation:
          'Sodiul este mai concentrat în exterior, deci ionul intră în sensul gradientului, printr-un canal proteic, fără consum de ATP (difuzie facilitată).',
      },
    },
  },
  {
    id: 'sodiu-iese',
    species: 'Na',
    name: 'Ionul de sodiu',
    short: 'ion de sodiu',
    formula: 'Na⁺',
    size: 'mica',
    polarity: 'polara',
    charge: 1,
    from: 'interior',
    higher: 'exterior',
    situation: 'iese din celulă',
    modes: {
      avansat: {
        route: 'pompa',
        lessonSection: 'celula#transport-activ',
        explanation:
          'Sodiul este scos spre exterior, unde e deja mai concentrat, adică împotriva gradientului, ceea ce doar pompa poate face, cu consum de ATP (transport activ).',
      },
    },
  },
  {
    id: 'potasiu-intra',
    species: 'K',
    name: 'Ionul de potasiu',
    short: 'ion de potasiu',
    formula: 'K⁺',
    size: 'mica',
    polarity: 'polara',
    charge: 1,
    from: 'exterior',
    higher: 'interior',
    situation: 'intră în celulă',
    modes: {
      avansat: {
        route: 'pompa',
        lessonSection: 'celula#transport-activ',
        explanation:
          'Potasiul este mai concentrat în interiorul celulei, deci ionul e adus înăuntru împotriva gradientului, de pompă, cu consum de ATP (transport activ).',
      },
    },
  },
  {
    id: 'proteina',
    species: 'proteina',
    name: 'Proteina',
    short: 'proteină mare',
    formula: 'proteină',
    size: 'foarte-mare',
    polarity: 'polara',
    charge: 0,
    from: 'exterior',
    higher: 'exterior',
    situation: 'ajunge la membrană',
    modes: {
      baza: {
        route: 'blocat',
        lessonSection: 'celula#membrana',
        explanation:
          'O proteină este mult prea mare pentru dublul strat lipidic; celulele pot prelua molecule mari prin vezicule (transport veziculos), dar acesta nu face parte din joc.',
      },
      avansat: {
        route: 'blocat',
        lessonSection: 'celula#membrana',
        explanation:
          'O proteină este prea mare pentru dublul strat, pentru canale și pentru pompe; moleculele mari intră prin vezicule (transport veziculos), care nu face parte din joc.',
      },
    },
  },
];

export const moleculesFor = (mode: MembraneMode) => MOLECULES.filter((m) => m.modes[mode]);

export const moleculeById = (id: string) => MOLECULES.find((m) => m.id === id);
