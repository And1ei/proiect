// REVIEW: copy by Claude, needs native review
//
// Every interface string of "Echilibrul" (G3), both scenarios. Species facts and event mechanisms
// live in ../ecosystem-species.ts. Placeholders are filled with fill().

export const ECO = {
  padure: {
    title: 'Echilibrul: pădurea de stejar',
    tagline: 'Zece ani de pădure: ține în viață stejarul, omizile, șoarecii, vulpile și huhurezii.',
    instructions: [
      'Populațiile cresc și scad singure, după cât au de mâncare și câți prădători au.',
      'Evenimentele (secetă, omizi, braconaj) sunt anunțate cu câteva secunde înainte.',
      'Folosește uneltele la timp: Protejează o specie, Regenerează habitatul sau Reintrodu o specie dispărută.',
      'Primești puncte pentru fiecare an în care toate speciile sunt în zona sigură.',
    ],
  },
  balta: {
    title: 'Echilibrul: balta din Deltă',
    level: 'Avansat · curriculum de specialitate',
    tagline: 'O rețea trofică pe patru niveluri, înflorirea apelor și inventarul biocenozei.',
    instructions: [
      'Populațiile cresc și scad singure, după hrană și prădători, pe patru niveluri trofice.',
      'Îngrășămintele pot declanșa înflorirea apelor: dacă algele rămân prea multe, peștii rămân fără oxigen.',
      'Folosește uneltele la timp: Protejează, Regenerează habitatul sau Reintrodu o specie dispărută.',
      'La sfârșitul anilor 5 și 10 faci inventarul: calculezi dominanța fiecărei specii.',
    ],
  },
  controls: {
    touch: 'Atinge o unealtă, apoi o specie. Atinge o specie ca să vezi ce mănâncă și cine o mănâncă.',
    mouse: 'Clic pe o unealtă, apoi pe o specie. Clic pe o specie pentru detalii.',
    keyboard: 'Tab sau ← → alege specia, 1 2 3 aleg unealta, Enter o aplică, H cere un indiciu, Spațiu pune pauză.',
  },
  stage: 'Ecosistemul, cu populațiile speciilor',

  year: 'Anul {n} din {total}',
  seasons: ['primăvară', 'vară', 'toamnă', 'iarnă'],
  speed: 'Viteză',
  speedValue: '×{n}',
  healthyYear: 'An echilibrat: toate speciile au fost în zona sigură.',
  unhealthyYear: 'An dezechilibrat: nu toate speciile au fost în zona sigură.',

  levels: { disparut: 'dispărut', critic: 'critic', scazut: 'scăzut', normal: 'normal', ridicat: 'ridicat' },
  trends: { crestere: 'în creștere', scadere: 'în scădere', stabil: 'stabil' },
  summary: '{name}: {trend}, nivel {level}',
  eats: 'Mănâncă',
  eatenBy: 'Este mâncat de',
  nothing: 'nimic (face fotosinteză)',
  nobody: 'nimeni, în acest model',
  guild: 'Nivel trofic',

  tools: {
    protejeaza: { name: 'Protejează', help: 'Înjumătățește pierderile din cauze externe (vânat, pescuit, lipsa oxigenului) pentru o specie, un an și jumătate.' },
    regenereaza: { name: 'Regenerează habitatul', help: 'Ajută producătorii să crească mai repede, un an și jumătate.' },
    reintroduce: { name: 'Reintrodu', help: 'Aduce înapoi o mică populație dintr-o specie dispărută. O singură dată pe joc.' },
  },
  toolState: { ready: 'gata', active: 'activ', cooldown: 'se reîncarcă', used: 'folosit', pick: 'alege specia' },
  toolNeedsExtinct: 'Reintrodu merge doar pentru o specie dispărută.',
  toolApplied: '{tool}: {target}.',
  producers: 'producătorii',

  log: 'Jurnalul ecosistemului',
  quiet: 'Deocamdată e liniște în ecosistem.',
  soon: 'în {n} s',
  now: 'acum',
  over: 'încheiat',
  eventYear: 'Anul {n}',
  firstTip: 'Sfat: când un eveniment lovește o specie, alege Protejează (tasta 1) și apoi specia. După o secetă, Regenerează habitatul (tasta 2).',
  extinct: '{name} a dispărut din ecosistem.',
  help: 'O specie a dispărut, așa că următorul eveniment vine mai târziu și mai slab. Ai timp să reechilibrezi.',
  hint: 'Indiciu',
  hintKey: 'H',
  hintText: 'Cel mai mult riscă {name}. Încearcă {tool}.',
  hintNone: 'Totul e în echilibru acum. Urmărește jurnalul.',
  crisis: 'Criză de oxigen: algele în descompunere consumă oxigenul, peștii mor.',

  web: 'Rețeaua trofică',
  webLegend: 'Săgeata arată cine pe cine mănâncă (sensul hranei). Cercul crește cu populația.',
  danger: 'risc',
  chart: 'Populațiile în timp',
  chartLegend: 'Banda umbrită este zona sigură. Fiecare specie are alt tip de linie.',
  inspect: 'Detalii',

  inventory: {
    title: 'Inventar: anul {n}',
    intro: 'Am numărat indivizii dintr-o suprafață de probă. Calculează dominanța fiecărei specii: D = n / N × 100.',
    count: 'Indivizi (n)',
    total: 'Total (N)',
    d: 'Dominanța D (%)',
    dominant: 'Care specie este dominantă?',
    check: 'Verifică',
    continue: 'Continuă',
    correct: 'Corect',
    wrongD: 'D = {n} / {N} × 100 = {d}%',
    question: 'Ce arată valorile?',
    producerHigh: 'Producătorii au o dominanță de peste {t}%: comunitatea s-a dezechilibrat spre alge, ca la înflorirea apelor.',
    producerNormal: 'Producătorii au cel mult {t}%: nicio specie nu a crescut exagerat, comunitatea e aproape de echilibru.',
    explainHigh: 'Dominanța producătorilor a trecut de {t}%: algele s-au înmulțit mult peste consumatori.',
    explainNormal: 'Dominanța producătorilor e sub {t}%: nicio specie nu a crescut exagerat.',
    points: '+{n} puncte',
  },

  howTo: {
    label: 'Cum se joacă, în trei pași',
    steps: [
      { title: 'Urmărește populațiile', text: 'Cercurile din rețea și liniile din grafic arată cât de mare e fiecare populație.' },
      { title: 'Citește jurnalul', text: 'Evenimentele sunt anunțate cu câteva secunde înainte, ca o tăietură din ziar.' },
      { title: 'Alege unealta, apoi specia', text: 'Protejează, Regenerează sau Reintrodu. Fiecare are nevoie de timp să se reîncarce.' },
    ],
  },

  recapLost: '{event}: {names} a ajuns la dispariție.',
  recapCritical: '{event}: {names} a ajuns la un nivel critic.',
};

/** Fills {placeholders}. */
export const fill = (text, vars) => text.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
