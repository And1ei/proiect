// Stand-in for ./index.ts in normal production builds (see the @games-sandbox alias in
// vite.config.js): the sandbox games and their chunks never reach a deployed build.
import type { GameDefinition } from '../core/types';

export const SANDBOX_GAMES: GameDefinition[] = [];
