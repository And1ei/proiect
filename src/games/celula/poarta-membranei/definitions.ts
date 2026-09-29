// Registry entries for both modes of "Poarta membranei" (G2). Imported by src/games/registry.ts.
import { defineGame } from '../../core/defineGame';
import type { RunResult, Stars } from '../../core/types';
import { MEMBRANE } from '../../../content/ro/games/poarta-membranei';
import type { MembraneMode } from '../../../content/ro/membrane-molecules';
import { LIVES, POINTS, SCHEDULE, STAR_ACCURACY } from './config';

const moleculesIn = (mode: MembraneMode) =>
  SCHEDULE[mode].reduce((n, p) => n + (p.kind === 'wave' ? p.wave.count : 0), 0);

/**
 * Stars from accuracy and score. Accuracy counts every judged action (hits against misses, where
 * wrong gates, late molecules and osmosis damage are misses). 3 stars also need a score of at least
 * 1.5 × the plain points for every molecule, which a few streaks reach easily.
 */
export const starsFor =
  (mode: MembraneMode) =>
  (r: RunResult): Stars => {
    if (r.outcome !== 'won') return 0;
    const judged = r.hits + r.misses;
    const accuracy = judged ? r.hits / judged : 0;
    if (accuracy >= STAR_ACCURACY.three && r.score >= moleculesIn(mode) * POINTS * 1.5) return 3;
    if (accuracy >= STAR_ACCURACY.two) return 2;
    return 1;
  };

const shared = {
  topicSlug: 'celula',
  controls: MEMBRANE.controls,
  usesPhaser: true,
  hud: { lives: LIVES, timer: { mode: 'up' as const }, hints: true },
};

export const MEMBRANE_GAMES = [
  defineGame({
    ...shared,
    id: 'poarta-membranei',
    title: MEMBRANE.baza.title,
    tagline: MEMBRANE.baza.tagline,
    instructions: MEMBRANE.baza.instructions,
    estimatedMinutes: 4,
    difficulty: 'mediu',
    stars: starsFor('baza'),
    load: () => import('./MembraneGame').then((m) => ({ default: m.BaseMembraneGame })),
    howTo: () => import('./HowTo').then((m) => ({ default: m.BaseHowTo })),
  }),
  defineGame({
    ...shared,
    id: 'poarta-membranei-avansat',
    title: MEMBRANE.avansat.title,
    tagline: `${MEMBRANE.avansat.level}. ${MEMBRANE.avansat.tagline}`,
    instructions: MEMBRANE.avansat.instructions,
    estimatedMinutes: 6,
    difficulty: 'greu',
    stars: starsFor('avansat'),
    load: () => import('./MembraneGame').then((m) => ({ default: m.AdvancedMembraneGame })),
    howTo: () => import('./HowTo').then((m) => ({ default: m.AdvancedHowTo })),
  }),
];

