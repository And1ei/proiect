// Global glossary. Each id is owned by exactly one lesson (topic.glossaryIds) but may be
// referenced from any lesson with [[id]]. Order here does not matter; pages sort by term.

/** @type {import('./schema.js').GlossaryTerm[]} */
const glossary = [
  // 01 Neuronul și arcul reflex
  {
    id: 'neuron',
    term: 'neuron',
    definition:
      'Celula nervoasă, unitatea structurală și funcțională a sistemului nervos, specializată în generarea și conducerea impulsurilor nervoase.',
  },
  {
    id: 'dendrita',
    term: 'dendrită',
    definition: 'Prelungire a neuronului, de obicei scurtă și ramificată, care conduce impulsul nervos spre corpul celular.',
  },
  {
    id: 'axon',
    term: 'axon',
    definition: 'Prelungire unică a neuronului, care conduce impulsul nervos de la corpul celular spre butonii terminali.',
  },
  {
    id: 'teaca-de-mielina',
    term: 'teacă de mielină',
    definition:
      'Înveliș izolator al unor axoane, întrerupt de strangulațiile Ranvier. Permite conducerea saltatorie, mai rapidă, a impulsului.',
  },
  {
    id: 'potential-de-actiune',
    term: 'potențial de acțiune',
    definition:
      'Inversarea rapidă și trecătoare a polarității membranei neuronului, prin depolarizare urmată de repolarizare. Stă la baza impulsului nervos.',
  },
  {
    id: 'sinapsa',
    term: 'sinapsă',
    definition: 'Zona de contact funcțional dintre un neuron și altă celulă, prin care se transmite impulsul nervos.',
  },
  {
    id: 'neurotransmitator',
    term: 'neurotransmițător',
    definition:
      'Substanță chimică eliberată din butonii terminali în fanta sinaptică, care transmite informația celulei postsinaptice. Exemplu: acetilcolina.',
  },
  {
    id: 'arc-reflex',
    term: 'arc reflex',
    definition:
      'Traseul parcurs de impuls în timpul unui reflex: receptor, cale aferentă, centru nervos, cale eferentă și efector.',
  },

  // 02 Inima și circulația sângelui
  {
    id: 'atriu',
    term: 'atriu',
    definition: 'Cavitate a inimii, în partea superioară, care primește sângele adus de vene. Inima are două atrii.',
  },
  {
    id: 'ventricul',
    term: 'ventricul',
    definition: 'Cavitate a inimii, în partea inferioară, care împinge sângele în artere. Inima are două ventricule.',
  },
  {
    id: 'valva',
    term: 'valvă',
    definition:
      'Structura întreagă care închide un orificiu al inimii și lasă sângele să treacă într-un singur sens. Inima are patru valve: tricuspidă și mitrală (atrioventriculare), pulmonară și aortică (semilunare). Fiecare valvă este alcătuită din mai multe valvule.',
    seeAlso: ['valvula'],
  },
  {
    id: 'valvula',
    term: 'valvulă',
    definition:
      'Un singur pliu subțire dintr-o valvă, nu valva întreagă. Valva mitrală are două valvule, valva tricuspidă trei, iar fiecare valvă semilunară trei.',
    seeAlso: ['valva'],
  },
  {
    id: 'circulatia-mica',
    term: 'circulația mică',
    definition:
      'Circuitul sângelui de la ventriculul drept la plămâni și înapoi la atriul stâng. Aici sângele se oxigenează.',
  },
  {
    id: 'circulatia-mare',
    term: 'circulația mare',
    definition:
      'Circuitul sângelui de la ventriculul stâng, prin aortă, la toate țesuturile și înapoi, prin venele cave, la atriul drept.',
  },
  {
    id: 'revolutia-cardiaca',
    term: 'revoluție cardiacă',
    definition: 'O sistolă urmată de o diastolă a inimii. La 75 de bătăi pe minut durează 0,8 s.',
  },
  {
    id: 'capilar',
    term: 'capilar',
    definition:
      'Vas de sânge foarte subțire, cu peretele format dintr-un singur strat de celule, la nivelul căruia au loc schimburile dintre sânge și țesuturi.',
  },

  // 03 Ventilația pulmonară
  {
    id: 'pleura',
    term: 'pleură',
    definition:
      'Membrană cu două foițe care învelește plămânul: foița viscerală aderă la plămân, foița parietală căptușește cutia toracică. Între ele se află cavitatea pleurală.',
  },
  {
    id: 'diafragma',
    term: 'diafragmă',
    definition: 'Mușchi lat care separă cavitatea toracică de cavitatea abdominală. Este principalul mușchi inspirator.',
  },
  {
    id: 'alveola',
    term: 'alveolă pulmonară',
    definition:
      'Săculeț cu pereți foarte subțiri, la capătul bronhiolelor, la nivelul căruia are loc schimbul de gaze cu sângele din capilare.',
  },
  {
    id: 'inspiratie',
    term: 'inspirație',
    definition: 'Faza ventilației în care aerul intră în plămâni. Este un proces activ, produs de contracția mușchilor inspiratori.',
  },
  {
    id: 'expiratie',
    term: 'expirație',
    definition: 'Faza ventilației în care aerul iese din plămâni. În repaus este un proces pasiv.',
  },
  {
    id: 'volum-curent',
    term: 'volum curent',
    definition: 'Volumul de aer inspirat și expirat într-o respirație de repaus (VT), aproximativ 500 ml la adult.',
  },
  {
    id: 'capacitate-vitala',
    term: 'capacitate vitală',
    definition:
      'Volumul maxim de aer care poate fi expirat după o inspirație maximă: VT + VIR + VER, aproximativ 4.500-5.000 ml, cu variații după sex, vârstă și înălțime.',
  },

  // 04 De la ADN la proteină
  {
    id: 'nucleotid',
    term: 'nucleotid',
    definition: 'Unitatea de bază a acizilor nucleici, formată dintr-o grupare fosfat, o pentoză și o bază azotată.',
  },
  {
    id: 'complementaritate',
    term: 'complementaritate',
    definition: 'Regula după care se împerechează bazele azotate: A cu T (în ARN, A cu U) și G cu C.',
  },
  {
    id: 'replicare',
    term: 'replicare',
    definition:
      'Procesul prin care o moleculă de ADN se copiază și rezultă două molecule identice. Este semiconservativă.',
  },
  {
    id: 'transcriptie',
    term: 'transcripție',
    definition: 'Sinteza unei molecule de ARN după modelul unei catene de ADN, cu ajutorul ARN-polimerazei.',
  },
  {
    id: 'codon',
    term: 'codon',
    definition: 'Triplet de nucleotide din ARNm care codifică un aminoacid sau un semnal de oprire.',
  },
  {
    id: 'anticodon',
    term: 'anticodon',
    definition: 'Triplet de nucleotide din ARNt, complementar cu un codon din ARNm.',
  },
  {
    id: 'translatie',
    term: 'translație',
    definition:
      'Etapa sintezei proteinelor în care, pe ribozomi, secvența de codoni din ARNm este tradusă într-o secvență de aminoacizi. Se mai numește traducere.',
  },
  {
    id: 'mutatie',
    term: 'mutație',
    definition: 'Modificare a materialului genetic, de exemplu a secvenței de nucleotide dintr-o genă.',
  },

  // 05 Legile lui Mendel
  {
    id: 'gena',
    term: 'genă',
    definition: 'Segment de ADN care conține informația ereditară pentru un anumit caracter. Ocupă un locus pe cromozom.',
  },
  {
    id: 'alela',
    term: 'alelă',
    definition: 'Una dintre formele alternative ale aceleiași gene, aflate în același locus pe cromozomii omologi.',
  },
  {
    id: 'homozigot',
    term: 'homozigot',
    definition: 'Individ care are două alele identice pentru o genă, de exemplu AA sau aa.',
  },
  {
    id: 'heterozigot',
    term: 'heterozigot',
    definition: 'Individ care are două alele diferite pentru o genă, de exemplu Aa.',
  },
  {
    id: 'genotip',
    term: 'genotip',
    definition: 'Totalitatea genelor unui individ. Pentru o singură genă, combinația de alele, de exemplu Aa.',
  },
  {
    id: 'fenotip',
    term: 'fenotip',
    definition:
      'Totalitatea caracterelor observabile ale unui individ, rezultate din interacțiunea dintre genotip și mediu.',
  },
  {
    id: 'alela-dominanta',
    term: 'alelă dominantă',
    definition: 'Alelă care se manifestă în fenotip și în stare heterozigotă. Se notează cu literă mare.',
  },
  {
    id: 'monohibridare',
    term: 'monohibridare',
    definition: 'Încrucișare între doi părinți care diferă printr-o singură pereche de caractere.',
  },
];

export default glossary;

export const glossaryById = Object.fromEntries(glossary.map((g) => [g.id, g]));
