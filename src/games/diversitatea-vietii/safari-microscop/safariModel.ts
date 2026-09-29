// The run of "Safari la microscop" as pure functions (unit-tested in safariModel.test.ts): which
// organism drifts in next, spaced repetition of misses, the gentle first slide and the slowdown after
// three misses in a row. No Phaser here; the scene asks this model what to do.
import { organismsFor, slidesFor, MODE_GROUPS, type GroupId, type SafariMode } from '../../../content/ro/safari-organisms.ts';

export const TUNING = {
  /** Seconds between spawns, per slide index (the first slide is gentle). */
  spawnS: [3.2, 2.4, 2.1, 2.0],
  /** Seconds an organism takes to cross the field, per slide index. */
  crossS: [15, 13.5, 12.5, 12],
  maxOnScreen: 10,
  /** First slide: at most this many at once, so a beginner can read the cards. */
  gentleMax: 3,
  /** A missed or wrongly sorted organism comes back at most this many times. */
  maxReturns: 2,
  missesBeforeHelp: 3,
  helpS: 20,
  helpFactor: 0.6,
};

export interface SafariRun {
  mode: SafariMode;
  slides: string[];
  slideIndex: number;
  /** Organism ids still to spawn on this slide, in order. */
  queue: string[];
  /** Ids carried to the next slide (missed, escaped or sorted wrong). */
  carry: string[];
  returns: Record<string, number>;
  lastSpawned: string | null;
  missesInRow: number;
  slowUntil: number;
}

export type Rng = () => number;

const shuffle = <T,>(items: T[], rng: Rng) => {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/** Reorders so the same id never comes twice in a row (when that is possible). */
export function spreadOut(ids: string[]): string[] {
  const out: string[] = [];
  const rest = [...ids];
  while (rest.length) {
    const i = rest.findIndex((id) => id !== out[out.length - 1]);
    out.push(...rest.splice(i === -1 ? 0 : i, 1));
  }
  return out;
}

export const groupsFor = (mode: SafariMode): GroupId[] => MODE_GROUPS[mode];

export function createRun(mode: SafariMode): SafariRun {
  return { mode, slides: slidesFor(mode).map((s) => s.id), slideIndex: -1, queue: [], carry: [], returns: {}, lastSpawned: null, missesInRow: 0, slowUntil: 0 };
}

/** Moves to the next slide: its own organisms, shuffled, with the carried ones mixed in. */
export function startSlide(run: SafariRun, rng: Rng): SafariRun {
  const slideIndex = run.slideIndex + 1;
  const slideId = run.slides[slideIndex];
  const own = organismsFor(run.mode).filter((o) => o.slide === slideId).map((o) => o.id);
  // carried ones come after the first own organism, so a slide always opens with its own sample
  const [first, ...others] = shuffle(own, rng);
  const queue = spreadOut([first, ...shuffle([...others, ...run.carry], rng)].filter(Boolean));
  return { ...run, slideIndex, queue, carry: [] };
}

export const isLastSlide = (run: SafariRun) => run.slideIndex >= run.slides.length - 1;

/** The next organism to spawn, or null (nothing left, too many on screen, or only a repeat left). */
export function nextSpawn(run: SafariRun, onScreen: string[]): { run: SafariRun; id: string | null } {
  const cap = run.slideIndex === 0 ? TUNING.gentleMax : TUNING.maxOnScreen;
  if (onScreen.length >= cap || !run.queue.length) return { run, id: null };
  const i = run.queue.findIndex((id) => id !== run.lastSpawned && !onScreen.includes(id));
  if (i === -1) return { run, id: null };
  const queue = [...run.queue];
  const [id] = queue.splice(i, 1);
  return { run: { ...run, queue, lastSpawned: id }, id };
}

export type Outcome = 'correct' | 'wrong' | 'escaped';

/**
 * Records what happened to an organism. Wrong and escaped ones return later (next slide, or later on
 * the last slide), at most maxReturns times. Three misses in a row slow the field for a while.
 */
export function record(run: SafariRun, id: string, outcome: Outcome, now: number): { run: SafariRun; slowed: boolean } {
  if (outcome === 'correct') return { run: { ...run, missesInRow: 0 }, slowed: false };
  const times = run.returns[id] ?? 0;
  let next: SafariRun = { ...run, returns: { ...run.returns, [id]: times + 1 } };
  if (times < TUNING.maxReturns) {
    next = isLastSlide(run) ? { ...next, queue: spreadOut([...next.queue, id]) } : { ...next, carry: [...next.carry, id] };
  }
  const missesInRow = run.missesInRow + 1;
  if (missesInRow >= TUNING.missesBeforeHelp) return { run: { ...next, missesInRow: 0, slowUntil: now + TUNING.helpS }, slowed: true };
  return { run: { ...next, missesInRow }, slowed: false };
}

/** Speed multiplier for drift and spawns (adaptive help). */
export const speedAt = (run: SafariRun, now: number) => (now < run.slowUntil ? TUNING.helpFactor : 1);

export const spawnSeconds = (run: SafariRun) => TUNING.spawnS[Math.min(run.slideIndex, TUNING.spawnS.length - 1)];
export const crossSeconds = (run: SafariRun) => TUNING.crossS[Math.min(run.slideIndex, TUNING.crossS.length - 1)];

export const slideDone = (run: SafariRun, onScreen: string[]) => run.queue.length === 0 && onScreen.length === 0;
