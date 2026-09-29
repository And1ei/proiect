// Ventilation lab. Volumes are the corrected lesson values (ml); every level in the model is derived
// from them: after a resting expiration the lungs hold VR + VER, after a resting inspiration + VT,
// after a maximal inspiration + VIR.

const ventilation = {
  title: 'Mecanica ventilației',
  intro:
    'Respiră cu modelul: „Inspiră” și „Expiră” merg până la capătul unei respirații de repaus, iar apăsate încă o dată forțează respirația. Graficul desenează volumul din plămâni.',
  volumes: { VR: 1200, VER: 1000, VT: 500, VIR: 3000 },
  cyclesNeeded: 2,

  bands: {
    VT: { name: 'Volumul curent', short: 'VT', note: 'aproximativ 500 ml' },
    VIR: { name: 'Volumul inspirator de rezervă', short: 'VIR', note: 'aproximativ 3.000 ml' },
    VER: { name: 'Volumul expirator de rezervă', short: 'VER', note: 'aproximativ 1.000-1.100 ml' },
    CV: { name: 'Capacitatea vitală', short: 'CV', note: 'VT + VIR + VER, aproximativ 4.500-5.000 ml' },
    VR: { name: 'Volumul rezidual', short: 'VR', note: 'rămâne mereu în plămâni' },
  },
  matchOrder: ['VT', 'VIR', 'VER', 'CV'],

  pleura: {
    tag: 'Punct de Bacalaureat',
    heading: 'De ce urmează plămânii mișcările cutiei toracice',
    body: [
      'Plămânii nu au mușchi proprii. Îi mișcă pleura: foița viscerală aderă la plămân, foița parietală căptușește cutia toracică, iar între ele, în cavitatea pleurală, presiunea este mai mică decât cea atmosferică.',
      'Când diafragma coboară și coastele se ridică, foița parietală se depărtează, iar plămânii, lipiți de ea prin cavitatea pleurală, se destind odată cu cutia toracică. Presiunea din alveole scade și aerul intră.',
    ],
    question: {
      prompt: 'De ce se destind plămânii când diafragma se contractă și coboară?',
      options: [
        'Pentru că foițele pleurale rămân lipite, iar presiunea din cavitatea pleurală, mai mică decât cea atmosferică, face plămânii să urmeze peretele toracic.',
        'Pentru că plămânii au mușchi proprii care se contractă odată cu diafragma.',
        'Pentru că aerul care intră pe trahee împinge plămânii din interior înainte ca volumul toracic să crească.',
        'Pentru că lichidul pleural se evaporă și lasă loc aerului.',
      ],
      answer: 0,
    },
  },

  text: {
    inspire: 'Inspiră',
    expire: 'Expiră',
    slider: 'Volumul de aer din plămâni',
    valueText: '{ml} ml în plămâni',
    airIn: 'aerul intră',
    airOut: 'aerul iese',
    cycles: 'Respirații complete: {n} din {needed}',
    graphTitle: 'Volumul de aer din plămâni în timp',
    graphDesc: 'Grafic volum-timp. Benzile orizontale separă volumul rezidual, volumul expirator de rezervă, volumul curent și volumul inspirator de rezervă.',
    matchIntro: 'Acum arată pe grafic fiecare volum.',
    matchPrompt: 'Unde este {name} ({short})?',
    bandLabel: 'Banda dintre {from} și {to} ml',
    bracketLabel: 'Acolada care cuprinde benzile de la {from} la {to} ml',
    matchDone: 'Toate volumele sunt la locul lor.',
    figureTitle: 'Cutia toracică, plămânii și diafragma',
    figureDesc: 'Schemă în care diafragma coboară și coastele se ridică la inspirație, iar plămânii, înveliți de pleură, se destind odată cu cutia toracică.',
    pleuraLabel: 'Pleură',
    diaphragmLabel: 'Diafragmă',
    hints: {
      cycles: 'O respirație completă înseamnă o inspirație urmată de o expirație care aduce volumul înapoi la nivelul de repaus.',
      VT: 'Volumul curent este banda îngustă prin care treci la fiecare respirație de repaus.',
      VIR: 'Volumul inspirator de rezervă este tot ce mai poți inspira după o inspirație obișnuită: banda cea mai mare, de sus.',
      VER: 'Volumul expirator de rezervă e sub nivelul de repaus: aerul pe care îl mai poți scoate forțat.',
      CV: 'Capacitatea vitală cuprinde trei benzi deodată: VT, VIR și VER.',
      pleura: 'Gândește-te ce leagă plămânul de peretele toracic, dacă plămânul nu are mușchi.',
    },
  },
};

export default ventilation;
