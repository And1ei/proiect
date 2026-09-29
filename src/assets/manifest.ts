// Every shipped asset (image, sound) with its source and license. The single source of truth for:
//   - /credite (the credits page renders this list),
//   - src/assets/urls.ts (id → bundled URL, used by <Sprite>, sfx and Phaser scenes),
//   - scripts/assets-check.mjs (the license gate, run before every build),
//   - scripts/assets-clean.mjs (rebuilds src/assets/<kind>/ from the originals in assets-src/).
//
// Rules (see GAME-DEV.md, "Assets"):
//   - No placeholder art and no freehand organism/cell drawings. If a scene needs a sprite, source
//     one through this file.
//   - sourceUrl is the specific item's own page, where its license can be checked, never a site root.
//   - Allowed: CC0, public domain, CC-BY (any version), MIT / Apache / OFL. CC-BY-SA needs a
//     `licenseReview` note from a human. NC and ND are never allowed.
//
// Plain data with erasable TypeScript only: Node scripts import this file directly.

export type AssetKind = 'icon' | 'organism' | 'ui' | 'sound' | 'texture';

/** SPDX-style identifiers understood by the license gate. */
export type LicenseId =
  | 'CC0-1.0'
  | 'PDM-1.0'
  | 'CC-BY-3.0'
  | 'CC-BY-4.0'
  | 'CC-BY-SA-3.0'
  | 'CC-BY-SA-4.0'
  | 'MIT'
  | 'Apache-2.0'
  | 'OFL-1.1';

/** Named sound events (see src/games/feel/sfx.ts). */
export type SoundEvent = 'click' | 'correct' | 'wrong' | 'streak' | 'levelUp' | 'win' | 'lose' | 'pop' | 'whoosh';

export interface AssetEntry {
  /** Stable id used in code: <Sprite id>, sfx, Phaser texture keys. */
  id: string;
  /** Path under src/assets/, e.g. 'organisms/paramecium.svg'. */
  file: string;
  kind: AssetKind;
  /** Romanian name shown on the credits page. */
  title: string;
  sourceName: string;
  /** The item's own page (where its license is stated), not the site's home page. */
  sourceUrl: string;
  author: string;
  license: LicenseId;
  attributionRequired: boolean;
  /** What we changed, in Romanian (shown on the credits page; required by CC BY). */
  modifications: string;
  /** Original file in assets-src/, rebuilt into `file` by `npm run assets:clean`. */
  raw: string;
  /**
   * SVG cleaning mode. 'palette': every colour snapped to the nearest stain-palette colour.
   * 'mono': single-colour silhouette, fills become currentColor so <Sprite> and Phaser can tint it.
   */
  color?: 'palette' | 'mono';
  /**
   * Palette mode only: snap every colour into one stain family by lightness (greys to paper/ink),
   * so several states of one object stay the same colour (e.g. normal, crenated and lysed red cells).
   */
  hue?: 'eosin' | 'methylene' | 'iodine';
  /** Remove the first drawn shape: an artboard background some exports include. */
  dropBackground?: boolean;
  /** Sound only: which named event it plays. */
  event?: SoundEvent;
  /** Required for CC-BY-SA: who checked the share-alike terms and when. */
  licenseReview?: { by: string; date: string; note: string };
}

const BIOICONS = 'https://github.com/duerrsimon/bioicons/blob/main/static/icons';
const PHYLOPIC = 'https://www.phylopic.org/images';
const KENNEY_INTERFACE = 'https://kenney.nl/assets/interface-sounds';

const SVG_MODS = 'optimizat cu SVGO, metadate eliminate, încadrat într-un pătrat';
const PALETTE_MODS = `${SVG_MODS}, culori aliniate la paleta site-ului`;
const HUE_MODS = `${SVG_MODS}, recolorat în nuanțele unei singure culori din paleta site-ului`;
const MONO_MODS = `${SVG_MODS}, recolorat într-o singură culoare`;
const MP3_MODS = 'convertit din OGG în MP3 (mono, 64 kbps)';

export const ASSETS: readonly AssetEntry[] = [
  // ── Cells and organelles (Bioicons) ─────────────────────────────
  {
    id: 'mitocondrie',
    file: 'icons/mitocondrie.svg',
    kind: 'icon',
    title: 'Mitocondrie',
    sourceName: 'Bioicons',
    sourceUrl: `${BIOICONS}/cc-0/Intracellular_components/jaiganesh/mitochondria.svg`,
    author: 'jaiganesh',
    license: 'CC0-1.0',
    attributionRequired: false,
    modifications: PALETTE_MODS,
    raw: 'bioicons/mitochondria.svg',
    color: 'palette',
  },
  {
    id: 'reticul-endoplasmatic',
    file: 'icons/reticul-endoplasmatic.svg',
    kind: 'icon',
    title: 'Reticul endoplasmatic',
    sourceName: 'Bioicons',
    sourceUrl: `${BIOICONS}/cc-0/Intracellular_components/jaiganesh/Endoplasmic_Reticulum.svg`,
    author: 'jaiganesh',
    license: 'CC0-1.0',
    attributionRequired: false,
    modifications: PALETTE_MODS,
    raw: 'bioicons/Endoplasmic_Reticulum.svg',
    color: 'palette',
  },
  {
    id: 'ribozom',
    file: 'icons/ribozom.svg',
    kind: 'icon',
    title: 'Ribozom',
    sourceName: 'Bioicons',
    sourceUrl: `${BIOICONS}/cc-0/Intracellular_components/jaiganesh/ribosome.svg`,
    author: 'jaiganesh',
    license: 'CC0-1.0',
    attributionRequired: false,
    modifications: PALETTE_MODS,
    raw: 'bioicons/ribosome.svg',
    color: 'palette',
  },
  {
    id: 'aparat-golgi',
    file: 'icons/aparat-golgi.svg',
    kind: 'icon',
    title: 'Aparat Golgi',
    sourceName: 'Servier Medical Art, prin Bioicons',
    sourceUrl: `${BIOICONS}/cc-by-3.0/Intracellular_components/Servier/golgi-2d-1.svg`,
    author: 'Servier',
    license: 'CC-BY-3.0',
    attributionRequired: true,
    modifications: PALETTE_MODS,
    raw: 'bioicons/golgi-2d-1.svg',
    color: 'palette',
  },
  {
    id: 'celula',
    file: 'icons/celula.svg',
    kind: 'icon',
    title: 'Celulă',
    sourceName: 'Bioicons',
    sourceUrl: `${BIOICONS}/cc-0/Cell_types/Marnie-Maddock/simple_cell1.svg`,
    author: 'Marnie Maddock',
    license: 'CC0-1.0',
    attributionRequired: false,
    modifications: PALETTE_MODS,
    raw: 'bioicons/simple_cell1.svg',
    color: 'palette',
  },
  {
    id: 'bacterie',
    file: 'icons/bacterie.svg',
    kind: 'icon',
    title: 'Bacterie',
    sourceName: 'Bioicons',
    sourceUrl: `${BIOICONS}/cc-0/Microbiology/Pauline_Franz/generic-bacterium.svg`,
    author: 'Pauline Franz',
    license: 'CC0-1.0',
    attributionRequired: false,
    modifications: PALETTE_MODS,
    raw: 'bioicons/generic-bacterium.svg',
    color: 'palette',
  },
  {
    id: 'bacteriofag',
    file: 'icons/bacteriofag.svg',
    kind: 'icon',
    title: 'Bacteriofag',
    sourceName: 'Bioicons',
    sourceUrl: `${BIOICONS}/cc-0/Microbiology/James-Lloyd/Phage.svg`,
    author: 'James Lloyd',
    license: 'CC0-1.0',
    attributionRequired: false,
    modifications: PALETTE_MODS,
    raw: 'bioicons/Phage.svg',
    color: 'palette',
    dropBackground: true,
  },

  // ── Membrane transport and osmosis (G2, "Poarta membranei") ─────
  {
    id: 'atp',
    file: 'icons/atp.svg',
    kind: 'icon',
    title: 'ATP (adenozin trifosfat)',
    sourceName: 'Bioicons',
    sourceUrl: `${BIOICONS}/cc-0/Nucleic_acids/Simon_D%C3%BCrr/atp.svg`,
    author: 'Simon Dürr',
    license: 'CC0-1.0',
    attributionRequired: false,
    modifications: PALETTE_MODS,
    raw: 'bioicons/atp.svg',
    color: 'palette',
  },
  {
    id: 'eritrocit',
    file: 'icons/eritrocit.svg',
    kind: 'icon',
    title: 'Eritrocit (hematie)',
    sourceName: 'Servier Medical Art, prin Bioicons',
    sourceUrl: `${BIOICONS}/cc-by-3.0/Blood_Immunology/Servier/erythrocyte.svg`,
    author: 'Servier',
    license: 'CC-BY-3.0',
    attributionRequired: true,
    modifications: HUE_MODS,
    raw: 'bioicons/erythrocyte.svg',
    color: 'palette',
    hue: 'eosin',
  },
  {
    id: 'eritrocit-crenat',
    file: 'icons/eritrocit-crenat.svg',
    kind: 'icon',
    title: 'Eritrocit în soluție hipertonică (crenare)',
    sourceName: 'Servier Medical Art, prin Bioicons',
    sourceUrl: `${BIOICONS}/cc-by-3.0/Blood_Immunology/Servier/hypertonic-erythrocyte.svg`,
    author: 'Servier',
    license: 'CC-BY-3.0',
    attributionRequired: true,
    modifications: HUE_MODS,
    raw: 'bioicons/hypertonic-erythrocyte.svg',
    color: 'palette',
    hue: 'eosin',
  },
  {
    id: 'eritrocit-liza',
    file: 'icons/eritrocit-liza.svg',
    kind: 'icon',
    title: 'Eritrocit în soluție hipotonică (liză)',
    sourceName: 'Servier Medical Art, prin Bioicons',
    sourceUrl: `${BIOICONS}/cc-by-3.0/Blood_Immunology/Servier/hypotonic-erythrocyte-2.svg`,
    author: 'Servier',
    license: 'CC-BY-3.0',
    attributionRequired: true,
    modifications: HUE_MODS,
    raw: 'bioicons/hypotonic-erythrocyte-2.svg',
    color: 'palette',
    hue: 'eosin',
  },

  // ── Organism silhouettes (PhyloPic) ─────────────────────────────
  {
    id: 'parameci',
    file: 'organisms/parameci.svg',
    kind: 'organism',
    title: 'Parameci (Paramecium tetraurelia)',
    sourceName: 'PhyloPic',
    sourceUrl: `${PHYLOPIC}/4bc4ab1b-852e-413a-87b5-6c63fb059d40`,
    author: 'Arcadia Science',
    license: 'CC0-1.0',
    attributionRequired: false,
    modifications: MONO_MODS,
    raw: 'phylopic/paramecium.svg',
    color: 'mono',
  },
  {
    id: 'euglena',
    file: 'organisms/euglena.svg',
    kind: 'organism',
    title: 'Euglenă (Euglena gracilis)',
    sourceName: 'PhyloPic',
    sourceUrl: `${PHYLOPIC}/e5ad7dde-e8c9-44fc-94be-d07b67c17c1d`,
    author: 'Arcadia Science',
    license: 'CC0-1.0',
    attributionRequired: false,
    modifications: MONO_MODS,
    raw: 'phylopic/euglena.svg',
    color: 'mono',
  },
  {
    id: 'amoeba',
    file: 'organisms/amoeba.svg',
    kind: 'organism',
    title: 'Amibă (Amoeba proteus)',
    sourceName: 'PhyloPic',
    sourceUrl: `${PHYLOPIC}/4227f7b5-b1e5-4af6-99cc-af68795f5855`,
    author: 'Carlo De Rito',
    license: 'CC0-1.0',
    attributionRequired: false,
    modifications: MONO_MODS,
    raw: 'phylopic/amoeba.svg',
    color: 'mono',
  },
  {
    id: 'volvox',
    file: 'organisms/volvox.svg',
    kind: 'organism',
    title: 'Volvox (Volvox carteri)',
    sourceName: 'PhyloPic',
    sourceUrl: `${PHYLOPIC}/ab5abba0-21b6-4e25-9fe5-29e09c96f4c7`,
    author: 'Arcadia Science',
    license: 'CC0-1.0',
    attributionRequired: false,
    modifications: MONO_MODS,
    raw: 'phylopic/volvox.svg',
    color: 'mono',
  },
  {
    id: 'hidra',
    file: 'organisms/hidra.svg',
    kind: 'organism',
    title: 'Hidră (Hydra)',
    sourceName: 'PhyloPic',
    sourceUrl: `${PHYLOPIC}/a3dfd390-83c8-4c97-b03d-935b1c44286e`,
    author: 'Kurtis Wothe și Guillaume Dera',
    license: 'CC0-1.0',
    attributionRequired: false,
    modifications: MONO_MODS,
    raw: 'phylopic/hydra.svg',
    color: 'mono',
  },

  // ── Ecosystems (G3, "Echilibrul"): PhyloPic silhouettes ─────────
  {
    id: 'stejar',
    file: 'organisms/stejar.svg',
    kind: 'organism',
    title: 'Stejar pedunculat (Quercus robur)',
    sourceName: 'PhyloPic',
    sourceUrl: `${PHYLOPIC}/43afe2df-ab6c-47e6-a105-c0a82b8af1c5`,
    author: 'autor necunoscut (PhyloPic)',
    license: 'CC0-1.0',
    attributionRequired: false,
    modifications: MONO_MODS,
    raw: 'phylopic/quercus-robur.svg',
    color: 'mono',
  },
  {
    id: 'molia-mestecanului',
    file: 'organisms/molia-mestecanului.svg',
    kind: 'organism',
    title: 'Molia mestecănului (Biston betularia)',
    sourceName: 'PhyloPic',
    sourceUrl: `${PHYLOPIC}/29aa4ca2-21d3-457a-bdef-976862b0dce3`,
    author: 'Jamie Whitehouse',
    license: 'CC0-1.0',
    attributionRequired: false,
    modifications: MONO_MODS,
    raw: 'phylopic/biston-betularia.svg',
    color: 'mono',
  },
  {
    id: 'soarece-de-padure',
    file: 'organisms/soarece-de-padure.svg',
    kind: 'organism',
    title: 'Șoarece de pădure (Apodemus sylvaticus)',
    sourceName: 'PhyloPic',
    sourceUrl: `${PHYLOPIC}/3b89954e-b28e-4062-89cd-1ad5df0eb431`,
    author: 'Anthony Caravaggi',
    license: 'CC0-1.0',
    attributionRequired: false,
    modifications: MONO_MODS,
    raw: 'phylopic/apodemus-sylvaticus.svg',
    color: 'mono',
  },
  {
    id: 'vulpe',
    file: 'organisms/vulpe.svg',
    kind: 'organism',
    title: 'Vulpe roșie (Vulpes vulpes)',
    sourceName: 'PhyloPic',
    sourceUrl: `${PHYLOPIC}/d67d3bf6-3509-4ab6-819a-cd409985347e`,
    author: 'Anthony Caravaggi',
    license: 'CC0-1.0',
    attributionRequired: false,
    modifications: MONO_MODS,
    raw: 'phylopic/vulpes-vulpes.svg',
    color: 'mono',
  },
  {
    id: 'huhurez',
    file: 'organisms/huhurez.svg',
    kind: 'organism',
    title: 'Huhurez mic (Strix aluco)',
    sourceName: 'PhyloPic',
    sourceUrl: `${PHYLOPIC}/a9628703-8bc2-4fd6-bf3f-2fa706b380dd`,
    author: 'Caroline Legg',
    license: 'CC-BY-4.0',
    attributionRequired: true,
    modifications: MONO_MODS,
    raw: 'phylopic/strix-aluco.svg',
    color: 'mono',
  },
  {
    id: 'fitoplancton',
    file: 'organisms/fitoplancton.svg',
    kind: 'organism',
    title: 'Fitoplancton: diatomee centrică (Coscinodiscophyceae)',
    sourceName: 'PhyloPic',
    sourceUrl: `${PHYLOPIC}/1ac6db29-fe9e-49d2-87de-4dbbd1767af5`,
    author: 'autor necunoscut (PhyloPic)',
    license: 'CC0-1.0',
    attributionRequired: false,
    modifications: MONO_MODS,
    raw: 'phylopic/coscinodiscophyceae.svg',
    color: 'mono',
  },
  {
    id: 'purice-de-apa',
    file: 'organisms/purice-de-apa.svg',
    kind: 'organism',
    title: 'Purice de apă (Daphnia pulex)',
    sourceName: 'PhyloPic',
    sourceUrl: `${PHYLOPIC}/131ff023-9483-4bd0-aee9-1e1502c7a372`,
    author: 'autor necunoscut (PhyloPic)',
    license: 'CC0-1.0',
    attributionRequired: false,
    modifications: MONO_MODS,
    raw: 'phylopic/daphnia-pulex.svg',
    color: 'mono',
  },
  {
    id: 'platica',
    file: 'organisms/platica.svg',
    kind: 'organism',
    title: 'Plătică (Abramis brama)',
    sourceName: 'PhyloPic',
    sourceUrl: `${PHYLOPIC}/fc97b67e-627d-4430-9a5a-2cf661640bc7`,
    author: 'autor necunoscut (PhyloPic)',
    license: 'PDM-1.0',
    attributionRequired: false,
    modifications: MONO_MODS,
    raw: 'phylopic/abramis-brama.svg',
    color: 'mono',
  },
  {
    id: 'stiuca',
    file: 'organisms/stiuca.svg',
    kind: 'organism',
    title: 'Știucă (Esox lucius)',
    sourceName: 'PhyloPic',
    sourceUrl: `${PHYLOPIC}/e11a3135-cfe1-4f8a-8e1e-1824fef0e833`,
    author: 'Timothy Knepp, vectorizat de T. Michael Keesey',
    license: 'PDM-1.0',
    attributionRequired: false,
    modifications: MONO_MODS,
    raw: 'phylopic/esox-lucius.svg',
    color: 'mono',
  },
  {
    id: 'pelican',
    file: 'organisms/pelican.svg',
    kind: 'organism',
    title: 'Pelican comun (Pelecanus onocrotalus)',
    sourceName: 'PhyloPic',
    sourceUrl: `${PHYLOPIC}/37373c17-86fb-40e1-99bb-52e0338b7e88`,
    author: 'Oscar G. Miranda',
    license: 'CC0-1.0',
    attributionRequired: false,
    modifications: MONO_MODS,
    raw: 'phylopic/pelecanus-onocrotalus.svg',
    color: 'mono',
  },

  // ── Microorganisms (G4a, "Safari la microscop"): PhyloPic silhouettes ──
  {
    id: 'streptococcus',
    file: 'organisms/streptococcus.svg',
    kind: 'organism',
    title: 'Streptococ (Streptococcus sp.)',
    sourceName: 'PhyloPic',
    sourceUrl: `${PHYLOPIC}/e5bdf92d-8441-4136-b1a7-44bc79bf82a1`,
    author: 'autor necunoscut (PhyloPic)',
    license: 'CC0-1.0',
    attributionRequired: false,
    modifications: MONO_MODS,
    raw: 'phylopic/streptococcus.svg',
    color: 'mono',
  },
  {
    id: 'bacillus-subtilis',
    file: 'organisms/bacillus-subtilis.svg',
    kind: 'organism',
    title: 'Bacilul fânului (Bacillus subtilis)',
    sourceName: 'PhyloPic',
    sourceUrl: `${PHYLOPIC}/47e927cb-ad31-440c-8127-09a584613928`,
    author: 'autor necunoscut (PhyloPic)',
    license: 'CC0-1.0',
    attributionRequired: false,
    modifications: MONO_MODS,
    raw: 'phylopic/bacillus-subtilis.svg',
    color: 'mono',
  },
  {
    id: 'halobacterium',
    file: 'organisms/halobacterium.svg',
    kind: 'organism',
    title: 'Halobacterium (Halobacterium sp.)',
    sourceName: 'PhyloPic',
    sourceUrl: `${PHYLOPIC}/7ccfe198-154b-4a2f-a7bf-60390cfe6135`,
    author: 'autor necunoscut (PhyloPic)',
    license: 'CC0-1.0',
    attributionRequired: false,
    modifications: MONO_MODS,
    raw: 'phylopic/halobacterium.svg',
    color: 'mono',
  },
  {
    id: 'arthrospira',
    file: 'organisms/arthrospira.svg',
    kind: 'organism',
    title: 'Spirulină (Arthrospira platensis)',
    sourceName: 'PhyloPic',
    sourceUrl: `${PHYLOPIC}/28e22426-7c24-4f0a-bde3-c98dca1632a6`,
    author: 'autor necunoscut (PhyloPic)',
    license: 'CC0-1.0',
    attributionRequired: false,
    modifications: MONO_MODS,
    raw: 'phylopic/arthrospira-platensis.svg',
    color: 'mono',
  },
  {
    id: 'nitzschia',
    file: 'organisms/nitzschia.svg',
    kind: 'organism',
    title: 'Diatomee (Nitzschia sp.)',
    sourceName: 'PhyloPic',
    sourceUrl: `${PHYLOPIC}/4a73da23-3c7a-4fbf-af1f-a4c99bb7c84f`,
    author: 'Sarah Frail',
    license: 'CC0-1.0',
    attributionRequired: false,
    modifications: MONO_MODS,
    raw: 'phylopic/nitzschia.svg',
    color: 'mono',
  },
  {
    id: 'asterionella',
    file: 'organisms/asterionella.svg',
    kind: 'organism',
    title: 'Diatomee stelată (Asterionella sp.)',
    sourceName: 'PhyloPic',
    sourceUrl: `${PHYLOPIC}/c30a2b09-345a-4cd4-a51a-d7ec7d819ada`,
    author: 'Sarah Frail',
    license: 'CC0-1.0',
    attributionRequired: false,
    modifications: MONO_MODS,
    raw: 'phylopic/asterionella.svg',
    color: 'mono',
  },
  {
    id: 'ceratium',
    file: 'organisms/ceratium.svg',
    kind: 'organism',
    title: 'Dinoflagelat (Ceratium hirundinella)',
    sourceName: 'PhyloPic',
    sourceUrl: `${PHYLOPIC}/573efc92-2521-453c-9fa3-0b356d78b910`,
    author: 'autor necunoscut (PhyloPic)',
    license: 'CC0-1.0',
    attributionRequired: false,
    modifications: MONO_MODS,
    raw: 'phylopic/ceratium-hirundinella.svg',
    color: 'mono',
  },
  {
    id: 'saccharomyces',
    file: 'organisms/saccharomyces.svg',
    kind: 'organism',
    title: 'Drojdie de bere (Saccharomyces cerevisiae)',
    sourceName: 'PhyloPic',
    sourceUrl: `${PHYLOPIC}/347bc4ab-c1e0-4313-9ea1-939c2ad71232`,
    author: 'Wayne Decatur',
    license: 'CC0-1.0',
    attributionRequired: false,
    modifications: MONO_MODS,
    raw: 'phylopic/saccharomyces-cerevisiae.svg',
    color: 'mono',
  },
  {
    id: 'penicillium',
    file: 'organisms/penicillium.svg',
    kind: 'organism',
    title: 'Mucegai verde (Penicillium sp.)',
    sourceName: 'PhyloPic',
    sourceUrl: `${PHYLOPIC}/410b4773-dfe7-4c7c-a4d8-75dbb8ec555f`,
    author: 'Arcadia Science',
    license: 'CC0-1.0',
    attributionRequired: false,
    modifications: MONO_MODS,
    raw: 'phylopic/penicillium.svg',
    color: 'mono',
  },
  {
    id: 'mucor',
    file: 'organisms/mucor.svg',
    kind: 'organism',
    title: 'Mucegai alb (Mucor mucedo)',
    sourceName: 'PhyloPic',
    sourceUrl: `${PHYLOPIC}/ba2078ef-1e34-4181-a0a0-893abac714ad`,
    author: 'autor necunoscut (PhyloPic)',
    license: 'CC0-1.0',
    attributionRequired: false,
    modifications: MONO_MODS,
    raw: 'phylopic/mucor-mucedo.svg',
    color: 'mono',
  },
  {
    id: 'closterium',
    file: 'organisms/closterium.svg',
    kind: 'organism',
    title: 'Algă verde (Closterium sp.)',
    sourceName: 'PhyloPic',
    sourceUrl: `${PHYLOPIC}/6417691c-146e-480a-9796-86890fe331f1`,
    author: 'autor necunoscut (PhyloPic)',
    license: 'CC0-1.0',
    attributionRequired: false,
    modifications: MONO_MODS,
    raw: 'phylopic/closterium.svg',
    color: 'mono',
  },
  {
    id: 'chlamydomonas',
    file: 'organisms/chlamydomonas.svg',
    kind: 'organism',
    title: 'Algă verde (Chlamydomonas sp.)',
    sourceName: 'PhyloPic',
    sourceUrl: `${PHYLOPIC}/56538f18-f0db-4323-b969-594357da11fe`,
    author: 'Arcadia Science',
    license: 'CC0-1.0',
    attributionRequired: false,
    modifications: MONO_MODS,
    raw: 'phylopic/chlamydomonas.svg',
    color: 'mono',
  },

  // ── Sounds (Kenney, Interface Sounds) ───────────────────────────
  ...(
    [
      ['click', 'click_001', 'Clic'],
      ['correct', 'confirmation_001', 'Răspuns corect'],
      ['wrong', 'error_008', 'Răspuns greșit'],
      ['streak', 'maximize_006', 'Serie'],
      ['levelUp', 'confirmation_004', 'Nivel nou'],
      ['win', 'confirmation_002', 'Victorie'],
      ['lose', 'error_006', 'Joc pierdut'],
      ['pop', 'drop_002', 'Pocnet'],
      ['whoosh', 'minimize_006', 'Foșnet'],
    ] as const
  ).map(
    ([event, name, title]): AssetEntry => ({
      id: `sfx-${event}`,
      file: `sounds/${event}.mp3`,
      kind: 'sound',
      title: `Sunet: ${title}`,
      sourceName: 'Kenney, Interface Sounds',
      sourceUrl: KENNEY_INTERFACE,
      author: 'Kenney',
      license: 'CC0-1.0',
      attributionRequired: false,
      modifications: `${MP3_MODS}; fișierul original: ${name}.ogg`,
      raw: `kenney/${name}.ogg`,
      event,
    }),
  ),
];

export const LICENSE_INFO: Record<LicenseId, { name: string; url: string }> = {
  'CC0-1.0': { name: 'CC0 1.0 (domeniu public)', url: 'https://creativecommons.org/publicdomain/zero/1.0/' },
  'PDM-1.0': { name: 'Domeniu public', url: 'https://creativecommons.org/publicdomain/mark/1.0/' },
  'CC-BY-3.0': { name: 'CC BY 3.0', url: 'https://creativecommons.org/licenses/by/3.0/' },
  'CC-BY-4.0': { name: 'CC BY 4.0', url: 'https://creativecommons.org/licenses/by/4.0/' },
  'CC-BY-SA-3.0': { name: 'CC BY-SA 3.0', url: 'https://creativecommons.org/licenses/by-sa/3.0/' },
  'CC-BY-SA-4.0': { name: 'CC BY-SA 4.0', url: 'https://creativecommons.org/licenses/by-sa/4.0/' },
  MIT: { name: 'licența MIT', url: 'https://opensource.org/license/mit' },
  'Apache-2.0': { name: 'licența Apache 2.0', url: 'https://www.apache.org/licenses/LICENSE-2.0' },
  'OFL-1.1': { name: 'licența SIL Open Font', url: 'https://openfontlicense.org/' },
};
