// REVIEW: copy by Claude, needs native review and a teacher's check of the science
import type { Lesson } from './types';

export const impactulUman: Lesson = {
  slug: 'impactul-uman',
  number: 4,
  title: 'Omul și mediul',
  stain: 'iodine',
  hook: 'Cum ajunge îngrășământul de pe un câmp să omoare peștii dintr-o baltă aflată la câțiva kilometri?',
  sections: [
    {
      id: 'omul-in-ecosistem',
      title: 'Cum schimbă omul un ecosistem?',
      body: [
        'Omul face parte din ecosisteme, dar le schimbă mai repede decât orice altă specie. Defrișează păduri pentru câmpuri și orașe, desecă bălți, construiește baraje și drumuri care taie teritoriile animalelor.',
        'Când un ecosistem natural e înlocuit cu o cultură de o singură plantă, rețeaua trofică se simplifică: rămân puține specii, iar dăunătorii se pot înmulți ușor. Și resursele pe care le folosim (apă, sol fertil, lemn, pește) se refac mai încet decât le consumăm.',
      ],
      margin: 'Un lan de grâu are mult mai puține specii decât pădurea care era în locul lui.',
    },
    {
      id: 'poluare-deseuri',
      title: 'Unde ajunge ce aruncăm?',
      body: [
        '**Poluarea** înseamnă substanțe sau deșeuri ajunse în mediu în cantități care fac rău viețuitoarelor. Gazele de eșapament poluează aerul, pesticidele și metalele grele ajung în sol și în apă, iar plasticul se fărâmițează în bucăți mici care rămân sute de ani.',
        'Îngrășămintele spălate de ploaie de pe câmpuri ajung în ape. Nitrații și fosfații hrănesc algele, care se înmulțesc exploziv: este **eutrofizarea** („înflorirea apelor”). Când algele mor, descompunerea lor consumă oxigenul din apă, iar peștii mor.',
      ],
      predict: {
        question: 'De ce sunt mai bune „reducerea” și „refolosirea” decât reciclarea?',
        answer: 'Pentru că un deșeu care nu apare deloc nu mai trebuie colectat, transportat și prelucrat.',
      },
    },
    {
      id: 'clima',
      title: 'De ce se încălzește planeta?',
      body: [
        '**Efectul de seră** este natural: unele gaze din atmosferă, mai ales dioxidul de carbon și metanul, rețin o parte din căldura radiată de Pământ. Fără el, planeta ar fi înghețată.',
        'Arzând cărbune, petrol și gaze, și tăind păduri, omul a crescut mult cantitatea de dioxid de carbon din aer. Efectul de seră s-a accentuat, iar temperatura medie a crescut. Consecințele se văd deja: valuri de căldură, secete mai lungi, ghețari care se topesc și specii care își mută arealul.',
      ],
      margin: 'Pădurile și oceanele absorb o parte din dioxidul de carbon pe care îl producem.',
    },
    {
      id: 'amprenta',
      title: 'Cât de mare este urma pe care o lăsăm?',
      body: [
        '**Amprenta ecologică** măsoară câtă suprafață de teren și apă ar fi necesară ca să producă tot ce consumă o persoană și să absoarbă deșeurile ei. Mâncarea, transportul, energia și lucrurile pe care le cumpărăm o măresc.',
        'Pe lângă ce reducem, contează și ce facem în plus pentru mediu: aceasta este **amprenta pozitivă**. Un pom plantat, o baltă curățată, un vecin convins să colecteze separat sau o cutie pentru păsări montată în curtea școlii sunt exemple concrete.',
      ],
      predict: {
        question: 'Mersul cu bicicleta în loc de mașină reduce amprenta ecologică sau o mărește pe cea pozitivă?',
        answer: 'Reduce amprenta ecologică: consumi mai puțin combustibil. Amprenta pozitivă e ceva ce adaugi în bine, ca plantarea unui pom.',
      },
    },
  ],
  keyPoints: [
    'Omul schimbă ecosistemele: defrișări, culturi dintr-o singură plantă, resurse consumate mai repede decât se refac.',
    'Îngrășămintele ajunse în ape duc la eutrofizare: algele cresc, oxigenul scade, peștii mor.',
    'Arderea combustibililor fosili accentuează efectul de seră și încălzește planeta.',
  ],
  games: [],
  whyItMatters: 'Ce ajunge în apa unei bălți se întoarce la noi prin peștii pe care îi mâncăm și prin apa pe care o bem.',
  check: [
    {
      prompt: 'De ce mor peștii într-o baltă în care au ajuns multe îngrășăminte?',
      options: ['Îngrășămintele sunt otrăvitoare pentru pești', 'Algele se înmulțesc, iar descompunerea lor consumă oxigenul', 'Apa devine prea rece', 'Peștii mănâncă îngrășămintele'],
      answer: 1,
      explanation: 'Eutrofizare: algele înmulțite mor, iar descompunerea lor lasă apa fără oxigen.',
      section: 'poluare-deseuri',
    },
    {
      prompt: 'Care afirmație despre efectul de seră este corectă?',
      options: ['Este produs doar de om', 'Fără el, Pământul ar fi mult mai rece', 'Este produs de gaura din stratul de ozon', 'Răcește planeta'],
      answer: 1,
      explanation: 'Efectul de seră natural ține planeta caldă; omul l-a accentuat.',
      section: 'clima',
    },
    {
      prompt: 'Care exemplu ține de amprenta pozitivă?',
      options: ['Folosești mai puțin plastic', 'Plantezi și îngrijești un copac', 'Faci dușuri mai scurte', 'Mergi pe jos la școală'],
      answer: 1,
      explanation: 'Amprenta pozitivă este ce adaugi în bine; celelalte reduc amprenta ecologică.',
      section: 'amprenta',
    },
  ],
};
