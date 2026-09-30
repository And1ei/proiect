// REVIEW: copy by Claude, needs native review and a teacher's check of the science
import type { Lesson } from './types';

export const laboratorul: Lesson = {
  slug: 'laboratorul',
  number: 5,
  title: 'Laboratorul: cum se face un experiment',
  navTitle: 'Laboratorul',
  stain: 'hematoxylin',
  hook: 'Dacă semințele din ghiveciul de pe calorifer au răsărit primele, e sigur din cauza căldurii?',
  sections: [
    {
      id: 'intrebare-ipoteza',
      title: 'Cum transformi o întrebare într-o ipoteză?',
      body: [
        'Orice experiment pornește de la o **observație**: semințele de fasole de pe pervazul cald au răsărit mai repede decât cele de pe balcon. Din ea apare o **întrebare**: influențează temperatura germinarea?',
        '**Ipoteza** este un răspuns posibil, formulat așa încât să poată fi verificat: „Semințele de fasole țin la 25 °C germinează mai repede decât cele ținute la 10 °C.” O ipoteză bună spune ce se schimbă și ce se măsoară, iar experimentul o poate confirma sau infirma.',
      ],
      margin: '„Plantele iubesc căldura” nu e o ipoteză bună: nu spune ce măsori.',
    },
    {
      id: 'variabile-martor',
      title: 'Ce schimbi, ce măsori și ce ții la fel?',
      body: [
        '**Variabila independentă** este ce schimbi tu: temperatura. **Variabila dependentă** este ce măsori: câte zile trec până la germinare. Toate celelalte condiții (soiul semințelor, apa, lumina, solul) trebuie ținute la fel: sunt **variabilele controlate**.',
        'Ai nevoie și de un **grup martor**, cu care compari: semințele ținute în condiții obișnuite. Dacă schimbi două lucruri deodată, de exemplu și temperatura, și lumina, nu mai știi care dintre ele a produs diferența.',
      ],
      predict: {
        question: 'Uzi ghiveciul cald de două ori pe zi și pe cel rece o dată. Ce problemă are experimentul?',
        answer: 'Apa nu mai este controlată: diferența poate veni de la apă, nu de la temperatură.',
      },
    },
    {
      id: 'date-concluzie',
      title: 'Cum treci de la măsurători la o concluzie?',
      body: [
        'Rezultatele se notează într-un **tabel**, cu unitățile de măsură, și se pot desena într-un grafic. Un singur ghiveci nu spune mare lucru: folosești mai multe semințe în fiecare grup și calculezi **media**.',
        '**Concluzia** răspunde la întrebarea de la început și spune dacă datele confirmă sau infirmă ipoteza. Dacă semințele de la 25 °C au germinat în medie în 4 zile, iar cele de la 10 °C în 11 zile, ipoteza este confirmată pentru aceste condiții, nu pentru orice plantă din lume.',
      ],
      margin: 'O ipoteză infirmată nu e un experiment ratat: ai aflat ceva adevărat.',
    },
    {
      id: 'erori',
      title: 'De ce poate greși un experiment?',
      body: [
        'Un experiment poate duce la o concluzie greșită din mai multe motive. **Eșantionul** poate fi prea mic: trei semințe pot fi toate, din întâmplare, mai slabe. O variabilă poate scăpa de sub control, iar măsurătorile pot fi făcute cu un instrument imprecis.',
        'Mai e o capcană: două lucruri care apar împreună nu înseamnă că unul îl produce pe celălalt. De aceea experimentele se **repetă**, de preferat de către alți oameni, iar rezultatele se compară.',
      ],
      predict: {
        question: 'Elevii care iau micul-dejun au note mai mari. Înseamnă că micul-dejun crește notele?',
        answer: 'Nu neapărat: poate un alt factor, ca somnul sau programul de acasă, le influențează pe amândouă.',
      },
    },
  ],
  keyPoints: [
    'Ipoteza este un răspuns care poate fi verificat: spune ce schimbi și ce măsori.',
    'Schimbi o singură variabilă, le ții pe celelalte la fel și compari cu un grup martor.',
    'Folosești mai multe probe, repeți experimentul și nu confunzi o legătură cu o cauză.',
  ],
  games: [],
  whyItMatters: 'Așa se verifică și un medicament nou: cu un grup martor, cu multe persoane și cu o singură diferență între grupuri.',
  // REVIEW (F1): five questions, since this topic has no game; teacher please re-check
  check: [
    {
      prompt: 'Care dintre acestea este o ipoteză care poate fi verificată?',
      options: ['Plantele iubesc lumina', 'Fasolea udată zilnic crește în două săptămâni mai înaltă decât cea udată o dată pe săptămână', 'Fasolea este o plantă frumoasă', 'Toate plantele au nevoie de ceva'],
      answer: 1,
      explanation: 'Spune ce schimbi (udarea) și ce măsori (înălțimea), deci un experiment o poate confirma sau infirma.',
      section: 'intrebare-ipoteza',
    },
    {
      prompt: 'Pui ghiveciul cald la lumină și pe cel rece la întuneric. De ce nu poți trage o concluzie despre temperatură?',
      options: ['Ai schimbat două lucruri deodată', 'Ghivecele sunt prea mici', 'Lumina nu contează pentru semințe', 'Poți: temperatura e singura diferență'],
      answer: 0,
      explanation: 'Dacă schimbi și lumina, nu mai știi dacă diferența vine de la temperatură sau de la lumină.',
      section: 'variabile-martor',
    },
    {
      prompt: 'Testezi un îngrășământ doar pe plante tratate, fără grup martor. Ce nu vei ști?',
      options: ['Nimic, rezultatul e același', 'Dacă plantele ar fi crescut la fel și fără îngrășământ', 'Câte plante ai folosit', 'Cât de înalte au crescut plantele'],
      answer: 1,
      explanation: 'Grupul martor arată ce se întâmplă fără schimbarea ta; fără el nu ai cu ce compara.',
      section: 'variabile-martor',
    },
    {
      prompt: 'Semințele de la 25 °C au germinat în medie în 4 zile, cele de la 10 °C în 11 zile. Ce concluzie este corectă?',
      options: ['Toate plantele din lume cresc mai repede la căldură', 'Pentru aceste semințe și condiții, căldura a grăbit germinarea', 'Ipoteza este infirmată', 'Dintr-un experiment nu se poate spune nimic'],
      answer: 1,
      explanation: 'Concluzia răspunde la întrebare doar pentru condițiile testate, nu pentru orice plantă.',
      section: 'date-concluzie',
    },
    {
      prompt: 'Ai folosit doar două semințe în fiecare grup. Ce e în neregulă?',
      options: ['Nimic', 'Eșantionul e prea mic, rezultatul poate fi întâmplător', 'Trebuia o singură sămânță', 'Semințele trebuiau să fie de soiuri diferite'],
      answer: 1,
      explanation: 'Cu puține probe, o sămânță mai slabă din întâmplare schimbă tot rezultatul.',
      section: 'erori',
    },

  ],
};
