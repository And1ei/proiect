/** @type {import('../schema.js').Topic} */
const topic = {
  slug: 'adn-proteine',
  unit: 2,
  order: 4,
  fig: { number: 4, label: 'Molecular' },
  title: 'De la ADN la proteină',
  summary:
    'Cum este construit ADN-ul, cum se copiază și cum ajunge informația din el să stabilească ordinea aminoacizilor dintr-o proteină.',
  grade: 'a XII-a',
  readMinutes: 6,
  objectives: [
    'Descrii structura ADN și regula complementarității bazelor azotate.',
    'Explici cum se copiază ADN-ul și cum trece informația din ADN în ARN mesager.',
    'Folosești codul genetic ca să deduci secvența de aminoacizi dintr-o secvență de ARNm.',
  ],
  glossaryIds: [
    'nucleotid',
    'complementaritate',
    'replicare',
    'transcriptie',
    'codon',
    'anticodon',
    'translatie',
    'mutatie',
  ],
  interactive: { type: 'decoder', config: {} },
  sections: [
    {
      id: 'structura-adn',
      heading: 'Structura ADN',
      blocks: [
        {
          type: 'p',
          text: 'Acidul dezoxiribonucleic, ADN, păstrează informația genetică a celulei. Este un polimer format din unități numite [[nucleotid|nucleotide]].',
        },
        {
          type: 'p',
          text: 'Fiecare nucleotid are trei componente: o grupare fosfat, o pentoză numită dezoxiriboză și o bază azotată. În ADN există patru baze azotate: adenina (A), guanina (G), citozina (C) și timina (T). Adenina și guanina sunt baze purinice, iar citozina și timina, baze pirimidinice.',
        },
        {
          type: 'p',
          text: 'Molecula de ADN este formată din două catene răsucite una în jurul celeilalte, ca o scară în spirală. Acesta este modelul dublului helix, propus de Watson și Crick în 1953. Cele două catene sunt antiparalele și sunt legate prin punți de hidrogen între baze, după regula [[complementaritate|complementarității]]: adenina se leagă de timină prin două punți de hidrogen, iar guanina de citozină prin trei.',
        },
        {
          type: 'note',
          kind: 'retine',
          text: 'În ADN, A se leagă de T, iar G de C. În ARN, timina este înlocuită de uracil, deci A se leagă de U.',
        },
      ],
    },
    {
      id: 'replicarea',
      heading: 'Replicarea: copierea ADN',
      blocks: [
        {
          type: 'p',
          text: 'Înainte de diviziune, celula își dublează ADN-ul prin [[replicare]]. Punțile de hidrogen dintre catene se desfac, iar cele două catene se separă. Fiecare catenă devine matriță pentru o catenă nouă.',
        },
        {
          type: 'p',
          text: 'Enzima ADN-polimeraza adaugă nucleotide libere, complementare cu cele de pe catena matriță. Rezultă două molecule de ADN identice cu molecula inițială.',
        },
        {
          type: 'p',
          text: 'Replicarea este semiconservativă: fiecare moleculă nouă conține o catenă veche, din molecula inițială, și o catenă nou sintetizată. Datorită complementarității, informația se copiază foarte fidel.',
        },
      ],
    },
    {
      id: 'transcriptia',
      heading: 'Transcripția: de la ADN la ARN mesager',
      blocks: [
        {
          type: 'p',
          text: 'Proteinele se sintetizează în citoplasmă, pe ribozomi, dar ADN-ul celulelor eucariote rămâne în nucleu. Informația ajunge la ribozomi printr-o copie: acidul ribonucleic mesager, ARNm.',
        },
        {
          type: 'p',
          text: 'ARN-ul diferă de ADN prin trei caracteristici: are o singură catenă, conține riboză în loc de dezoxiriboză și conține uracil (U) în loc de timină.',
        },
        {
          type: 'p',
          text: 'În [[transcriptie|transcripție]], enzima ARN-polimeraza citește una dintre catenele unei [[gena|gene]], numită catenă matriță, și construiește o moleculă de ARNm complementară cu ea. În dreptul adeninei din ADN se pune uracil, în dreptul timinei se pune adenină, iar G și C se împerechează ca de obicei.',
        },
        {
          type: 'p',
          text: 'La eucariote, ARN-ul rezultat este prelucrat înainte să iasă din nucleu: secvențele necodificatoare, numite introni, sunt eliminate, iar secvențele rămase, numite exoni, sunt legate între ele.',
        },
      ],
    },
    {
      id: 'codul-genetic',
      heading: 'Codul genetic',
      blocks: [
        {
          type: 'p',
          text: 'Informația din ARNm se citește în grupe de câte trei nucleotide. Un astfel de triplet se numește [[codon]] și corespunde unui aminoacid sau unui semnal de oprire.',
        },
        {
          type: 'p',
          text: 'Cu patru nucleotide diferite se pot forma 4 × 4 × 4 = 64 de codoni. Dintre aceștia, 61 codifică aminoacizi, iar trei (UAA, UAG și UGA) sunt codoni stop. Codonul AUG codifică metionina și marchează începutul traducerii.',
        },
        {
          type: 'list',
          items: [
            'Este universal: aceiași codoni codifică aceiași aminoacizi la aproape toate organismele.',
            'Este degenerat: un aminoacid poate fi codificat de mai mulți codoni.',
            'Nu se suprapune: fiecare nucleotid aparține unui singur codon.',
            'Nu are separatori: codonii se citesc unul după altul, fără pauze.',
          ],
        },
        { type: 'interactive' },
      ],
    },
    {
      id: 'traducerea',
      heading: 'Traducerea: sinteza proteinei',
      blocks: [
        {
          type: 'p',
          text: 'Traducerea, numită și [[translatie|translație]], are loc pe ribozomi. Ribozomul se deplasează de-a lungul ARNm și citește codonii unul câte unul.',
        },
        {
          type: 'p',
          text: 'Aminoacizii sunt aduși de moleculele de ARN de transport (ARNt). Fiecare ARNt poartă un aminoacid și are un [[anticodon]], un triplet complementar cu un codon. Când anticodonul se potrivește cu codonul, aminoacidul este legat de lanțul în creștere printr-o legătură peptidică.',
        },
        {
          type: 'note',
          kind: 'retine',
          text: 'Codonul se află pe ARNm, anticodonul pe ARNt. Ordinea codonilor din ARNm stabilește ordinea aminoacizilor din proteină.',
        },
        {
          type: 'p',
          text: 'Sinteza începe la codonul AUG și continuă până la un codon stop. Atunci lanțul polipeptidic se desprinde de ribozom.',
        },
      ],
    },
    {
      id: 'mutatiile',
      heading: 'Legătura cu mutațiile',
      blocks: [
        {
          type: 'p',
          text: 'O [[mutatie|mutație]] este o modificare a materialului genetic. Dacă mutația schimbă un codon, proteina poate primi alt aminoacid sau sinteza se poate opri prea devreme.',
        },
        {
          type: 'p',
          text: 'În anemia falciformă, o singură substituție de nucleotid în gena unui lanț al hemoglobinei face ca acidul glutamic să fie înlocuit cu valina. Hemoglobina modificată deformează hematiile, care iau formă de seceră.',
        },
        {
          type: 'note',
          kind: 'stiai',
          text: 'Adăugarea sau pierderea unui singur nucleotid schimbă toți codonii care urmează, pentru că citirea se face în grupe de câte trei. De aceea aceste mutații au de obicei efecte mai mari decât o substituție.',
        },
      ],
    },
  ],
  quiz: [
    {
      type: 'grila',
      prompt: 'În molecula de ADN, guanina se împerechează cu:',
      options: ['adenina', 'timina', 'citozina', 'uracilul'],
      answer: 2,
      explanation: 'După regula complementarității, guanina se leagă de citozină prin trei punți de hidrogen.',
    },
    {
      type: 'grila',
      prompt: 'Transcripția reprezintă:',
      options: [
        'sinteza unei molecule de ARN după modelul unei catene de ADN',
        'dublarea moleculei de ADN',
        'legarea aminoacizilor pe ribozomi',
        'modificarea secvenței de nucleotide',
      ],
      answer: 0,
      explanation:
        'În transcripție, ARN-polimeraza construiește ARNm complementar cu catena matriță. Dublarea ADN este replicarea.',
    },
    {
      type: 'af',
      statement: 'Codonul se găsește pe molecula de ARN de transport.',
      isTrue: false,
      fixes: [
        'Codonul se găsește pe molecula de ARN mesager.',
        'Codonul se găsește pe catena nou sintetizată de ADN.',
        'Codonul se găsește pe molecula de aminoacid.',
      ],
      correctFix: 0,
      explanation: 'Codonul este pe ARNm. Pe ARNt se află anticodonul, complementar cu codonul.',
    },
    {
      type: 'af',
      statement:
        'Replicarea ADN este semiconservativă: fiecare moleculă nouă păstrează o catenă din molecula inițială.',
      isTrue: true,
      explanation: 'Fiecare catenă veche servește drept matriță, deci fiecare moleculă nouă are o catenă veche și una nouă.',
    },
    {
      type: 'completare',
      sentence: 'Dacă tripletul de pe catena matriță de ADN este TAC, codonul corespunzător din ARNm este ___.',
      options: ['AUG', 'ATG', 'UAC', 'TAC'],
      answer: 0,
      explanation: 'T se transcrie în A, A în U, iar C în G. Din TAC rezultă AUG, codonul de inițiere.',
    },
  ],
  reviewed: false,
};

export default topic;
