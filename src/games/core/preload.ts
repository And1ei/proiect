import { preloadPhaser } from '../phaser/loadPhaser';
import type { GameDefinition } from './types';

/** Starts downloading a game's code (and Phaser, if it uses it) on intent: hover, focus, intro screen. */
export function preloadGame(definition: GameDefinition): void {
  void definition.load().catch(() => undefined);
  void definition.howTo?.().catch(() => undefined);
  if (definition.usesPhaser) preloadPhaser();
}
