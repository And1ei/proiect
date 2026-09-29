// Game session state: one zustand store per GameShell (created by useGameSession, reset between
// runs). Games call the actions; the shell reads the state for the HUD, feel and progress.
// Phaser scenes never touch this directly: they emit bus events that <PhaserGame> maps to actions.
import { createStore, type StoreApi } from 'zustand/vanilla';
import type { GameStatus, HudConfig, Outcome, RecapItem, RunResult } from './types';
import { isStreakMilestone, multiplierFor } from './scoring';

export { MULTIPLIER_STEPS, isStreakMilestone, multiplierFor } from './scoring';

/** A point in viewport CSS px (clientX / clientY), where an action happened: floating text, bursts. */
export interface ViewportPoint {
  x: number;
  y: number;
}

export type SessionEventType = 'score' | 'hit' | 'miss' | 'life-lost' | 'hint' | 'streak' | 'near-win';

/** The most recent thing that happened; the shell turns it into sound, particles and announcements. */
export interface SessionEvent {
  id: number;
  type: SessionEventType;
  points?: number;
  streak?: number;
  at?: ViewportPoint;
}

export interface SessionState {
  status: GameStatus;
  /** True when the pause came from the tab being hidden or the window losing focus. */
  autoPaused: boolean;
  score: number;
  lives: number;
  maxLives: number;
  streak: number;
  bestStreak: number;
  multiplier: number;
  hits: number;
  misses: number;
  elapsedMs: number;
  hintsUsed: number;
  outcome: Outcome | null;
  /** Increments on every restart; Phaser games restart their scenes when it changes. */
  run: number;
  lastEvent: SessionEvent | null;
  /** "Ce ai învățat" items for the results screen (optional; see setRecap). */
  recap: RecapItem[];
}

export interface GameSession {
  store: StoreApi<SessionState>;
  get: () => SessionState;
  /** Begin (or begin again) playing from the intro screen. */
  start: () => void;
  /** Adds base × multiplier. Returns the points awarded. */
  addScore: (base: number, at?: ViewportPoint) => number;
  /** A correct action: streak +1, then addScore(base) at the new multiplier. */
  hit: (base?: number, at?: ViewportPoint) => number;
  /** A wrong or missed action: streak back to 0. */
  miss: (at?: ViewportPoint) => void;
  /** Loses a life and the streak; the run ends as 'lost' at zero lives. */
  loseLife: (at?: ViewportPoint) => void;
  /** Counts a hint. Any hint makes the result "completat cu ajutor". */
  useHint: () => void;
  /** Tells the shell the player is close to winning (shows a near-win line once per run). */
  nearWin: () => void;
  pause: (auto?: boolean) => void;
  resume: () => void;
  /** Ends the run. `recap` (optional) replaces the current recap first. */
  finish: (outcome: Outcome, recap?: RecapItem[]) => void;
  /**
   * Sets the results-screen recap (max 3 items kept). Games that can end by losing their last life
   * keep it up to date as they go, because the run may end inside loseLife().
   */
  setRecap: (recap: RecapItem[]) => void;
  /** New run straight into 'playing' (the "Din nou" / "Ia-o de la capăt" buttons). */
  restart: () => void;
  /** Back to the intro screen with a clean state. */
  reset: () => void;
  /** Advances the clock (called by the shell while playing). Ends a countdown run at zero. */
  tick: (ms: number) => void;
  result: () => RunResult;
}

let eventId = 0;

export function createGameSession(hud: HudConfig): GameSession {
  const maxLives = Math.max(0, hud.lives ?? 0);
  const fresh = (run: number, status: GameStatus): SessionState => ({
    status,
    autoPaused: false,
    score: 0,
    lives: maxLives,
    maxLives,
    streak: 0,
    bestStreak: 0,
    multiplier: 1,
    hits: 0,
    misses: 0,
    elapsedMs: 0,
    hintsUsed: 0,
    outcome: null,
    run,
    lastEvent: null,
    recap: [],
  });

  const store = createStore<SessionState>(() => fresh(0, 'intro'));
  const { getState: get, setState: set } = store;
  const playing = () => get().status === 'playing';
  const event = (type: SessionEventType, extra: Omit<SessionEvent, 'id' | 'type'> = {}): SessionEvent => ({
    id: ++eventId,
    type,
    ...extra,
  });
  let nearWinShown = false;

  const addScore = (base: number, at?: ViewportPoint) => {
    if (!playing() || base <= 0) return 0;
    const points = Math.round(base * get().multiplier);
    set((s) => ({ score: s.score + points, lastEvent: event('score', { points, at }) }));
    return points;
  };

  const MAX_RECAP = 3;
  const setRecap = (recap: RecapItem[]) => {
    const s = get().status;
    if (s !== 'playing' && s !== 'paused') return;
    set({ recap: recap.slice(0, MAX_RECAP) });
  };

  const finish = (outcome: Outcome, recap?: RecapItem[]) => {
    const s = get().status;
    if (s !== 'playing' && s !== 'paused') return;
    if (recap) setRecap(recap);
    set({ status: outcome, outcome, autoPaused: false });
  };

  const loseLife = (at?: ViewportPoint) => {
    if (!playing() || maxLives === 0) return;
    const lives = Math.max(0, get().lives - 1);
    set((s) => ({ lives, streak: 0, multiplier: 1, misses: s.misses + 1, lastEvent: event('life-lost', { at }) }));
    if (lives === 0) finish('lost');
  };

  return {
    store,
    get,
    start: () => {
      nearWinShown = false;
      set(fresh(get().run + 1, 'playing'));
    },
    addScore,
    hit: (base = 10, at?: ViewportPoint) => {
      if (!playing()) return 0;
      const s = get();
      const streak = s.streak + 1;
      const multiplier = multiplierFor(streak);
      const points = Math.round(base * multiplier);
      set({
        streak,
        multiplier,
        hits: s.hits + 1,
        bestStreak: Math.max(s.bestStreak, streak),
        score: s.score + points,
        lastEvent: event(isStreakMilestone(streak) ? 'streak' : 'hit', { streak, points, at }),
      });
      return points;
    },
    miss: (at?: ViewportPoint) => {
      if (!playing()) return;
      set((s) => ({ streak: 0, multiplier: 1, misses: s.misses + 1, lastEvent: event('miss', { at }) }));
    },
    loseLife,
    useHint: () => {
      if (!playing()) return;
      set((s) => ({ hintsUsed: s.hintsUsed + 1, lastEvent: event('hint') }));
    },
    nearWin: () => {
      if (!playing() || nearWinShown) return;
      nearWinShown = true;
      set({ lastEvent: event('near-win') });
    },
    pause: (auto = false) => {
      if (playing()) set({ status: 'paused', autoPaused: auto });
    },
    resume: () => {
      if (get().status === 'paused') set({ status: 'playing', autoPaused: false });
    },
    finish,
    setRecap,
    restart: () => {
      nearWinShown = false;
      set(fresh(get().run + 1, 'playing'));
    },
    reset: () => {
      nearWinShown = false;
      set(fresh(get().run + 1, 'intro'));
    },
    tick: (ms: number) => {
      if (!playing()) return;
      const elapsedMs = get().elapsedMs + ms;
      set({ elapsedMs });
      const t = hud.timer;
      if (t?.mode === 'down' && t.limitMs && elapsedMs >= t.limitMs) finish(t.onTimeUp ?? 'lost');
    },
    result: () => {
      const s = get();
      return {
        outcome: s.outcome ?? 'lost',
        score: s.score,
        lives: s.lives,
        maxLives: s.maxLives,
        bestStreak: s.bestStreak,
        misses: s.misses,
        hits: s.hits,
        hintsUsed: s.hintsUsed,
        elapsedMs: s.elapsedMs,
        ...(s.recap.length ? { recap: s.recap } : {}),
      };
    },
  };
}
