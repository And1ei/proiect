import { useMemo, useState } from 'react';
import { GENETIC_CODE, STOP, TRANSCRIBE } from '../../../content/data/geneticCode';

/**
 * Decoder state. Phases: mrna (build the strand base by base) → decode (codon by codon) → done.
 * Ends at the first stop codon, or when every codon is decoded.
 */
export function useDecoder(template) {
  const expected = useMemo(() => [...template].map((b) => TRANSCRIBE[b]), [template]);
  const codons = useMemo(() => {
    const out = [];
    for (let i = 0; i + 3 <= expected.length; i += 3) out.push(expected.slice(i, i + 3).join(''));
    return out;
  }, [expected]);

  const [mrna, setMrna] = useState([]);
  const [decoded, setDecoded] = useState([]);
  const [event, setEvent] = useState(null); // { index, kind, id } for the slot that was judged

  const phase = mrna.length < expected.length ? 'mrna' : decoded.length < codons.length && decoded.at(-1) !== STOP ? 'decode' : 'done';

  const judge = (index, ok) => setEvent({ index, kind: ok ? 'correct' : 'incorrect', id: `${index}-${Date.now()}` });

  return {
    phase,
    expected,
    codons,
    mrna,
    decoded,
    event,
    currentCodon: codons[decoded.length],

    /** Returns true if `base` pairs with the next template base. */
    placeBase(base) {
      const index = mrna.length;
      const ok = base === expected[index];
      judge(index, ok);
      if (ok) setMrna((m) => [...m, base]);
      return ok;
    },

    /** Returns true if `code` (one-letter, or '*' for stop) is what the current codon encodes. */
    decode(code) {
      const index = decoded.length;
      const ok = GENETIC_CODE[codons[index]] === code;
      judge(index, ok);
      if (ok) setDecoded((d) => [...d, code]);
      return ok;
    },
  };
}
