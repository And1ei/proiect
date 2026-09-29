// DNA decoder. The template strand starts with TAC (the lesson's TAC → AUG example) and encodes
// Met, Glu, Val, then a stop codon: Glu and Val are the two amino acids from the sickle-cell paragraph.

const decoder = {
  title: 'Decodorul ADN',
  intro:
    'Transcrie catena matriță de ADN în ARN mesager, bază cu bază. Apoi citește ARNm-ul codon cu codon și tradu-l în aminoacizi, folosind codul genetic.',
  template: 'TACCTTCAAATT',

  aminoAcids: {
    A: 'Alanină', R: 'Arginină', N: 'Asparagină', D: 'Acid aspartic', C: 'Cisteină',
    Q: 'Glutamină', E: 'Acid glutamic', G: 'Glicină', H: 'Histidină', I: 'Izoleucină',
    L: 'Leucină', K: 'Lizină', M: 'Metionină', F: 'Fenilalanină', P: 'Prolină',
    S: 'Serină', T: 'Treonină', W: 'Triptofan', Y: 'Tirozină', V: 'Valină',
  },

  text: {
    templateLabel: 'Catena matriță de ADN',
    mrnaLabel: 'ARN mesager',
    mrnaStep: 'Alege baza de ARN care se împerechează cu fiecare bază din catena matriță. Poți tasta A, U, G sau C.',
    basesLabel: 'Baze de ARN',
    slotLabel: 'Poziția {n}',
    decodeStep: 'Tradu codonul evidențiat. Caută-l în tabel: primul nucleotid dă rândul, al doilea coloana, al treilea poziția din căsuță.',
    codonsLabel: 'Codonii din ARNm',
    chooseLabel: 'Aminoacidul pentru codonul {codon}',
    choosePlaceholder: 'Alege aminoacidul',
    stop: 'Codon stop (sinteza se oprește)',
    tableCaption: 'Codul genetic',
    firstBase: 'Primul nucleotid',
    secondBase: 'Al doilea nucleotid',
    result: 'Lanțul obținut: {chain}. Sinteza s-a oprit la codonul stop {stop}.',
    resultNoStop: 'Lanțul obținut: {chain}.',
    note: 'Acidul glutamic și valina sunt chiar aminoacizii din exemplul cu anemia falciformă.',
    hints: {
      mrna: 'Regula e complementaritatea: T din ADN dă A în ARN, A dă U, C dă G, iar G dă C.',
      decode: 'Codonul {codon}: rândul {first}, coloana {second}, apoi caută tripletul {codon} în căsuță.',
    },
  },
};

export default decoder;
