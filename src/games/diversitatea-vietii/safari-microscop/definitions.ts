// Registry entries for both modes of "Safari la microscop" (G4a). Imported by src/games/registry.ts.
import { defineGame } from '../../core/defineGame';
import type { RunResult, Stars } from '../../core/types';
import { SAFARI } from '../../../content/ro/games/safari-microscop';
import { organismsFor, type SafariMode } from '../../../content/ro/safari-organisms.ts';
import { LIVES, POINTS, STAR_ACCURACY } from './config';

/** Stars from accuracy (sorted right against wrong and escaped) and score, as in Poarta membranei. */
export const safariStars =
  (mode: SafariMode) =>
  (r: RunResult): Stars => {
    if (r.outcome !== 'won') return 0;
    const judged = r.hits + r.misses;
    const accuracy = judged ? r.hits / judged : 0;
    if (accuracy >= STAR_ACCURACY.three && r.score >= organismsFor(mode).length * POINTS.group * 1.5) return 3;
    if (accuracy >= STAR_ACCURACY.two) return 2;
    return 1;
  };

const shared = {
  topicSlug: 'diversitatea-vietii',
  controls: SAFARI.controls,
  usesPhaser: true,
  hud: { lives: LIVES, timer: { mode: 'up' as const }, hints: true },
};

export const SAFARI_GAMES = [
  defineGame({
    ...shared,
    id: 'safari-microscop',
    title: SAFARI.baza.title,
    tagline: SAFARI.baza.tagline,
    instructions: SAFARI.baza.instructions,
    estimatedMinutes: 4,
    difficulty: 'mediu',
    stars: safariStars('baza'),
    load: () => import('./SafariGame').then((m) => ({ default: m.BaseSafariGame })),
    howTo: () => import('./HowTo').then((m) => ({ default: m.SafariHowTo })),
  }),
  defineGame({
    ...shared,
    id: 'safari-microscop-avansat',
    title: SAFARI.avansat.title,
    tagline: `${SAFARI.avansat.level}. ${SAFARI.avansat.tagline}`,
    instructions: SAFARI.avansat.instructions,
    estimatedMinutes: 6,
    difficulty: 'greu',
    stars: safariStars('avansat'),
    load: () => import('./SafariGame').then((m) => ({ default: m.AdvancedSafariGame })),
    howTo: () => import('./HowTo').then((m) => ({ default: m.SafariHowTo })),
  }),
];
