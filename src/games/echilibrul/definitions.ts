// Registry entries for both scenarios of "Echilibrul" (G3). Imported by src/games/registry.ts.
import { defineGame } from '../core/defineGame';
import type { RunResult, Stars } from '../core/types';
import { ECO } from '../../content/ro/games/echilibrul';
import { LIVES, YEARS } from './scenarios';

/**
 * Stars from the years in balance (hits: a healthy year) and the species kept (lives). 3 stars: at
 * least 7 balanced years and no extinction; 2: at least 4 balanced years; 1: the ten years survived.
 */
export const ecoStars = (r: RunResult): Stars => {
  if (r.outcome !== 'won') return 0;
  const balanced = Math.min(r.hits, YEARS);
  if (balanced >= 7 && r.lives === r.maxLives) return 3;
  if (balanced >= 4) return 2;
  return 1;
};

const shared = {
  family: 'echilibrul',
  topicSlug: 'ecosisteme',
  controls: ECO.controls,
  usesPhaser: false,
  hud: { lives: LIVES, timer: { mode: 'up' as const }, hints: true },
  stars: ecoStars,
};

export const ECO_GAMES = [
  defineGame({
    ...shared,
    id: 'echilibrul',
    title: ECO.padure.title,
    tagline: ECO.padure.tagline,
    instructions: ECO.padure.instructions,
    estimatedMinutes: 4,
    difficulty: 'mediu',
    load: () => import('./EcoGame').then((m) => ({ default: m.ForestGame })),
    howTo: () => import('./HowTo').then((m) => ({ default: m.ForestHowTo })),
  }),
  defineGame({
    ...shared,
    id: 'echilibrul-avansat',
    title: ECO.balta.title,
    tagline: `${ECO.balta.level}. ${ECO.balta.tagline}`,
    instructions: ECO.balta.instructions,
    estimatedMinutes: 6,
    difficulty: 'greu',
    load: () => import('./EcoGame').then((m) => ({ default: m.PondGame })),
    howTo: () => import('./HowTo').then((m) => ({ default: m.PondHowTo })),
  }),
];
