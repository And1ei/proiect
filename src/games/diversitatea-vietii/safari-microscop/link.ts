// Game-specific channel between the microscope scene and its React wrapper (as in Poarta membranei):
// the observation card, the group and type buttons, the carnet and notices live in the DOM; the
// shared bus still carries hit / miss / life-lost / score / recap / finished to the shell.
import type { GroupId, TypeId } from '../../../content/ro/safari-organisms.ts';

export interface LinkOut {
  ready: Record<string, never>;
  slide: { index: number; total: number; slideId: string };
  /** Between slides (banner) and at the end. */
  phase: { kind: 'banner' | 'play' | 'done' };
  /** The organism whose card is shown, or null. `tutorial`: underline its deciding clue for free. */
  select: { id: string | null; tutorial: boolean };
  result: { id: string; outcome: 'correct' | 'wrong' | 'escaped'; picked?: GroupId };
  /** Advanced: the organism is waiting for its type. */
  'type-step': { id: string | null };
  'type-result': { id: string; correct: boolean };
  carnet: { id: string };
  notice: { key: 'tutorial' | 'slow' | 'pickFirst' | 'hintNone' };
  'hint-used': { id: string };
}

export interface LinkIn {
  pick: { group: GroupId };
  'pick-type': { type: TypeId };
  hint: Record<string, never>;
}

type All = LinkOut & LinkIn;
type Handler<K extends keyof All> = (payload: All[K]) => void;

export interface SafariLink {
  emit<K extends keyof All>(event: K, payload: All[K]): void;
  on<K extends keyof All>(event: K, handler: Handler<K>): () => void;
  clear(): void;
}

export function createSafariLink(): SafariLink {
  const handlers = new Map<keyof All, Set<(p: unknown) => void>>();
  return {
    emit(event, payload) {
      handlers.get(event)?.forEach((h) => {
        try {
          h(payload);
        } catch (e) {
          console.error(`[safari link] "${String(event)}" handler threw`, e);
        }
      });
    },
    on(event, handler) {
      if (!handlers.has(event)) handlers.set(event, new Set());
      const set = handlers.get(event)!;
      set.add(handler as (p: unknown) => void);
      return () => set.delete(handler as (p: unknown) => void);
    },
    clear: () => handlers.clear(),
  };
}
