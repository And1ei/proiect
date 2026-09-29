import { useMemo, useState } from 'react';
import { combine, gametesOf, genotypeRatio, parseRatio, percentOf, phenotypeRatio, punnettGrid, sameRatio } from './genetics';

const SLOTS = { c0: 1, c1: 1, r0: 2, r1: 2 }; // slot → which parent's gametes belong there

/**
 * State for one cross. Phases: unknown (test cross only) → headers → cells → ratios → word → done.
 * Every check is computed from the genotypes, so any cross in the data works.
 */
export function usePunnett(mode, letter) {
  const [phase, setPhase] = useState(mode.unknown ? 'unknown' : 'headers');
  const [placed, setPlaced] = useState({});
  const [cells, setCells] = useState({});
  const [ratiosOk, setRatiosOk] = useState({ geno: false, pheno: false });

  const parent1 = mode.unknown ? mode.unknown.actual : mode.parents[0];
  const parent2 = mode.parents[1];

  const tags = useMemo(
    () => [
      ...gametesOf(parent1).map((allele, i) => ({ id: `p1-${i}`, parent: 1, allele })),
      ...gametesOf(parent2).map((allele, i) => ({ id: `p2-${i}`, parent: 2, allele })),
    ],
    [parent1, parent2],
  );
  const tagById = (id) => tags.find((t) => t.id === id);
  const alleleIn = (slot) => tagById(placed[slot])?.allele;

  // Expected grid follows the header order the learner chose
  const grid = useMemo(() => punnettGrid(parent1, parent2), [parent1, parent2]);
  const expectedCell = (r, c) => combine(alleleIn(`r${r}`), alleleIn(`c${c}`));
  const geno = genotypeRatio(grid, letter);
  const pheno = phenotypeRatio(grid);

  return {
    phase,
    parent1,
    parent2,
    tags,
    placed,
    cells,
    ratiosOk,
    geno,
    pheno,
    grid,
    wordAnswer: mode.word ? percentOf(grid, mode.word.ask) : null,
    alleleIn,
    isPlaced: (tagId) => Object.values(placed).includes(tagId),

    resolveUnknown: () => setPhase('headers'),

    /** Returns true when the tag belongs to that slot's parent and the slot is free. */
    drop(tagId, slot) {
      const tag = tagById(tagId);
      if (!tag || placed[slot] || SLOTS[slot] !== tag.parent) return false;
      const next = { ...placed, [slot]: tagId };
      setPlaced(next);
      if (Object.keys(next).length === 4) setPhase('cells');
      return true;
    },

    fill(r, c, genotype) {
      if (genotype !== expectedCell(r, c)) return false;
      const next = { ...cells, [`${r}-${c}`]: genotype };
      setCells(next);
      if (Object.keys(next).length === 4) setPhase('ratios');
      return true;
    },

    checkRatios(genoInput, phenoInput) {
      const result = {
        geno: sameRatio(parseRatio(genoInput), geno.ratio),
        pheno: sameRatio(parseRatio(phenoInput), pheno.ratio),
      };
      setRatiosOk(result);
      if (result.geno && result.pheno) setPhase('word');
      return result;
    },

    solveWord: () => setPhase('done'),
  };
}
