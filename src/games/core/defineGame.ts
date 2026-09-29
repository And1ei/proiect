import { lazy } from 'react';
import type { GameDefinition, GameDefinitionInput } from './types';

/** Builds a GameDefinition, wrapping `load` in React.lazy (the chunk loads on first render or preload). */
export function defineGame(input: GameDefinitionInput): GameDefinition {
  if (import.meta.env.DEV) {
    if (!/^[a-z0-9-]+$/.test(input.id)) throw new Error(`[games] id "${input.id}" must be lowercase with hyphens`);
    if (input.instructions.length < 1) throw new Error(`[games] ${input.id}: add at least one instruction`);
  }
  return { ...input, Component: lazy(input.load), HowTo: input.howTo ? lazy(input.howTo) : undefined };
}
