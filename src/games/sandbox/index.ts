// Dev-only reference games. ../registry.ts imports this through the @games-sandbox alias
// (vite.config.js), which points here only on the dev server or in a VITE_SANDBOX=1 build (used
// for the offline test). Normal production builds get ./disabled.ts instead.
import { defineGame } from '../core/defineGame';
import { DRIFT, SORT } from './strings';
import { LIVES } from './drift/config';

export const SANDBOX_GAMES = [
  defineGame({
    id: 'sandbox-prinde-organismele',
    topicSlug: 'celula',
    title: DRIFT.title,
    tagline: DRIFT.tagline,
    instructions: DRIFT.instructions,
    controls: DRIFT.controls,
    estimatedMinutes: 2,
    difficulty: 'usor',
    usesPhaser: true,
    hud: { lives: LIVES, timer: { mode: 'up' } },
    stars: (r) => (r.outcome !== 'won' ? 0 : r.lives === r.maxLives ? 3 : r.lives >= 2 ? 2 : 1),
    load: () => import('./drift/DriftGame'),
    sandbox: true,
  }),
  defineGame({
    id: 'sandbox-una-sau-mai-multe-celule',
    topicSlug: 'diversitatea-vietii',
    title: SORT.title,
    tagline: SORT.tagline,
    instructions: SORT.instructions,
    controls: SORT.controls,
    estimatedMinutes: 1,
    difficulty: 'usor',
    usesPhaser: false,
    hud: { timer: { mode: 'up' }, hints: true },
    stars: (r) => (r.outcome !== 'won' ? 0 : r.misses === 0 ? 3 : r.misses === 1 ? 2 : 1),
    load: () => import('./sort/SortGame'),
    sandbox: true,
  }),
];
