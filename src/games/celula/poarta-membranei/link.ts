// Game-specific channel between the membrane scene and its React wrapper, for what the shared bus
// doesn't cover: the DOM strip under the canvas (selection, explanations, notices, the osmosis
// controls, ATP) and requests from DOM buttons (hint, salt/dilute). The shared bus still carries
// hit / miss / life-lost / score / finished / recap to the shell.
//
// One link per mounted game. The scene gets it through its constructor (see scene factory in
// MembraneGame.tsx), so no globals and no React or zustand inside the scene.
import type { OsmosisStep } from './config';
import type { Tonicity, VolumeZone } from './osmosisModel';

export type PhaseInfo =
  | { kind: 'wave'; index: number; total: number; waveNumber: number; waves: number }
  | { kind: 'osmosis'; index: number; total: number }
  | { kind: 'break'; next: 'wave' | 'osmosis' | 'end'; waveNumber: number; waves: number }
  | { kind: 'done' };

export interface OsmosisInfo {
  volume: number;
  cOut: number;
  zone: VolumeZone;
  tonicity: Tonicity;
  /** Seconds left in the event. */
  left: number;
}

/** Scene → React */
export interface LinkOut {
  ready: Record<string, never>;
  phase: PhaseInfo;
  /** The molecule the keyboard/tap selection is on (situation id), or null. */
  select: { id: string | null; uid: number | null };
  /** A routing result the player should read: wrong gate, too late, or the pump had no ATP. */
  explain: { id: string; kind: 'wrong' | 'late' | 'no-atp' };
  /** A correct route (to clear a stale explanation). */
  correct: { id: string };
  notice: { key: 'slow' | 'tutorial' | 'hint-none' };
  /** A hint was shown: the wrapper calls session.useHint(). */
  'hint-used': Record<string, never>;
  osmosis: OsmosisInfo;
  'osmosis-change': { say: OsmosisStep['say'] };
  takeaway: { key: 'perfuzie' | 'crenare' };
  atp: { value: number; max: number };
}

/** React → scene */
export interface LinkIn {
  hint: Record<string, never>;
  adjust: { dir: 1 | -1 };
}

type All = LinkOut & LinkIn;
type Handler<K extends keyof All> = (payload: All[K]) => void;

export interface MembraneLink {
  emit<K extends keyof All>(event: K, payload: All[K]): void;
  on<K extends keyof All>(event: K, handler: Handler<K>): () => void;
  clear(): void;
}

export function createMembraneLink(): MembraneLink {
  const handlers = new Map<keyof All, Set<(payload: unknown) => void>>();
  return {
    emit(event, payload) {
      handlers.get(event)?.forEach((h) => {
        try {
          h(payload);
        } catch (e) {
          console.error(`[membrane link] "${String(event)}" handler threw`, e);
        }
      });
    },
    on(event, handler) {
      if (!handlers.has(event)) handlers.set(event, new Set());
      const set = handlers.get(event)!;
      set.add(handler as (payload: unknown) => void);
      return () => set.delete(handler as (payload: unknown) => void);
    },
    clear() {
      handlers.clear();
    },
  };
}
