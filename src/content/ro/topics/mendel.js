/** @type {import('../schema.js').Topic} */
const topic = {
  slug: 'mendel',
  unit: 2,
  order: 5,
  fig: { number: 5, label: 'Ereditate' },
  title: 'Legile lui Mendel',
  summary:
    'Cum se transmit caracterele de la părinți la urmași, ce spun cele două legi ale lui Mendel și cum rezolvi pas cu pas o problemă de genetică.',
  grade: 'a XII-a',
  readMinutes: 6,
  objectives: [
    'Folosești corect noțiunile de genă, alelă, homozigot, heterozigot, genotip și fenotip.',
    'Explici legile lui Mendel pe baza monohibridării și a dihibridării.',
    'Rezolvi pas cu pas o problemă de genetică folosind pătratul lui Punnett.',
  ],
  glossaryIds: [
    'gena',
    'alela',
    'homozigot',
    'heterozigot',
    'genotip',
    'fenotip',
    'alela-dominanta',
    'monohibridare',
  ],
  interactive: { type: 'punnett', config: {} },
  sections: [
    {
      id: 'notiuni',
      heading: 'Genă, alelă, genotip, fenotip',
      blocks: [
        {
          type: 'p',
          text: 'O [[gena|genă]] este un segment de ADN care conține informația pentru un caracter, de exemplu culoarea boabelor la mazăre. Gena ocupă un loc fix pe cromozom, numit locus.',
        },
        {
          type: 'p',
          text: 'O genă poate exista în mai multe variante, numite [[alela|alele]]. Organismele diploide au cromozomii în perechi, deci fiecare individ are câte două alele pentru o genă: una moștenită de la mamă și una de la tată.',
        },
        {
          type: 'p',
          text: 'Dacă cele două alele sunt identice, individul este [[homozigot]] (AA sau aa). Dacă sunt diferite, individul este [[heterozigot]] (Aa).',
        },
        {
          type: 'p',
          text: 'Totalitatea genelor unui individ formează [[genotip|genotipul]]. Caracterele care se pot observa, cum ar fi culoarea sau forma, formează [[fenotip|fenotipul]]. Fenotipul rezultă din interacțiunea dintre genotip și mediu.',
        },
      ],
    },
    {
      id: 'dominanta',
      heading: 'Dominanța',
      blocks: [
        {
          type: 'p',
          text: 'În dominanța completă, o [[alela-dominanta|alelă dominantă]] se manifestă și atunci când este în pereche cu o alelă diferită. Alela recesivă se manifestă doar la homozigoți. Alela dominantă se notează cu literă mare (A), iar cea recesivă cu aceeași literă, mică (a).',
        },
        {
          type: 'p',
          text: 'La mazăre, culoarea galbenă a boabelor este dominantă față de culoarea verde. Genotipurile AA și Aa dau boabe galbene, iar doar genotipul aa dă boabe verzi. Două plante cu același fenotip pot avea deci genotipuri diferite.',
        },
        {
          type: 'note',
          kind: 'retine',
          text: 'Fenotipul dominant poate corespunde la două genotipuri (AA sau Aa). Fenotipul recesiv are un singur genotip posibil: aa.',
        },
      ],
    },
    {
      id: 'monohibridarea',
      heading: 'Monohibridarea și prima lege a lui Mendel',
      blocks: [
        {
          type: 'p',
          text: 'Gregor Mendel a lucrat cu mazăre, pornind de la linii pure, adică plante homozigote pentru caracterul studiat. [[monohibridare|Monohibridarea]] este încrucișarea dintre doi părinți care diferă printr-o singură pereche de caractere.',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            'Părinții (P): AA (boabe galbene) × aa (boabe verzi).',
            'Gameții: părintele AA formează doar gameți A, iar părintele aa doar gameți a.',
            'Prima generație (F1): toți descendenții sunt Aa, cu boabe galbene. Generația F1 este uniformă.',
            'A doua generație (F2), din Aa × Aa: genotipurile apar în raportul 1 AA : 2 Aa : 1 aa, iar fenotipurile în raportul 3 galbene : 1 verde.',
          ],
        },
        {
          type: 'note',
          kind: 'retine',
          text: 'Monohibridare, generația F2: raport genotipic 1 : 2 : 1, raport fenotipic 3 : 1 (în dominanța completă).',
        },
        { type: 'interactive' },
        {
          type: 'p',
          text: 'Explicația este legea purității gameților, prima lege a lui Mendel: cele două alele ale unei gene se separă la formarea gameților, iar fiecare gamet primește o singură alelă. La fecundare, gameții se combină întâmplător.',
        },
      ],
    },
    {
      id: 'dihibridarea',
      heading: 'Dihibridarea și a doua lege a lui Mendel',
      blocks: [
        {
          type: 'p',
          text: 'În dihibridare, părinții diferă prin două perechi de caractere, de exemplu culoarea boabelor (galben A, verde a) și forma lor (netedă B, zbârcită b).',
        },
        {
          type: 'p',
          text: 'Din încrucișarea P: AABB × aabb rezultă în F1 numai indivizi AaBb, cu boabe galbene și netede. Fiecare individ din F1 formează patru tipuri de gameți, în proporții egale: AB, Ab, aB și ab. În F2, cele 4 × 4 = 16 combinații de gameți dau 9 genotipuri și 4 fenotipuri, în raportul 9 : 3 : 3 : 1.',
        },
        {
          type: 'p',
          text: 'Rezultatul se explică prin a doua lege a lui Mendel, legea segregării independente a perechilor de caractere: alelele unei gene ajung în gameți independent de alelele celeilalte gene. Legea este valabilă pentru genele aflate pe perechi diferite de cromozomi.',
        },
        {
          type: 'note',
          kind: 'stiai',
          text: 'Mendel și-a publicat rezultatele în 1866, dar importanța lor a fost înțeleasă abia în 1900, când alți cercetători au ajuns independent la aceleași concluzii.',
        },
      ],
    },
    {
      id: 'rezolvarea-problemelor',
      heading: 'Cum rezolvi o problemă de genetică',
      blocks: [
        {
          type: 'p',
          text: 'Problemele de genetică de la Bacalaureat urmează aproape mereu aceiași pași. Dacă îi parcurgi în ordine, eviți cele mai multe greșeli.',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            'Stabilește care caracter este dominant și notează alelele: literă mare pentru alela dominantă, literă mică pentru cea recesivă.',
            'Scrie genotipurile părinților. Un părinte cu fenotip recesiv este sigur homozigot recesiv.',
            'Scrie gameții fiecărui părinte. Un homozigot formează un singur tip de gameți, iar un heterozigot pentru o genă formează două tipuri.',
            'Construiește pătratul lui Punnett: gameții unui părinte pe orizontală, gameții celuilalt pe verticală.',
            'Numără genotipurile și fenotipurile din pătrat și scrie raporturile sau probabilitățile cerute.',
            'Verifică: suma probabilităților trebuie să fie 1, adică 100 %.',
          ],
        },
        {
          type: 'p',
          text: 'Exemplu: o plantă cu boabe galbene, heterozigotă (Aa), este încrucișată cu o plantă cu boabe verzi (aa). Primul părinte formează gameți A și a, al doilea doar gameți a. Rezultă Aa și aa în proporții egale: 50 % plante cu boabe galbene și 50 % plante cu boabe verzi.',
        },
      ],
    },
  ],
  quiz: [
    {
      type: 'grila',
      prompt: 'Un organism cu genotipul Aa este:',
      options: ['homozigot dominant', 'heterozigot', 'homozigot recesiv', 'o linie pură'],
      answer: 1,
      explanation: 'Are două alele diferite pentru aceeași genă, deci este heterozigot.',
    },
    {
      type: 'grila',
      prompt: 'În generația F2 a unei dihibridări cu dominanță completă, raportul de segregare fenotipică este:',
      options: ['3 : 1', '1 : 2 : 1', '9 : 3 : 3 : 1', '1 : 1 : 1 : 1'],
      answer: 2,
      explanation: 'Cele 16 combinații de gameți din F2 dau patru fenotipuri, în raportul 9 : 3 : 3 : 1.',
    },
    {
      type: 'af',
      statement: 'În generația F2 a unei monohibridări cu dominanță completă, raportul fenotipic este 1 : 2 : 1.',
      isTrue: false,
      fixes: [
        'În generația F2 a unei monohibridări cu dominanță completă, raportul fenotipic este 3 : 1.',
        'În generația F1 a unei monohibridări cu dominanță completă, raportul fenotipic este 1 : 2 : 1.',
        'În generația F2 a unei dihibridări, raportul fenotipic este 1 : 2 : 1.',
      ],
      correctFix: 0,
      explanation: 'Raportul 1 : 2 : 1 este cel genotipic. Fenotipic, AA și Aa arată la fel, deci raportul devine 3 : 1.',
    },
    {
      type: 'af',
      statement: 'Un organism heterozigot pentru o genă formează două tipuri de gameți, în proporții egale.',
      isTrue: true,
      explanation: 'Alelele A și a se separă la formarea gameților, deci jumătate dintre gameți primesc A și jumătate primesc a.',
    },
    {
      type: 'completare',
      sentence: 'Din încrucișarea AaBb × AaBb rezultă ___ genotipuri diferite.',
      options: ['9', '16', '4', '3'],
      answer: 0,
      explanation: 'Pentru fiecare genă există trei genotipuri posibile (de exemplu AA, Aa, aa), iar 3 × 3 = 9.',
    },
  ],
  reviewed: false,
};

export default topic;
