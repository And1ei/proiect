// The standard (universal) genetic code, NCBI translation table 1.
// Built from the canonical 64-letter string rather than typed by hand, codon order UCAG × UCAG × UCAG.
// '*' marks a stop codon. Language-neutral; names live in content/ro/interactives/decoder.js.

const BASES = ['U', 'C', 'A', 'G'];
const TABLE_1 = 'FFLLSSSSYY**CC*WLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG';

export const GENETIC_CODE = Object.fromEntries(
  BASES.flatMap((b1, i) =>
    BASES.flatMap((b2, j) => BASES.map((b3, k) => [b1 + b2 + b3, TABLE_1[i * 16 + j * 4 + k]])),
  ),
);

export const STOP = '*';
export const START_CODON = 'AUG';
export const RNA_BASES = BASES;

/** Template DNA base → the mRNA base transcribed opposite it. */
export const TRANSCRIBE = { T: 'A', A: 'U', C: 'G', G: 'C' };

/** One-letter amino acid codes → three-letter abbreviations used in Romanian textbooks. */
export const THREE_LETTER = {
  A: 'Ala', R: 'Arg', N: 'Asn', D: 'Asp', C: 'Cys', Q: 'Gln', E: 'Glu', G: 'Gly', H: 'His', I: 'Ile',
  L: 'Leu', K: 'Lys', M: 'Met', F: 'Phe', P: 'Pro', S: 'Ser', T: 'Thr', W: 'Trp', Y: 'Tyr', V: 'Val',
};
