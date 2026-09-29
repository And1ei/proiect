/** @type {import('../schema.js').Topic} */
const topic = {
  slug: 'ventilatia-pulmonara',
  unit: 1,
  order: 3,
  fig: { number: 3, label: 'Respirator' },
  title: 'Ventilația pulmonară',
  summary:
    'Pe unde intră aerul, de ce plămânii urmează mișcările cutiei toracice și cum ajunge oxigenul în sânge.',
  grade: 'a XI-a',
  readMinutes: 5,
  objectives: [
    'Numești componentele căilor respiratorii și rolul fiecăreia.',
    'Explici mecanismul inspirației și al expirației pe baza diferențelor de presiune.',
    'Calculezi capacitatea vitală din volumele respiratorii.',
  ],
  glossaryIds: [
    'pleura',
    'diafragma',
    'alveola',
    'inspiratie',
    'expiratie',
    'volum-curent',
    'capacitate-vitala',
  ],
  interactive: { type: 'ventilation', config: {} },
  sections: [
    {
      id: 'caile-respiratorii',
      heading: 'Căile respiratorii',
      blocks: [
        {
          type: 'p',
          text: 'Aerul ajunge la plămâni printr-un sistem de conducte: cavitatea nazală, faringele, laringele, traheea și bronhiile. Pe acest drum, aerul este încălzit, umezit și curățat de particule.',
        },
        {
          type: 'list',
          items: [
            'Cavitatea nazală: mucoasa bogat vascularizată încălzește și umezește aerul, iar perii și mucusul rețin particulele.',
            'Faringele: cale comună pentru aer și pentru alimente.',
            'Laringele: conduce aerul și conține corzile vocale, cu rol în producerea sunetelor.',
            'Traheea: tub susținut de inele cartilaginoase incomplete, care îl mențin deschis.',
            'Bronhiile: traheea se împarte în două bronhii principale, care se ramifică în plămâni în bronhii tot mai mici și apoi în bronhiole.',
          ],
        },
      ],
    },
    {
      id: 'plamanii',
      heading: 'Plămânii și pleura',
      blocks: [
        {
          type: 'p',
          text: 'Plămânii sunt organele în care are loc schimbul de gaze. Plămânul drept are trei lobi, iar cel stâng doi. Bronhiolele se termină cu săculeți plini cu aer, [[alveola|alveolele pulmonare]], înconjurați de o rețea densă de capilare.',
        },
        {
          type: 'p',
          text: 'Fiecare plămân este învelit de [[pleura|pleură]], o membrană cu două foițe. Foița viscerală aderă la plămân, iar foița parietală căptușește peretele cutiei toracice. Între ele se află cavitatea pleurală, un spațiu foarte îngust, cu puțin lichid pleural.',
        },
        {
          type: 'p',
          text: 'Presiunea din cavitatea pleurală este mai mică decât presiunea atmosferică. Din acest motiv, plămânii rămân lipiți de peretele toracic și urmează toate mișcările lui.',
        },
        {
          type: 'note',
          kind: 'retine',
          text: 'Plămânii nu au mușchi proprii. Ei se destind și se retractă pentru că urmează, prin pleură, mișcările cutiei toracice.',
        },
      ],
    },
    {
      id: 'inspiratia-si-expiratia',
      heading: 'Inspirația și expirația',
      blocks: [
        {
          type: 'p',
          text: 'Aerul se deplasează mereu din zona cu presiune mai mare spre zona cu presiune mai mică. Ventilația pulmonară schimbă volumul cutiei toracice și, odată cu el, presiunea din plămâni.',
        },
        {
          type: 'p',
          text: '[[inspiratie|Inspirația]] este un proces activ. [[diafragma|Diafragma]] se contractă și coboară, iar mușchii intercostali externi ridică coastele. Cutia toracică își mărește volumul, plămânii se destind odată cu ea, iar presiunea din interiorul lor scade sub presiunea atmosferică. Aerul intră.',
        },
        {
          type: 'note',
          kind: 'retine',
          text: 'Inspirația este activă, expirația de repaus este pasivă. Aerul intră doar când presiunea din plămâni scade sub presiunea atmosferică.',
        },
        {
          type: 'p',
          text: '[[expiratie|Expirația]] de repaus este un proces pasiv. Mușchii inspiratori se relaxează, iar cutia toracică și plămânii revin la volumul inițial datorită elasticității lor. Presiunea din plămâni devine mai mare decât presiunea atmosferică și aerul iese. În expirația forțată intervin și mușchi expiratori, de exemplu mușchii intercostali interni și mușchii abdominali.',
        },
        { type: 'interactive' },
      ],
    },
    {
      id: 'schimbul-de-gaze',
      heading: 'Schimbul de gaze în alveole',
      blocks: [
        {
          type: 'p',
          text: 'Între aerul din alveole și sângele din capilare, gazele trec prin difuziune, printr-o barieră foarte subțire formată din peretele alveolei și peretele capilarului. Fiecare gaz trece din locul unde presiunea lui parțială este mai mare spre locul unde este mai mică.',
        },
        {
          type: 'p',
          text: 'Presiunea parțială a oxigenului este de aproximativ 100 mmHg în aerul alveolar și de aproximativ 40 mmHg în sângele venos care ajunge la plămâni, așa că oxigenul trece în sânge. Pentru dioxidul de carbon, valorile sunt de aproximativ 46 mmHg în sângele venos și 40 mmHg în aerul alveolar, așa că dioxidul de carbon trece în alveole și este eliminat prin expirație.',
        },
        {
          type: 'p',
          text: 'Suprafața foarte mare a alveolelor și grosimea mică a barierei fac schimbul rapid și eficient.',
        },
      ],
    },
    {
      id: 'volume-respiratorii',
      heading: 'Volumele respiratorii',
      blocks: [
        {
          type: 'p',
          text: 'Cantitatea de aer mobilizată la fiecare respirație se măsoară cu spirometrul. Valorile de mai jos sunt medii pentru un adult și variază cu vârsta, sexul, înălțimea și antrenamentul fizic.',
        },
        {
          type: 'list',
          items: [
            '[[volum-curent|Volumul curent]] (VT): aerul inspirat și expirat într-o respirație de repaus, aproximativ 500 ml.',
            'Volumul inspirator de rezervă (VIR): aerul care mai poate fi inspirat forțat după o inspirație de repaus, aproximativ 3.000 ml.',
            'Volumul expirator de rezervă (VER): aerul care mai poate fi expirat forțat după o expirație de repaus, aproximativ 1.000-1.100 ml.',
            'Volumul rezidual (VR): aerul care rămâne în plămâni după o expirație forțată, aproximativ 1.200 ml.',
          ],
        },
        {
          type: 'p',
          text: '[[capacitate-vitala|Capacitatea vitală]] (CV) este suma VT + VIR + VER: aproximativ 4.500-5.000 ml, cu variații după sex, vârstă și înălțime. Dacă adaugi volumul rezidual, obții capacitatea pulmonară totală, aproximativ 5.700-6.200 ml.',
        },
        {
          type: 'note',
          kind: 'stiai',
          text: 'Nici cea mai puternică expirație nu golește complet plămânii: volumul rezidual rămâne mereu în alveole și în căile respiratorii.',
        },
      ],
    },
  ],
  quiz: [
    {
      type: 'grila',
      prompt: 'În timpul inspirației de repaus:',
      options: [
        'diafragma se relaxează și urcă',
        'presiunea din plămâni devine mai mică decât presiunea atmosferică',
        'se contractă mușchii intercostali interni',
        'volumul cutiei toracice scade',
      ],
      answer: 1,
      explanation:
        'Contracția diafragmei și a mușchilor intercostali externi mărește volumul toracic, iar presiunea din plămâni scade sub cea atmosferică.',
    },
    {
      type: 'grila',
      prompt: 'Capacitatea vitală este suma dintre:',
      options: ['VT, VIR și VER', 'VT și VR', 'VIR, VER și VR', 'VT, VIR, VER și VR'],
      answer: 0,
      explanation:
        'CV = VT + VIR + VER, aproximativ 4.500-5.000 ml. Dacă adaugi și volumul rezidual obții capacitatea pulmonară totală.',
    },
    {
      type: 'af',
      statement: 'Volumul rezidual poate fi eliminat printr-o expirație forțată.',
      isTrue: false,
      fixes: [
        'Volumul rezidual rămâne în plămâni și după o expirație forțată.',
        'Volumul rezidual poate fi eliminat printr-o inspirație forțată.',
        'Volumul rezidual este aerul mobilizat într-o respirație de repaus.',
      ],
      correctFix: 0,
      explanation:
        'Volumul rezidual nu poate fi eliminat voluntar. Aerul mobilizat într-o respirație de repaus este volumul curent.',
    },
    {
      type: 'af',
      statement:
        'Schimbul de gaze la nivelul alveolelor se face prin difuziune, pe baza diferențelor de presiune parțială.',
      isTrue: true,
      explanation:
        'Oxigenul și dioxidul de carbon difuzează fiecare din zona cu presiune parțială mai mare spre zona cu presiune parțială mai mică.',
    },
    {
      type: 'completare',
      sentence: 'Foița pleurei care aderă la plămân se numește pleura ___.',
      options: ['viscerală', 'parietală', 'diafragmatică', 'alveolară'],
      answer: 0,
      explanation: 'Pleura viscerală aderă la plămân, iar pleura parietală căptușește peretele cutiei toracice.',
    },
  ],
  reviewed: true,
};

export default topic;
