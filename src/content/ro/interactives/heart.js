// Heart circuits: the order of structures the blood passes through, the route drawn after each
// correct click (points in the heart figure's 520 × 560 coordinates) and one hint per step.

const heart = {
  title: 'Drumul sângelui',
  intro:
    'Alege circuitul, apoi apasă structurile în ordinea în care trece sângele. Fiecare pas corect desenează o bucată din traseu.',
  circuits: {
    mica: {
      label: 'Circulația mică (pulmonară)',
      start: 'Circulația mică pornește din ventriculul drept. Urmărește sângele până se întoarce în inimă.',
      steps: [
        { part: 'ventricul-drept', route: [[196, 336]], hint: 'Începe cu ventriculul drept, camera care trimite sângele spre plămâni.' },
        { part: 'valva-pulmonara', route: [[246, 282]], hint: 'Sângele iese din ventriculul drept printr-o valvă semilunară.' },
        { part: 'artere-pulmonare', route: [[250, 200], [250, 140]], hint: 'După valvă, sângele neoxigenat urcă prin trunchiul pulmonar și arterele pulmonare.' },
        { part: 'capilare-pulmonare', route: [[286, 118], [304, 66]], hint: 'Arterele pulmonare se ramifică în capilarele din plămâni, unde are loc schimbul de gaze.' },
        { part: 'vene-pulmonare', route: [[335, 108], [335, 152]], hint: 'Sângele oxigenat pleacă din plămâni prin venele pulmonare.' },
        { part: 'atriu-stang', route: [[331, 216]], hint: 'Venele pulmonare se varsă în atriul stâng.' },
      ],
    },
    mare: {
      label: 'Circulația mare (sistemică)',
      start: 'Circulația mare pornește din ventriculul stâng. Urmărește sângele până se întoarce în inimă.',
      steps: [
        { part: 'ventricul-stang', route: [[322, 338]], hint: 'Începe cu ventriculul stâng, camera cu peretele cel mai gros.' },
        { part: 'valva-aortica', route: [[380, 330]], hint: 'Sângele iese din ventriculul stâng printr-o valvă semilunară.' },
        { part: 'aorta', route: [[430, 330], [430, 440]], hint: 'După valvă, sângele oxigenat intră în aortă, cea mai mare arteră.' },
        { part: 'capilare-sistemice', route: [[430, 478], [380, 480], [268, 480]], hint: 'Arterele duc sângele până la capilarele din țesuturi, unde celulele primesc oxigen.' },
        { part: 'vene-cave', route: [[150, 480], [90, 480], [90, 300]], hint: 'Sângele neoxigenat se întoarce prin vene și ajunge în venele cave.' },
        { part: 'atriu-drept', route: [[90, 221], [189, 221]], hint: 'Venele cave se varsă în atriul drept.' },
      ],
    },
  },
  text: {
    circuitsLabel: 'Circuitul',
    progress: 'Pasul {n} din {total}',
    traced: 'Circuit urmărit.',
    replay: 'Revezi traseul',
  },
};

export default heart;
