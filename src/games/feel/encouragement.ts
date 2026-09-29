// REVIEW: copy by Claude, needs native review (the lines live in src/content/ro/encouragement.js)
import encouragement from '../../content/ro/encouragement.js';

export type Situation = keyof typeof encouragement;

const last: Partial<Record<Situation, number>> = {};

/**
 * A random line for the situation, never the same line twice in a row within that pool.
 * {n} / {m} placeholders are filled from `vars` (streak pool).
 */
export function encourage(situation: Situation, vars: Record<string, string | number> = {}): string {
  const pool = encouragement[situation];
  let i = Math.floor(Math.random() * pool.length);
  if (pool.length > 1 && i === last[situation]) i = (i + 1 + Math.floor(Math.random() * (pool.length - 1))) % pool.length;
  last[situation] = i;
  return pool[i].replace(/\{(\w+)\}/g, (m: string, k: string) => (k in vars ? String(vars[k]) : m));
}
