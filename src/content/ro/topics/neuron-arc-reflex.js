/** @type {import('../schema.js').Topic} */
const topic = {
  slug: 'neuron-arc-reflex',
  unit: 1,
  order: 1,
  fig: { number: 1, label: 'Nervos' },
  title: 'Neuronul și arcul reflex',
  summary:
    'Cum primește, conduce și transmite neuronul informația și cum se leagă neuronii între ei ca să producă un reflex.',
  grade: 'a XI-a',
  readMinutes: 5,
  objectives: [
    'Descrii structura neuronului și rolul fiecărei prelungiri.',
    'Explici cum apare impulsul nervos și cum trece de la un neuron la altul prin sinapsa chimică.',
    'Identifici cele cinci componente ale arcului reflex și deosebești reflexele necondiționate de cele condiționate.',
  ],
  glossaryIds: [
    'neuron',
    'dendrita',
    'axon',
    'teaca-de-mielina',
    'potential-de-actiune',
    'sinapsa',
    'neurotransmitator',
    'arc-reflex',
  ],
  interactive: { type: 'reflexArc', config: {} },
  sections: [
    {
      id: 'neuronul',
      heading: 'Neuronul, celula care conduce impulsuri',
      blocks: [
        {
          type: 'p',
          text: 'Sistemul nervos este construit din [[neuron|neuroni]], celule specializate în a primi, a conduce și a transmite informații sub formă de impulsuri nervoase. Neuronii diferă ca formă și mărime, dar au aceeași structură de bază: un corp celular și prelungiri.',
        },
        {
          type: 'p',
          text: 'Corpul celular conține nucleul și organitele celulei. Din el pornesc două tipuri de prelungiri. [[dendrita|Dendritele]] sunt de obicei scurte și ramificate și conduc impulsul spre corpul celular. [[axon|Axonul]] este unic, pornește dintr-o zonă numită con de emergență și conduce impulsul de la corpul celular spre butonii terminali.',
        },
        {
          type: 'note',
          kind: 'retine',
          text: 'Dendritele conduc impulsul spre corpul celular (sens celulipet), iar axonul îl conduce dinspre corpul celular (sens celulifug).',
        },
        { type: 'figure', ref: 'neuron' },
        {
          type: 'p',
          text: 'Multe axoane sunt învelite în [[teaca-de-mielina|teacă de mielină]], un strat izolator întrerupt din loc în loc de strangulațiile Ranvier. Axonul acoperit de teacă formează o fibră mielinică, iar axonul fără teacă, o fibră amielinică.',
        },
      ],
    },
    {
      id: 'impulsul-nervos',
      heading: 'Cum apare impulsul nervos',
      blocks: [
        {
          type: 'p',
          text: 'În repaus, membrana neuronului este polarizată: fața internă este încărcată negativ față de cea externă. Această diferență, numită potențial de repaus, are aproximativ −70 mV și este menținută de pompa de Na⁺ și K⁺, care scoate ioni de sodiu din celulă și introduce ioni de potasiu.',
        },
        {
          type: 'p',
          text: 'Când un stimul are intensitate suficientă, canalele pentru sodiu se deschid și ionii de Na⁺ intră în celulă. Interiorul devine pentru scurt timp pozitiv: aceasta este depolarizarea. Apoi ionii de K⁺ ies, iar membrana revine la polaritatea inițială prin repolarizare. Această inversare rapidă a polarității se numește [[potential-de-actiune|potențial de acțiune]].',
        },
        {
          type: 'p',
          text: 'Potențialul de acțiune respectă legea „tot sau nimic”: un stimul prea slab nu produce niciun răspuns, iar un stimul suficient de puternic produce un răspuns complet, cu aceeași amplitudine.',
        },
        {
          type: 'p',
          text: 'În fibrele amielinice, impulsul se propagă din aproape în aproape, pe toată lungimea membranei. În fibrele mielinice, teaca izolează membrana, iar impulsul sare de la o strangulație Ranvier la alta. Această conducere saltatorie este mult mai rapidă.',
        },
      ],
    },
    {
      id: 'sinapsa',
      heading: 'Sinapsa chimică',
      blocks: [
        {
          type: 'p',
          text: 'Impulsul trece de la un neuron la altul, sau de la un neuron la o celulă efectoare, printr-o [[sinapsa|sinapsă]]. În sinapsa chimică, cele două celule nu se ating: între ele rămâne un spațiu îngust, fanta sinaptică.',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            'Impulsul ajunge la butonul terminal al neuronului presinaptic.',
            'Veziculele din butonul terminal își eliberează conținutul în fanta sinaptică prin exocitoză.',
            'Moleculele de [[neurotransmitator|neurotransmițător]], de exemplu acetilcolina, difuzează prin fantă și se leagă de receptorii membranei postsinaptice.',
            'Legarea modifică permeabilitatea membranei postsinaptice și poate declanșa un nou potențial de acțiune.',
          ],
        },
        {
          type: 'p',
          text: 'Neurotransmițătorul se află doar în butonii terminali, iar receptorii doar pe membrana postsinaptică. De aceea sinapsa chimică transmite impulsul într-un singur sens. Trecerea prin sinapsă durează puțin mai mult decât conducerea prin fibră; diferența se numește întârziere sinaptică.',
        },
        {
          type: 'note',
          kind: 'retine',
          text: 'Sinapsa chimică este unidirecțională: impulsul trece doar de la membrana presinaptică spre membrana postsinaptică.',
        },
      ],
    },
    {
      id: 'arcul-reflex',
      heading: 'Arcul reflex',
      blocks: [
        {
          type: 'p',
          text: 'Sistemul nervos funcționează prin reflexe. Reflexul este răspunsul organismului la un stimul, realizat cu participarea sistemului nervos. Traseul parcurs de impuls în timpul reflexului se numește [[arc-reflex|arc reflex]] și are cinci componente.',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            'Receptorul: structura care primește stimulul și îl transformă în impuls nervos.',
            'Calea aferentă (senzitivă): neuronul senzitiv, care duce impulsul de la receptor spre centru. Corpul lui se află în ganglionul spinal.',
            'Centrul nervos: zona din măduva spinării sau din encefal care analizează informația și elaborează comanda.',
            'Calea eferentă (motorie): neuronul motor, care duce comanda de la centru spre efector.',
            'Efectorul: mușchiul sau glanda care execută răspunsul.',
          ],
        },
        {
          type: 'note',
          kind: 'retine',
          text: 'Dacă oricare dintre cele cinci componente ale arcului reflex este lezată, reflexul nu se mai produce.',
        },
        { type: 'interactive' },
        {
          type: 'p',
          text: 'Un exemplu simplu este reflexul rotulian. O lovitură ușoară sub rotulă întinde tendonul mușchiului cvadriceps, receptorii din mușchi trimit impulsul spre măduva spinării, iar neuronul motor comandă contracția mușchiului. Gamba se extinde.',
        },
        {
          type: 'note',
          kind: 'stiai',
          text: 'Reflexul rotulian are un arc reflex monosinaptic: între neuronul senzitiv și neuronul motor există o singură sinapsă, în măduva spinării.',
        },
      ],
    },
    {
      id: 'tipuri-de-reflexe',
      heading: 'Reflexe necondiționate și condiționate',
      blocks: [
        {
          type: 'p',
          text: 'Reflexele necondiționate sunt înnăscute, comune tuturor indivizilor din aceeași specie și relativ constante toată viața. Centrii lor se află în măduva spinării și în trunchiul cerebral. Exemple: reflexul rotulian, retragerea mâinii de pe un obiect fierbinte, salivația când mâncarea ajunge în gură.',
        },
        {
          type: 'p',
          text: 'Reflexele condiționate se formează în timpul vieții, sunt individuale și se pot stinge dacă nu sunt întărite. Ele apar prin asocierea repetată a unui stimul neutru cu un stimul necondiționat și au nevoie de scoarța cerebrală. Fiziologul rus I. P. Pavlov le-a studiat la câini: după ce un sunet a precedat de mai multe ori hrana, sunetul singur a ajuns să declanșeze salivația.',
        },
        {
          type: 'p',
          text: 'Multe deprinderi, de la scris la mersul pe bicicletă, se bazează pe reflexe condiționate formate prin exercițiu.',
        },
      ],
    },
  ],
  quiz: [
    {
      type: 'grila',
      prompt: 'Componenta arcului reflex care transformă stimulul în impuls nervos este:',
      options: ['receptorul', 'calea aferentă', 'centrul nervos', 'efectorul'],
      answer: 0,
      explanation:
        'Receptorul primește stimulul și îl transformă în impuls nervos. Calea aferentă doar conduce impulsul spre centru.',
    },
    {
      type: 'grila',
      prompt: 'Teaca de mielină:',
      options: [
        'învelește dendritele tuturor neuronilor',
        'permite conducerea saltatorie a impulsului nervos',
        'se găsește în fanta sinaptică',
        'conține neurotransmițătorul',
      ],
      answer: 1,
      explanation:
        'Teaca de mielină izolează axonul, iar impulsul sare de la o strangulație Ranvier la alta. Aceasta este conducerea saltatorie.',
    },
    {
      type: 'af',
      statement: 'Axonul conduce impulsul nervos spre corpul celular.',
      isTrue: false,
      fixes: [
        'Axonul conduce impulsul nervos de la corpul celular spre butonii terminali.',
        'Axonul conduce impulsul nervos numai în fibrele amielinice.',
        'Axonul conduce impulsul nervos spre dendritele aceluiași neuron.',
      ],
      correctFix: 0,
      explanation:
        'Spre corpul celular conduc dendritele. Axonul conduce impulsul în sens celulifug, spre butonii terminali.',
    },
    {
      type: 'af',
      statement:
        'Reflexele condiționate se formează în timpul vieții și au nevoie de participarea scoarței cerebrale.',
      isTrue: true,
      explanation:
        'Reflexele condiționate sunt dobândite, individuale și se formează cu participarea scoarței cerebrale.',
    },
    {
      type: 'completare',
      sentence: 'Spațiul îngust dintre membrana presinaptică și membrana postsinaptică se numește ___.',
      options: ['fantă sinaptică', 'strangulație Ranvier', 'con de emergență', 'buton terminal'],
      answer: 0,
      explanation: 'Neurotransmițătorul difuzează prin fanta sinaptică până la receptorii membranei postsinaptice.',
    },
  ],
  reviewed: false,
};

export default topic;
