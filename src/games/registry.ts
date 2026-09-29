// Every playable game. Add a real game by appending its definition to REAL_GAMES (see GAME-DEV.md).
// Order within a topic is the order shown on /jocuri.
import type { GameDefinition } from './core/types';
// Resolves to ./sandbox/index.ts on the dev server and in VITE_SANDBOX=1 builds, and to
// ./sandbox/disabled.ts (empty) otherwise, so production builds contain no sandbox code at all.
import { SANDBOX_GAMES } from '@games-sandbox';
import { MEMBRANE_GAMES } from './celula/poarta-membranei/definitions';
import { ECO_GAMES } from './echilibrul/definitions';
import { SAFARI_GAMES } from './diversitatea-vietii/safari-microscop/definitions';

const REAL_GAMES: GameDefinition[] = [...MEMBRANE_GAMES, ...ECO_GAMES, ...SAFARI_GAMES];

/** Dev server, or a build made with VITE_SANDBOX=1 (only for the offline test; never deploy it). */
export const SANDBOX_ENABLED = SANDBOX_GAMES.length > 0;

export const GAMES: readonly GameDefinition[] = [...REAL_GAMES, ...SANDBOX_GAMES];

export const getGame = (id: string | undefined): GameDefinition | null => GAMES.find((g) => g.id === id) ?? null;

export const gamesForTopic = (slug: string) => GAMES.filter((g) => g.topicSlug === slug);

export const gamePath = (id: string) => `/joc/${id}`;
