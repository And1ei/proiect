// Text for every figure: caption, accessible title/description and part labels.
// Drawings live in src/figures; each part label key matches a data-part id in the SVG.

export const FIGURES = {
  neuron: {
    number: 1,
    label: 'Neuron',
    caption: 'Structura neuronului, schematic. Săgeata arată sensul în care circulă impulsul nervos.',
    title: 'Structura neuronului',
    desc: 'Schemă a unui neuron. Din corpul celular, care conține nucleul, pornesc dendrite ramificate. Din conul de emergență pornește axonul, acoperit de teaca de mielină, întreruptă de strangulațiile Ranvier. Axonul se termină cu butoni terminali. O săgeată arată că impulsul circulă de la dendrite spre butonii terminali.',
    labels: {
      dendrite: 'Dendrite',
      'corp-celular': 'Corp celular',
      nucleu: 'Nucleu',
      'con-emergenta': ['Con de', 'emergență'],
      axon: 'Axon',
      'teaca-mielina': ['Teacă de', 'mielină'],
      'strangulatie-ranvier': ['Strangulație', 'Ranvier'],
      'butoni-terminali': ['Butoni', 'terminali'],
      'sens-impuls': ['Sensul', 'impulsului'],
    },
  },
  inima: {
    number: 2,
    label: 'Inimă',
    caption: 'Inima și cele două circuite ale sângelui, schematic. Albastru: sânge neoxigenat. Roz: sânge oxigenat.',
    title: 'Inima și circulația sângelui',
    desc: 'Schemă a inimii cu cele patru cavități. Jumătatea dreaptă, cu sânge neoxigenat, trimite sângele prin valva pulmonară și arterele pulmonare spre plămâni. Venele pulmonare aduc sângele oxigenat în atriul stâng. Ventriculul stâng îl trimite prin valva aortică în aortă, spre țesuturi, iar venele cave îl aduc înapoi în atriul drept.',
    labels: {
      'atriu-drept': ['Atriul', 'drept'],
      'atriu-stang': ['Atriul', 'stâng'],
      'ventricul-drept': ['Ventriculul', 'drept'],
      'ventricul-stang': ['Ventriculul', 'stâng'],
      'valva-tricuspida': ['Valva', 'tricuspidă'],
      'valva-mitrala': ['Valva', 'mitrală'],
      'valva-pulmonara': ['Valva', 'pulmonară'],
      'valva-aortica': ['Valva', 'aortică'],
      'artere-pulmonare': ['Artere', 'pulmonare'],
      'vene-pulmonare': ['Vene', 'pulmonare'],
      aorta: 'Aorta',
      'vene-cave': ['Vene', 'cave'],
      'capilare-pulmonare': ['Plămâni', '(capilare)'],
      'capilare-sistemice': ['Țesuturi', '(capilare)'],
    },
  },
};
