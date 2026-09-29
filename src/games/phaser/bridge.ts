import type { GameBus } from './bus';
import type { Palette } from './palette';

/** Everything a scene may know about the outside world. Stored in game.registry under BRIDGE_KEY. */
export interface SceneBridge {
  bus: GameBus;
  palette: Palette;
  /** The game's logical design size. Scene code uses these coordinates only. */
  design: { width: number; height: number };
  /** Device pixel ratio the canvas is rendered at (capped at 2). */
  dpr: number;
  reducedMotion: boolean;
  muted: boolean;
}

export const BRIDGE_KEY = 'soft-educational:bridge';
