// Reflex arc interactive: put the five components in order for a withdrawal reflex, then classify a
// second, everyday reflex. `presented` is the fixed, shuffled order in which the tags appear.

const reflex = {
  title: 'Arcul reflex, pas cu pas',
  intro:
    'Pune cele cinci componente ale arcului reflex în ordinea în care le parcurge impulsul. Apoi clasifică un al doilea reflex.',
  arc: {
    scenario: 'Atingi din greșeală o oală fierbinte și îți retragi imediat mâna.',
    components: [
      { id: 'receptor', label: 'Receptor', detail: 'Receptorii pentru căldură și durere din pielea degetelor.' },
      { id: 'aferenta', label: 'Cale aferentă', detail: 'Neuronul senzitiv, cu corpul celular în ganglionul spinal.' },
      { id: 'centru', label: 'Centru nervos', detail: 'Măduva spinării.' },
      { id: 'eferenta', label: 'Cale eferentă', detail: 'Neuronul motor din coarnele anterioare ale măduvei spinării.' },
      { id: 'efector', label: 'Efector', detail: 'Mușchii flexori ai brațului, care îndepărtează mâna.' },
    ],
    presented: ['centru', 'efector', 'receptor', 'eferenta', 'aferenta'],
  },
  classify: {
    scenario: 'Îți lasă gura apă când vezi reclama la mâncarea ta preferată.',
    typePrompt: 'Ce fel de reflex este?',
    types: ['Reflex necondiționat', 'Reflex condiționat'],
    typeAnswer: 1,
    whyPrompt: 'De ce?',
    reasons: [
      'S-a format în timpul vieții, prin asocierea imaginii cu gustul mâncării.',
      'Este înnăscut și apare la fel la toți oamenii.',
      'Nu are nevoie de scoarța cerebrală.',
    ],
    reasonAnswer: 0,
  },
  text: {
    componentsLabel: 'Componentele arcului reflex',
    slot: 'Pasul {n}',
    arcDone: 'Arcul reflex e complet: impulsul a ajuns de la receptor la efector.',
    hints: {
      arc: 'Urmărește impulsul: unde e primit stimulul, pe ce neuron intră în măduvă, unde se ia decizia, pe ce neuron iese comanda și cine o execută.',
      type: 'Gândește-te: te-ai născut știind cum arată reclama aceea?',
      reason: 'Reflexele condiționate se formează prin asocieri repetate și au nevoie de scoarța cerebrală.',
    },
  },
};

export default reflex;
