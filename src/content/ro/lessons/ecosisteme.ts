// REVIEW: copy by Claude, needs native review and a teacher's check of the science
import type { Lesson } from './types';

export const ecosisteme: Lesson = {
  slug: 'ecosisteme',
  number: 2,
  title: 'Niveluri de organizare și ecosisteme',
  stain: 'methylene',
  hook: 'Dacă dispar vulpile dintr-o pădure, de ce ajung să sufere și stejarii?',
  sections: [
    {
      id: 'niveluri',
      title: 'De la o singură vulpe la toată planeta',
      body: [
        'O vulpe anume este un **individ**. Toate vulpile care se pot înmulți între ele și au urmași fertili formează o **specie**. Vulpile care trăiesc în aceeași pădure, în același timp, sunt o **populație**.',
        'Populațiile tuturor speciilor din pădure (stejari, omizi, șoareci, vulpi, bufnițe, ciuperci) formează **biocenoza**. Biocenoza împreună cu locul în care trăiește formează un **ecosistem**. Toate ecosistemele Pământului la un loc alcătuiesc **biosfera**.',
      ],
      margin: 'Ordinea, de la mic la mare: individ, populație, biocenoză, ecosistem, biosferă.',
    },
    {
      id: 'biotop-biocenoza',
      title: 'Ce înseamnă „locul” unui ecosistem?',
      body: [
        '**Biotopul** este partea neînsuflețită a ecosistemului: solul, apa, aerul, lumina, temperatura, umiditatea. Acestea sunt **factori abiotici**. Viețuitoarele și relațiile dintre ele sunt **factori biotici**.',
        'Pentru un pește dintr-o baltă, biotopul înseamnă apa, cu temperatura, oxigenul și lumina ei. Biotopul și biocenoza se influențează reciproc. O secetă (un factor abiotic) scade creșterea plantelor, iar asta ajunge la toți cei care se hrănesc cu ele. Invers, pădurea umbrește solul și păstrează umezeala.',
      ],
      predict: {
        question: 'Temperatura apei dintr-un lac este factor biotic sau abiotic?',
        answer: 'Abiotic: ține de biotop, nu de viețuitoare.',
      },
    },
    {
      id: 'retele-trofice',
      title: 'Cine pe cine mănâncă?',
      body: [
        '**Producătorii**, adică plantele și algele, fac substanță organică prin fotosinteză. **Consumatorii de ordinul I** mănâncă producători, cei de **ordinul II** mănâncă consumatori de ordinul I, și așa mai departe. **Descompunătorii**, bacterii și ciuperci, transformă resturile moarte în substanțe minerale.',
        'Un șir de tipul stejar, omidă, șoarece, vulpe este un **lanț trofic**. În natură lanțurile se încrucișează, pentru că un animal mănâncă de obicei mai multe feluri de hrană: împreună formează o **rețea trofică**. La fiecare treaptă se pierde multă energie, de aceea prădătorii mari sunt puțini.',
      ],
      margin: 'Săgeata dintr-o rețea trofică arată sensul hranei: de la cel mâncat la cel care mănâncă.',
    },
    {
      id: 'echilibru',
      title: 'Ce ține o pădure în echilibru?',
      body: [
        'Mărimea unei populații depinde de hrană, de prădători, de boli, de spațiu și de condițiile de mediu. Când hrana e multă, populația crește; când prădătorii se înmulțesc, prada scade, apoi scad și prădătorii. Așa se păstrează **echilibrul ecologic**.',
        'Dacă un prădător dispare, legătura se rupe. Fără vulpi, șoarecii se înmulțesc foarte mult și mănâncă prea multe ghinde, așa că răsar mai puțini stejari. Apoi, fără destulă hrană, scad și șoarecii. Un singur dispărut schimbă tot ecosistemul.',
      ],
      predict: {
        question: 'Ce se întâmplă mai întâi când dispare prădătorul: scad plantele sau cresc prăzile?',
        answer: 'Cresc prăzile. Abia după aceea, pentru că mănâncă prea mult, scad plantele.',
      },
    },
    {
      id: 'dominanta',
      title: 'Cum măsori o biocenoză?',
      cs: true,
      body: [
        'Ca să compari biocenoze, numeri indivizii dintr-o suprafață de probă și calculezi **indici structurali**. Unul dintre ei este **dominanța**: cât la sută din toți indivizii numărați aparțin unei specii. Formula este D = n / N × 100, unde n este numărul de indivizi ai speciei, iar N numărul total.',
        'Exemplu: într-o probă dintr-o baltă numeri 120 de purici de apă, 60 de plătici și 20 de știuci, deci N = 200. Dominanța puricelui de apă este 120 / 200 × 100 = 60%. Specia cu dominanța cea mai mare este **specia dominantă**.',
      ],
      margin: 'Suma dominanțelor tuturor speciilor din probă este 100%.',
    },
  ],
  keyPoints: [
    'Individ, populație, biocenoză, ecosistem, biosferă: fiecare nivel le cuprinde pe cele dinainte.',
    'Ecosistemul este biotopul (factori abiotici) plus biocenoza (viețuitoarele și relațiile lor).',
    'Dacă dispare un prădător, prada crește, apoi hrana ei scade, iar echilibrul se strică.',
  ],
  games: [
    { gameId: 'echilibrul', afterSection: 'echilibru' },
    { gameId: 'echilibrul-avansat', afterSection: 'dominanta' },
  ],
  whyItMatters: 'Braconajul sau pescuitul excesiv al unei singure specii pot goli de hrană o pădure sau o baltă întreagă.',
  check: [
    {
      prompt: 'Toate plătițele dintr-o baltă, la un moment dat, formează:',
      options: ['un individ', 'o populație', 'o biocenoză', 'un biotop'],
      answer: 1,
      explanation: 'Indivizii aceleiași specii care trăiesc în același loc și în același timp formează o populație.',
      section: 'niveluri',
    },
    {
      prompt: 'Într-o pădure dispar vulpile. Ce se întâmplă mai întâi?',
      options: ['Scad stejarii', 'Cresc șoarecii', 'Scad șoarecii', 'Cresc vulpile din alte păduri'],
      answer: 1,
      explanation: 'Fără prădător, prada se înmulțește; abia apoi scade hrana ei.',
      section: 'echilibru',
    },
    {
      prompt: 'Care dintre acestea este un factor abiotic?',
      options: ['Omizile', 'Ciupercile din sol', 'Umiditatea aerului', 'Vulpile'],
      answer: 2,
      explanation: 'Umiditatea ține de biotop, partea neînsuflețită a ecosistemului.',
      section: 'biotop-biocenoza',
    },
  ],
};
