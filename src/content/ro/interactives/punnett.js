// Punnett builder ("Careul lui Punnett"). Only genotypes and questions live here; every grid cell,
// ratio and percentage is computed from them in features/interactives/punnett/genetics.js.

const punnett = {
  title: 'Careul lui Punnett',
  intro:
    'Pune gameții fiecărui părinte pe marginea careului, completează fiecare căsuță, apoi citește rapoartele. La final rezolvi o problemă scurtă, ca la Bacalaureat.',
  trait: { letter: 'A', dominant: 'boabe galbene', recessive: 'boabe verzi' },

  modes: {
    mono: {
      label: 'Monohibridare',
      problem: 'Încrucișezi două plante de mazăre heterozigote pentru culoarea boabelor.',
      parents: ['Aa', 'Aa'],
      word: {
        text: 'Doi indivizi heterozigoți pentru culoarea boabelor (Aa) se încrucișează. Ce procent din urmași vor avea boabe verzi?',
        ask: { phenotype: 'recessive' },
      },
    },
    test: {
      label: 'Încrucișare de test',
      problem:
        'O plantă cu boabe galbene are genotip necunoscut: homozigot dominant sau heterozigot? O încrucișezi cu o plantă cu boabe verzi (aa).',
      parents: ['?', 'aa'],
      unknown: {
        observation:
          'Printre urmași apar aproximativ la fel de multe plante cu boabe galbene ca plante cu boabe verzi.',
        options: ['AA', 'Aa'],
        actual: 'Aa',
      },
      word: {
        text: 'O plantă cu boabe galbene, heterozigotă, se încrucișează cu o plantă cu boabe verzi. Ce procent din urmași sunt heterozigoți?',
        ask: { genotype: 'heterozygous' },
      },
    },
  },

  percentOptions: [0, 25, 50, 75, 100],

  text: {
    modesLabel: 'Tipul încrucișării',
    corner: 'Gameți',
    parent: 'Părintele {n}',
    gametesOf: 'Gameții părintelui {n}',
    unknownPrompt: 'Ce genotip are planta cu boabe galbene?',
    headersStep: 'Pune fiecare alelă pe marginea careului: gameții părintelui 1 sus, ai părintelui 2 în stânga.',
    cellsStep: 'Completează fiecare căsuță cu genotipul urmașului.',
    cellEmpty: 'Căsuța rândului {r}, coloana {c}, goală',
    cellFilled: 'Căsuța rândului {r}, coloana {c}: {g}',
    chooseGenotype: 'Alege genotipul',
    ratiosStep: 'Scrie rapoartele, cu numere separate prin două puncte.',
    genoRatio: 'Raport genotipic ({order})',
    phenoRatio: 'Raport fenotipic ({order})',
    ratioPlaceholder: 'de exemplu 1:1',
    wordStep: 'Problema',
    percent: '{n} %',
    modeDone: 'Încrucișare rezolvată.',
    hints: {
      unknown: 'Un homozigot AA formează doar gameți A, deci toți urmașii ar avea boabe galbene. Apariția boabelor verzi arată că planta are și alela a.',
      headers: 'Un părinte Aa formează două tipuri de gameți: A și a. Fiecare gamet merge într-un singur antet, pe latura părintelui său.',
      cells: 'O căsuță primește alela din antetul rândului ei și alela din antetul coloanei ei. Scrie întâi alela dominantă (literă mare).',
      ratios: 'Numără căsuțele: {counts}. Apoi grupează după fenotip: dominant înseamnă cel puțin o literă mare.',
      word: 'Careul are 4 căsuțe, deci fiecare căsuță înseamnă 25 % din urmași.',
    },
  },
};

export default punnett;
