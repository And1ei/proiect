// REVIEW: copy by Claude, needs native review and a teacher's check of the science
import type { Lesson } from './types';

export const celula: Lesson = {
  slug: 'celula',
  number: 1,
  title: 'Celula și moleculele vieții',
  navTitle: 'Celula',
  stain: 'eosin',
  hook: 'De ce o hematie pusă în apă distilată se umflă până se sparge, iar în ser fiziologic rămâne întreagă?',
  sections: [
    {
      id: 'moleculele-vietii',
      title: 'Din ce e făcută o celulă?',
      body: [
        'Cea mai mare parte dintr-o celulă este **apa**: în ea se dizolvă substanțele și au loc aproape toate reacțiile. Restul sunt molecule organice, fiecare cu treaba ei.',
        '**Glucidele**, ca glucoza, sunt combustibilul rapid. **Lipidele** formează membranele și păstrează energie de rezervă. **Proteinele** construiesc celula și, ca enzime, grăbesc reacțiile. **Acizii nucleici** (ADN și ARN) păstrează și transmit informația ereditară. **Vitaminele** sunt necesare în cantități mici, ca ajutoare ale enzimelor.',
        'Energia din glucoză nu e folosită direct: celula o trece în **ATP**, o moleculă care cedează energie exact acolo unde e nevoie de ea.',
      ],
      margin: 'Un om adult are aproximativ 60% apă din masa corpului.',
      predict: {
        question: 'Dacă o celulă ar rămâne fără ATP, ce ar înceta prima dată: stocarea informației sau munca ei?',
        answer: 'Munca: ATP-ul alimentează reacțiile, mișcarea și transportul prin membrană. Informația din ADN rămâne acolo.',
      },
    },
    {
      id: 'organite',
      title: 'Ce face fiecare parte a celulei?',
      body: [
        'Bacteriile sunt celule **procariote**: nu au nucleu, iar ADN-ul lor stă liber în citoplasmă. Plantele, animalele și ciupercile au celule **eucariote**, cu nucleu și cu **organite**, compartimente cu câte o funcție.',
        '**Nucleul** păstrează ADN-ul. **Ribozomii** fac proteine. **Reticulul endoplasmatic** și **aparatul Golgi** le prelucrează și le trimit mai departe. **Mitocondriile** eliberează energia din glucoză și produc ATP. La plante, **cloroplastele** fac fotosinteză, iar o vacuolă mare ține apa.',
      ],
      margin: 'Ribozomii există și la bacterii: orice celulă are nevoie să facă proteine.',
    },
    {
      id: 'membrana',
      title: 'De ce nu trece orice prin membrană?',
      body: [
        'Fiecare celulă este învelită de **membrana celulară**, un **dublu strat lipidic**: două rânduri de lipide cu „capetele” spre apă și „cozile” ascunse la mijloc. Printre lipide sunt prinse proteine.',
        'Mijlocul membranei este gras, deci nu lasă să treacă ușor moleculele care se amestecă bine cu apa. Moleculele mici și nepolare, ca oxigenul și dioxidul de carbon, trec direct. Glucoza este mare și polară, iar ionii (Na⁺, K⁺) au sarcină electrică: ei nu trec singuri, ci doar prin proteine speciale. De aceea spunem că membrana este **semipermeabilă**.',
      ],
      margin: 'Proteinele mari nu trec deloc prin membrană: intră în vezicule, un transport care nu e în acest joc.',
    },
    {
      id: 'difuzie-osmoza',
      title: 'Cum se mișcă substanțele fără efort?',
      body: [
        '**Difuzia** este trecerea unei substanțe de acolo unde e mai concentrată acolo unde e mai puțină, fără consum de energie. Așa intră oxigenul în celulă și iese dioxidul de carbon.',
        '**Osmoza** este deplasarea apei printr-o membrană semipermeabilă spre soluția mai concentrată. Într-o soluție **hipotonică**, ca apa distilată, apa intră în hematie până aceasta se sparge (**liză**). Într-o soluție **hipertonică** apa iese, iar hematia se zbârcește (**crenare**). **Serul fiziologic**, NaCl 0,9%, este **izotonic**: are aceeași concentrație ca sângele, așa că hematia nu se schimbă.',
      ],
      predict: {
        question: 'De ce nu se face o perfuzie cu apă distilată?',
        answer: 'Apa ar intra prin osmoză în hematii, care s-ar umfla și s-ar sparge. Serul fiziologic e izotonic, deci nu le afectează.',
      },
    },
    {
      id: 'transport-activ',
      title: 'Cum intră în celulă ce nu trece singur?',
      cs: true,
      body: [
        'Glucoza și ionii trec prin proteine din membrană. În **difuzia facilitată**, un **canal** sau o **proteină transportoare** le lasă să treacă în sensul gradientului, de la concentrație mare la mică, fără ATP.',
        'Uneori celula are nevoie de o substanță chiar împotriva gradientului. Atunci lucrează o **pompă**, care consumă ATP: acesta este **transportul activ**. Pompa de sodiu și potasiu scoate ionii de sodiu din celulă și aduce ionii de potasiu înăuntru, deși potasiul e deja mai mult în interior.',
      ],
      margin: 'Regula scurtă: în sensul gradientului, fără ATP; împotriva lui, cu ATP.',
    },
  ],
  keyPoints: [
    'Celula e făcută mai ales din apă, plus glucide, lipide, proteine, acizi nucleici și vitamine.',
    'Membrana e semipermeabilă: moleculele mici și nepolare trec, ionii și glucoza au nevoie de proteine.',
    'Apa trece prin osmoză spre soluția mai concentrată; serul fiziologic e izotonic cu sângele.',
  ],
  games: [
    { gameId: 'poarta-membranei', afterSection: 'difuzie-osmoza' },
    { gameId: 'poarta-membranei-avansat', afterSection: 'transport-activ' },
  ],
  whyItMatters: 'Perfuziile se fac cu ser fiziologic, nu cu apă, tocmai din cauza osmozei.',
  check: [
    {
      prompt: 'O hematie este pusă într-o soluție mai concentrată decât sângele. Ce se întâmplă?',
      options: ['Se umflă și se sparge', 'Pierde apă și se zbârcește', 'Rămâne la fel', 'Absoarbe sarea și crește'],
      answer: 1,
      explanation: 'Apa iese prin osmoză spre soluția mai concentrată, deci hematia se zbârcește (crenare).',
      section: 'difuzie-osmoza',
    },
    {
      prompt: 'Care substanță trece singură, direct prin dublul strat lipidic?',
      options: ['Ionul de sodiu', 'Glucoza', 'Oxigenul', 'O proteină'],
      answer: 2,
      explanation: 'Oxigenul e o moleculă mică și nepolară, deci trece printre lipidele membranei.',
      section: 'membrana',
    },
    {
      prompt: 'Care organit produce cea mai mare parte din ATP-ul celulei?',
      options: ['Ribozomul', 'Mitocondria', 'Aparatul Golgi', 'Nucleul'],
      answer: 1,
      explanation: 'Mitocondriile eliberează energia din glucoză și o trec în ATP.',
      section: 'organite',
    },
  ],
};
