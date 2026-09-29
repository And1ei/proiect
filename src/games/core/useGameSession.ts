import { useState } from 'react';
import { useStore } from 'zustand';
import { createGameSession, type GameSession, type SessionState } from './session';
import type { GameDefinition } from './types';

/**
 * Creates this shell's session store once (StrictMode-safe: useState's initializer result is kept).
 * Runs are separated with session.restart() / reset(), which replace the whole state.
 */
export function useGameSession(definition: GameDefinition): GameSession {
  const [session] = useState(() => createGameSession(definition.hud));
  return session;
}

/** Subscribes a component to one slice of the session; re-renders only when that slice changes. */
export function useSessionState<T>(session: GameSession, selector: (s: SessionState) => T): T {
  return useStore(session.store, selector);
}
