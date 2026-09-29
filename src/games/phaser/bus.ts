// Typed event bus between React and Phaser. Scenes never import zustand, React or the session:
// they emit "what happened" and listen for "what to do". <PhaserGame> is the only translator.
import type { Outcome } from '../core/types';
import type { SoundEvent } from '../feel/sfx';

/** Logical scene coordinates (the game's design size, not device pixels). */
export interface ScenePoint {
  x: number;
  y: number;
}

/** Phaser → React */
export interface SceneEvents {
  /** Points without touching the streak (bonuses). Awarded × the current multiplier. */
  score: { points: number; at?: ScenePoint };
  /** A correct action: streak +1, then `points` × multiplier (default 10). */
  hit: { points?: number; at?: ScenePoint };
  /** A wrong or missed action: streak resets. */
  miss: { at?: ScenePoint };
  'life-lost': { at?: ScenePoint };
  /** The player is close to winning; the shell shows a near-win line once per run. */
  'near-win': Record<string, never>;
  finished: { outcome: Outcome };
  /** A named one-off sound that the session events don't already cover (e.g. 'pop', 'whoosh'). */
  sfx: { name: SoundEvent };
}

/** React → Phaser. <PhaserGame> also pauses/resumes/restarts the scenes itself. */
export interface ShellEvents {
  pause: Record<string, never>;
  resume: Record<string, never>;
  mute: { muted: boolean };
  restart: Record<string, never>;
}

export type AllEvents = SceneEvents & ShellEvents;
type Handler<K extends keyof AllEvents> = (payload: AllEvents[K]) => void;

export interface GameBus {
  emit<K extends keyof AllEvents>(event: K, payload: AllEvents[K]): void;
  on<K extends keyof AllEvents>(event: K, handler: Handler<K>): () => void;
  off<K extends keyof AllEvents>(event: K, handler: Handler<K>): void;
  clear(): void;
}

export function createGameBus(): GameBus {
  const handlers = new Map<keyof AllEvents, Set<(payload: unknown) => void>>();
  const bus: GameBus = {
    emit(event, payload) {
      handlers.get(event)?.forEach((h) => {
        try {
          h(payload);
        } catch (e) {
          console.error(`[bus] handler for "${String(event)}" threw`, e);
        }
      });
    },
    on(event, handler) {
      if (!handlers.has(event)) handlers.set(event, new Set());
      handlers.get(event)!.add(handler as (payload: unknown) => void);
      return () => bus.off(event, handler);
    },
    off(event, handler) {
      handlers.get(event)?.delete(handler as (payload: unknown) => void);
    },
    clear() {
      handlers.clear();
    },
  };
  return bus;
}
