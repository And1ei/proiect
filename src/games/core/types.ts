// The contract every game follows. See GAME-DEV.md for the checklist.
import type { ComponentType, LazyExoticComponent } from 'react';
import type { GameSession } from './session';

export type GameStatus = 'intro' | 'playing' | 'paused' | 'won' | 'lost';
export type Outcome = 'won' | 'lost';
export type Difficulty = 'usor' | 'mediu' | 'greu';
export type Stars = 0 | 1 | 2 | 3;

/** Short Romanian sentence per input type. Omit a type the game doesn't support. */
export interface GameControls {
  touch?: string;
  mouse?: string;
  keyboard?: string;
}

/** Frozen numbers at the end of a run; what `stars()` and the results screen see. */
export interface RunResult {
  outcome: Outcome;
  score: number;
  lives: number;
  maxLives: number;
  bestStreak: number;
  misses: number;
  hits: number;
  hintsUsed: number;
  elapsedMs: number;
}

export interface TimerConfig {
  /** 'up' counts elapsed time; 'down' counts to zero and then ends the run with `onTimeUp`. */
  mode: 'up' | 'down';
  limitMs?: number;
  onTimeUp?: Outcome;
}

/** What the HUD shows. Everything is optional; score is always shown. */
export interface HudConfig {
  /** Starting lives; 0 or omitted hides the lives row and makes loseLife() a no-op. */
  lives?: number;
  timer?: TimerConfig;
  /** Show the hint-usage indicator. Set when the game offers hints. */
  hints?: boolean;
}

/** Props every game component receives. */
export interface GameProps {
  session: GameSession;
}

type GameModule = { default: ComponentType<GameProps> };

export interface GameDefinition {
  /** URL segment: /joc/:id. Lowercase, hyphens. Also the progress key. */
  id: string;
  /** Registry slug of the topic this game belongs to ("Înapoi la lecție" goes there). */
  topicSlug: string;
  title: string;
  tagline: string;
  /** 2–5 short Romanian sentences, shown on the intro screen and in "Cum se joacă". */
  instructions: string[];
  controls: GameControls;
  estimatedMinutes: number;
  difficulty: Difficulty;
  /** True when the game mounts <PhaserGame>; the shell then preloads the Phaser chunk on intent. */
  usesPhaser: boolean;
  hud: HudConfig;
  /** 0–3 stars for a finished run. Keep it pure; it runs once when the run ends. */
  stars: (result: RunResult) => Stars;
  /** Dynamic import of the game component. Called on intent (hover, intro screen) to preload. */
  load: () => Promise<GameModule>;
  /** React.lazy wrapper around `load`, created by defineGame(). */
  Component: LazyExoticComponent<ComponentType<GameProps>>;
  /** Dev-only reference game: shown with a "sandbox" tag and never in production builds. */
  sandbox?: boolean;
}

export type GameDefinitionInput = Omit<GameDefinition, 'Component'>;
