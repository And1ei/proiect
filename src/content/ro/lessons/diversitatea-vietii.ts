// REVIEW: copy by Claude, needs native review and a teacher's check of the science
import type { Lesson } from './types';

export const diversitateaVietii: Lesson = {
  slug: 'diversitatea-vietii',
  number: 3,
  title: 'Diversitatea lumii vii',
  navTitle: 'Diversitatea',
  stain: 'safranin',
  hook: 'De ce are vulpea un nume latin, *Vulpes vulpes*, și la ce folosește el, dacă toată lumea îi spune „vulpe”?',
  sections: [
    {
      id: 'clasificare',
      title: 'De ce are fiecare specie două nume latinești?',
      body: [
        'Același animal are nume diferite în fiecare limbă, iar uneori același nume popular denumește două specii. De aceea biologii folosesc **nomenclatura binară**, introdusă de Carl Linné: fiecare specie are un nume latin din două cuvinte, genul și specia. Vulpea roșie este *Vulpes vulpes*, stejarul pedunculat este *Quercus robur*.',
        'Speciile asemănătoare se grupează în categorii tot mai largi, numite **unități taxonomice**: specie, gen, familie, ordin, clasă, încrengătură, regn. Cu cât urci, cu atât grupul e mai mare și asemănările mai puține.',
      ],
      margin: 'Genul se scrie cu majusculă, specia cu literă mică, iar numele se scrie înclinat.',
    },
    {
      id: 'trei-domenii',
      title: 'Care sunt cele trei mari ramuri ale vieții?',
      body: [
        'Deasupra regnurilor stau trei **domenii**. **Bacteriile** și **arheele** au celule procariote, fără nucleu. Unele bacterii, **cianobacteriile**, fac fotosinteză cu pigmenți verzi-albaștri. Arheele seamănă la vedere cu bacteriile, dar diferă prin chimia lor și trăiesc des în medii extreme, ca izvoarele fierbinți sau apele foarte sărate.',
        'Al treilea domeniu, al **eucariotelor**, cuprinde toate organismele cu celule cu nucleu: protiste, ciuperci, plante și animale. Omul face parte din el, la fel ca drojdia de pâine. **Protistele**, eucariote de obicei unicelulare, se împart în **protozoare** și **Chromista**.',
      ],
      predict: {
        question: 'O bacterie și o ciupercă de mucegai: care are nucleu?',
        answer: 'Ciuperca: este eucariotă. Bacteria este procariotă, fără nucleu.',
      },
    },
    {
      id: 'microorganisme',
      title: 'Ce fac viețuitoarele pe care nu le vedem?',
      body: [
        '**Microorganismele** se văd doar la microscop. **Bacteriile** descompun resturile moarte, fac iaurtul și murăturile prin fermentație, dar unele produc boli. **Protozoarele** sunt eucariote unicelulare fără perete celular, care trăiesc în apă. Se mișcă cu **cili** (parameciul), cu **pseudopode** (amiba) sau cu un **flagel** (euglena, care are și cloroplaste).',
        '**Chromista** au adesea un înveliș tare: **diatomeele**, o căsuță de siliciu din două jumătăți, iar **dinoflagelatele**, plăci. Tot aici intră algele brune din mare.',
        '**Ciupercile** nu fac fotosinteză: absorb prin perete substanțe organice gata făcute. **Drojdiile** se înmulțesc prin înmugurire și fac aluatul să crească. **Mucegaiurile** au filamente subțiri, numite **hife**, și fac spori; ele descompun resturile, iar din unele se obțin antibiotice, ca penicilina.',
      ],
      margin: 'Fără descompunători, frunzele căzute s-ar aduna an de an și solul ar rămâne fără substanțe minerale.',
    },
    {
      id: 'plante-animale',
      title: 'Prin ce se deosebesc plantele de animale?',
      body: [
        'Plantele sunt **autotrofe**: își fac singure hrana prin fotosinteză, din apă, dioxid de carbon și lumină, cu ajutorul clorofilei din cloroplaste. Celulele lor au perete de celuloză, iar plantele nu se deplasează. **Algele verzi**, chiar și cele dintr-o singură celulă, au și ele perete de celuloză și cloroplaste, așa că țin de plante.',
        'Animalele sunt **heterotrofe**: iau substanța organică din hrană. Sunt pluricelulare, cu țesuturi și organe; celulele lor nu au perete celular, iar cele mai multe se deplasează ca să-și caute hrana. Diversitatea lor e uriașă, de la puricele de apă de câțiva milimetri la pelicanul din Delta Dunării.',
      ],
    },
    {
      id: 'conservare',
      title: 'De ce contează câte specii trăiesc undeva?',
      body: [
        '**Biodiversitatea** înseamnă varietatea vieții: câte specii sunt, cât de diferiți sunt indivizii unei specii și câte tipuri de ecosisteme există. Un ecosistem cu multe specii are mai multe rețele de hrană și se reface mai ușor după o secetă sau o boală.',
        'Pentru a păstra speciile amenințate se creează **arii protejate**. Delta Dunării este **rezervație a biosferei**: acolo trăiesc sute de specii de păsări, printre care cea mai mare colonie de pelicani comuni din Europa.',
      ],
      predict: {
        question: 'Dacă într-o rețea trofică o specie dispare, cine rezistă mai bine: prădătorul care mănâncă un singur fel de pradă sau cel care mănâncă mai multe?',
        answer: 'Cel care are mai multe feluri de hrană: poate trece pe altă pradă.',
      },
    },
  ],
  keyPoints: [
    'Fiecare specie are un nume latin din două cuvinte: genul și specia (nomenclatura binară).',
    'Trei domenii: bacterii și arhee (procariote, fără nucleu) și eucariote (cu nucleu).',
    'Ecosistemele cu multe specii se refac mai ușor; ariile protejate păstrează speciile amenințate.',
  ],
  games: [
    { gameId: 'safari-microscop', afterSection: 'plante-animale' },
    { gameId: 'safari-microscop-avansat', afterSection: 'plante-animale' },
  ],
  whyItMatters: 'Multe medicamente, de la penicilină la aspirină, au pornit de la o ciupercă sau o plantă, adică de la biodiversitate.',
  check: [
    {
      prompt: 'Care este scrierea corectă a unui nume științific?',
      options: ['vulpes Vulpes', 'Vulpes vulpes', 'VULPES VULPES', 'Vulpes Vulpes'],
      answer: 1,
      explanation: 'Genul începe cu majusculă, specia cu literă mică.',
      section: 'clasificare',
    },
    {
      prompt: 'Ce au în comun bacteriile și arheele?',
      options: ['Au nucleu', 'Fac toate fotosinteză', 'Au celule fără nucleu', 'Sunt pluricelulare'],
      answer: 2,
      explanation: 'Amândouă sunt procariote: celulele lor nu au nucleu.',
      section: 'trei-domenii',
    },
    {
      prompt: 'O plantă și o ciupercă de pădure: care dintre ele este heterotrofă?',
      options: ['Planta', 'Ciuperca', 'Amândouă', 'Niciuna'],
      answer: 1,
      explanation: 'Ciupercile nu fac fotosinteză, deci iau substanța organică gata făcută.',
      section: 'microorganisme',
    },
  ],
};
