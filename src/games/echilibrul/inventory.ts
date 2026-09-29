// Inventar grading, pure (unit-tested). The correct answers are always computed from the counts.
import { dominance, dominantIndex } from './ecosystemModel.ts';
import { D_TOLERANCE, INVENTORY_POINTS, PRODUCER_HIGH_D } from './scenarios.ts';

/** Accepts "22,5", "22.5", "22,5 %". */
export const parsePercent = (s: string) => {
  const n = Number.parseFloat(s.replace('%', '').replace(',', '.').trim());
  return Number.isFinite(n) ? n : null;
};

export function gradeInventory(counts: number[], producerIndex: number, typed: string[], dominantPick: number | null, balancePick: 'high' | 'normal' | null) {
  const d = dominance(counts);
  const perSpecies = d.map((value, i) => {
    const got = parsePercent(typed[i] ?? '');
    return got !== null && Math.abs(got - value) <= D_TOLERANCE;
  });
  const dominant = dominantPick === dominantIndex(counts);
  const high = d[producerIndex] > PRODUCER_HIGH_D;
  const balance = balancePick === (high ? 'high' : 'normal');
  const points =
    perSpecies.filter(Boolean).length * INVENTORY_POINTS.perSpecies + (dominant ? INVENTORY_POINTS.dominant : 0) + (balance ? INVENTORY_POINTS.question : 0);
  return { d, perSpecies, dominant, dominantIndex: dominantIndex(counts), high, balance, points };
}
