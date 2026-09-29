/** @type {import('../schema.js').Topic} */
const topic = {
  slug: 'inima-circulatia',
  unit: 1,
  order: 2,
  fig: { number: 2, label: 'Circulator' },
  title: 'Inima și circulația sângelui',
  summary:
    'Cum pompează inima sângele prin două circuite și de ce valvele, arterele, venele și capilarele sunt construite așa cum sunt.',
  grade: 'a XI-a',
  readMinutes: 5,
  objectives: [
    'Descrii cavitățile inimii și rolul valvelor.',
    'Urmărești drumul sângelui prin circulația mică și prin circulația mare.',
    'Explici etapele revoluției cardiace și deosebirile dintre artere, vene și capilare.',
  ],
  glossaryIds: [
    'atriu',
    'ventricul',
    'valva',
    'valvula',
    'circulatia-mica',
    'circulatia-mare',
    'revolutia-cardiaca',
    'capilar',
  ],
  interactive: { type: 'heart', config: {} },
  sections: [
    {
      id: 'inima',
      heading: 'Inima, o pompă cu patru cavități',
      blocks: [
        {
          type: 'p',
          text: 'Inima este un organ muscular cavitar, așezat în cutia toracică, între cei doi plămâni, cu vârful orientat în jos, înainte și spre stânga. Prin contracții ritmice, ea pune sângele în mișcare prin vasele de sânge.',
        },
        {
          type: 'p',
          text: 'Inima are patru cavități: două [[atriu|atrii]], în partea de sus, și două [[ventricul|ventricule]], în partea de jos. Atriile primesc sângele adus de vene, iar ventriculele îl împing în artere. Un perete despărțitor, septul, împarte inima într-o jumătate dreaptă și una stângă, care nu comunică între ele.',
        },
        {
          type: 'p',
          text: 'Jumătatea dreaptă conține sânge neoxigenat, bogat în dioxid de carbon, iar jumătatea stângă conține sânge oxigenat. Peretele ventriculului stâng este cel mai gros, pentru că el pompează sângele în tot corpul.',
        },
      ],
    },
    {
      id: 'valvele',
      heading: 'Valvele: sângele merge într-un singur sens',
      blocks: [
        {
          type: 'p',
          text: 'Inima are patru [[valva|valve]]. Între atrii și ventricule se află valvele atrioventriculare: valva tricuspidă, în dreapta, și valva mitrală (bicuspidă), în stânga. La ieșirea din ventricule se află valvele semilunare (sigmoide): valva pulmonară, spre trunchiul pulmonar, și valva aortică, spre aortă.',
        },
        {
          type: 'p',
          text: 'Fiecare valvă este alcătuită din pliuri subțiri numite [[valvula|valvule]]. Valva mitrală are două valvule, valva tricuspidă are trei, iar fiecare valvă semilunară are tot trei. Valva este structura întreagă; valvula este doar una dintre piesele ei.',
        },
        {
          type: 'p',
          text: 'Valvele se deschid și se închid pasiv, în funcție de diferența de presiune de pe cele două fețe ale lor. Când ventriculul se contractă, presiunea din el crește, valva atrioventriculară se închide, iar valva semilunară se deschide. Astfel sângele nu se poate întoarce în atriu.',
        },
        {
          type: 'note',
          kind: 'retine',
          text: 'Valvele atrioventriculare împiedică întoarcerea sângelui din ventricule în atrii. Valvele semilunare împiedică întoarcerea sângelui din artere în ventricule.',
        },
      ],
    },
    {
      id: 'circulatia',
      heading: 'Circulația mică și circulația mare',
      blocks: [
        {
          type: 'p',
          text: 'Sângele parcurge două circuite legate unul după altul. [[circulatia-mica|Circulația mică]] (pulmonară) duce sângele la plămâni pentru schimbul de gaze. [[circulatia-mare|Circulația mare]] (sistemică) duce sângele oxigenat la toate țesuturile și îl aduce înapoi la inimă.',
        },
        {
          type: 'list',
          items: [
            'Circulația mică: ventriculul drept → trunchiul pulmonar → arterele pulmonare → capilarele pulmonare → venele pulmonare → atriul stâng.',
            'Circulația mare: ventriculul stâng → aorta → artere → capilarele din țesuturi → vene → venele cave → atriul drept.',
          ],
        },
        {
          type: 'p',
          text: 'În capilarele pulmonare, sângele cedează dioxid de carbon și primește oxigen. În capilarele din țesuturi se petrece invers: celulele primesc oxigen și substanțe nutritive și cedează dioxid de carbon.',
        },
        {
          type: 'note',
          kind: 'retine',
          text: 'Arterele duc sângele de la inimă, iar venele îl aduc la inimă, indiferent dacă sângele este oxigenat sau nu. De aceea arterele pulmonare transportă sânge neoxigenat, iar venele pulmonare, sânge oxigenat.',
        },
      ],
    },
    {
      id: 'revolutia-cardiaca',
      heading: 'Revoluția cardiacă',
      blocks: [
        {
          type: 'p',
          text: 'Inima lucrează în cicluri care se repetă. O [[revolutia-cardiaca|revoluție cardiacă]] cuprinde o contracție, numită sistolă, și o relaxare, numită diastolă, atât pentru atrii, cât și pentru ventricule.',
        },
        {
          type: 'p',
          text: 'La o frecvență de 75 de bătăi pe minut, o revoluție cardiacă durează 0,8 s și are trei etape:',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            'Sistola atrială (0,1 s): atriile se contractă și împing sângele în ventricule.',
            'Sistola ventriculară (0,3 s): ventriculele se contractă, valvele atrioventriculare se închid, iar sângele este împins în artere.',
            'Diastola generală (0,4 s): atriile și ventriculele sunt relaxate, iar inima se umple cu sângele venit prin vene.',
          ],
        },
        { type: 'interactive' },
        {
          type: 'p',
          text: 'Închiderea valvelor produce zgomotele inimii. Primul zgomot apare la începutul sistolei ventriculare, când se închid valvele atrioventriculare. Al doilea apare la începutul diastolei, când se închid valvele semilunare.',
        },
        {
          type: 'note',
          kind: 'stiai',
          text: 'Inima are automatism: se contractă ritmic și fără comenzi de la sistemul nervos, pentru că impulsurile sunt generate chiar în inimă, de nodulul sinoatrial.',
        },
      ],
    },
    {
      id: 'vasele',
      heading: 'Artere, vene și capilare',
      blocks: [
        {
          type: 'p',
          text: 'Arterele au pereți groși și elastici, care rezistă presiunii mari a sângelui împins de ventricule. Datorită elasticității lor, ejecția intermitentă a sângelui devine o curgere continuă.',
        },
        {
          type: 'p',
          text: 'Venele au pereți mai subțiri, iar presiunea sângelui din ele este mică. Multe vene, mai ales cele de la membrele inferioare, au valve care împiedică întoarcerea sângelui. Contracția mușchilor din jur ajută sângele să urce spre inimă.',
        },
        {
          type: 'p',
          text: '[[capilar|Capilarele]] sunt cele mai subțiri vase. Peretele lor este format dintr-un singur strat de celule, iar sângele curge prin ele încet. Ambele caracteristici favorizează schimburile de substanțe dintre sânge și țesuturi.',
        },
      ],
    },
  ],
  quiz: [
    {
      type: 'grila',
      prompt: 'Sângele oxigenat ajunge în atriul stâng prin:',
      options: ['venele cave', 'venele pulmonare', 'aortă', 'trunchiul pulmonar'],
      answer: 1,
      explanation:
        'Venele pulmonare aduc sângele oxigenat de la plămâni în atriul stâng. Venele cave aduc sânge neoxigenat în atriul drept.',
    },
    {
      type: 'grila',
      prompt: 'Valva mitrală (bicuspidă) se află între:',
      options: [
        'atriul drept și ventriculul drept',
        'ventriculul stâng și aortă',
        'atriul stâng și ventriculul stâng',
        'ventriculul drept și trunchiul pulmonar',
      ],
      answer: 2,
      explanation:
        'Valva mitrală este valva atrioventriculară stângă și are două valvule. În dreapta, între atriu și ventricul, se află valva tricuspidă, cu trei valvule.',
    },
    {
      type: 'af',
      statement: 'Arterele pulmonare transportă sânge oxigenat spre plămâni.',
      isTrue: false,
      fixes: [
        'Arterele pulmonare transportă sânge neoxigenat de la ventriculul drept spre plămâni.',
        'Arterele pulmonare transportă sânge oxigenat de la plămâni spre atriul stâng.',
        'Arterele pulmonare transportă sânge neoxigenat spre atriul drept.',
      ],
      correctFix: 0,
      explanation:
        'Arterele pleacă de la inimă. Arterele pulmonare pornesc din ventriculul drept și duc sânge neoxigenat la plămâni.',
    },
    {
      type: 'af',
      statement:
        'Peretele capilarelor este format dintr-un singur strat de celule, ceea ce favorizează schimburile dintre sânge și țesuturi.',
      isTrue: true,
      explanation:
        'Peretele foarte subțire al capilarelor lasă substanțele să treacă ușor între sânge și țesuturi.',
    },
    {
      type: 'completare',
      sentence: 'La o frecvență de 75 de bătăi pe minut, o revoluție cardiacă durează ___ secunde.',
      options: ['0,8', '0,3', '0,1', '1,2'],
      answer: 0,
      explanation: 'Revoluția cardiacă durează 0,8 s: 0,1 s sistola atrială, 0,3 s sistola ventriculară și 0,4 s diastola generală.',
    },
  ],
  reviewed: true,
};

export default topic;
