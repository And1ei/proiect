// The game engine of "Echilibrul": owns the model state and everything that happens over the ten
// years (event schedule with telegraphs, tools with cooldowns, yearly health, extinctions and their
// causes, the Inventar pauses). No React or DOM: the component drives it with requestAnimationFrame
// and turns the returned happenings into session calls, announcements and UI.
import type { ScenarioId } from '../../content/ro/ecosystem-species';
import {
  DANGER_BELOW,
  SAFE_BAND,
  createRng,
  initialState,
  rates,
  reintroduce,
  sampleCounts,
  step,
  type Model,
  type ModelState,
  type Rng,
} from './ecosystemModel.ts';
import {
  HELP_DELAY_YEARS,
  HELP_SOFTEN,
  REINTRODUCE_LEVEL,
  SCENARIO_CONFIG,
  TELEGRAPH_S,
  TOOLS,
  YEARS,
  YEAR_SECONDS,
  type ScenarioConfig,
  type ScheduledEvent,
  type ToolId,
} from './scenarios.ts';
import { modelFor, modifiersAt, type Active } from './simulation.ts';

export type EventPhase = 'scheduled' | 'telegraphed' | 'active' | 'over';

export interface GameEvent extends ScheduledEvent {
  n: number;
  phase: EventPhase;
  strength: number;
  /** Species that went critical / extinct while this event was the likely cause. */
  critical: string[];
  lost: string[];
}

export type Happening =
  | { type: 'telegraph'; event: GameEvent }
  | { type: 'event-start'; event: GameEvent }
  | { type: 'event-end'; event: GameEvent }
  | { type: 'year'; year: number; healthy: boolean }
  | { type: 'critical'; index: number }
  | { type: 'extinct'; index: number; cause: GameEvent | null }
  | { type: 'crisis'; on: boolean }
  | { type: 'help' }
  | { type: 'inventory'; year: number; counts: number[] }
  | { type: 'end' };

export interface ToolStatus {
  state: 'ready' | 'active' | 'cooldown' | 'used';
  /** Years left of the current state (active or cooldown). */
  left: number;
}

const HISTORY_EVERY = 0.05;
/** An extinction or critical drop is blamed on an event that started within this many years. */
const BLAME_WINDOW = 2.5;

export class EcoEngine {
  readonly scenario: ScenarioId;
  readonly cfg: ScenarioConfig;
  readonly model: Model;
  private rng: Rng;
  state: ModelState;
  events: GameEvent[];
  actives: Active[] = [];
  history: { t: number; x: number[] }[] = [];
  /** Where each tool was last used (years) and the one-shot flag of Reintrodu. */
  private toolUsedAt: Partial<Record<ToolId, number>> = {};
  private reintroduceUsed = false;
  private year = 0;
  private outsideThisYear = 0;
  private criticalNow: boolean[];
  private inventoriesDone = new Set<number>();
  /** True while waiting for the player to finish an Inventar. */
  waiting = false;
  done = false;
  crisis = false;

  constructor(scenario: ScenarioId, seed: number) {
    this.scenario = scenario;
    this.cfg = SCENARIO_CONFIG[scenario];
    this.model = modelFor(this.cfg);
    this.rng = createRng(seed);
    this.state = initialState(this.model, this.rng);
    this.events = this.cfg.events.map((e, n) => ({ ...e, n, phase: 'scheduled', strength: 1, critical: [], lost: [] }));
    this.criticalNow = this.model.ids.map(() => false);
    this.history.push({ t: 0, x: [...this.state.x] });
  }

  get t() {
    return this.state.t;
  }

  /** Seconds (real, at ×1) until an event starts. */
  secondsUntil(e: GameEvent) {
    return Math.max(0, (e.at - this.state.t) * YEAR_SECONDS);
  }

  /** Per-capita growth rates now (for trends). */
  rates() {
    return rates(this.model, this.state, modifiersAt(this.model, this.actives, this.state.t));
  }

  /** Advances by `realSeconds` × `speed`. Returns what happened, in order. */
  advance(realSeconds: number, speed: number): Happening[] {
    const out: Happening[] = [];
    if (this.done || this.waiting) return out;
    let left = Math.min(realSeconds, 0.25) * speed / YEAR_SECONDS; // years
    while (left > 1e-9 && !this.done && !this.waiting) {
      const h = Math.min(left, HISTORY_EVERY);
      left -= h;
      this.tick(h, out);
    }
    return out;
  }

  private tick(h: number, out: Happening[]) {
    const s0 = this.state;
    // events: telegraph → start → end
    for (const e of this.events) {
      if (e.phase === 'scheduled' && (e.at - s0.t) * YEAR_SECONDS <= TELEGRAPH_S) {
        e.phase = 'telegraphed';
        out.push({ type: 'telegraph', event: e });
      }
      if (e.phase === 'telegraphed' && s0.t >= e.at) {
        e.phase = 'active';
        this.actives.push({ kind: 'event', target: e.effect.target, from: e.at, to: e.at + e.lasts, effect: e.effect, strength: e.strength });
        out.push({ type: 'event-start', event: e });
      }
      if (e.phase === 'active' && s0.t >= e.at + e.lasts) {
        e.phase = 'over';
        out.push({ type: 'event-end', event: e });
      }
    }

    const mods = modifiersAt(this.model, this.actives, s0.t);
    const s = step(this.model, s0, h, mods, this.rng);
    this.state = s;
    if (s.crisis !== this.crisis) {
      this.crisis = s.crisis;
      out.push({ type: 'crisis', on: s.crisis });
    }

    // extinctions and critical drops, blamed on the most recent event within the window
    s.x.forEach((x, i) => {
      const blame = this.recentEvent();
      if (s.extinct[i] && !s0.extinct[i]) {
        if (blame && !blame.lost.includes(this.model.ids[i])) blame.lost.push(this.model.ids[i]);
        out.push({ type: 'extinct', index: i, cause: blame });
        this.softenNextEvent(out);
      }
      const critical = !s.extinct[i] && x < DANGER_BELOW;
      if (critical && !this.criticalNow[i]) {
        if (blame && !blame.critical.includes(this.model.ids[i])) blame.critical.push(this.model.ids[i]);
        out.push({ type: 'critical', index: i });
      }
      this.criticalNow[i] = critical;
    });

    // yearly health
    if (s.x.some((x, i) => s.extinct[i] || x < SAFE_BAND[0] || x > SAFE_BAND[1])) this.outsideThisYear += h;
    // one chart point every HISTORY_EVERY years, however small the frames are
    if (s.t - this.history[this.history.length - 1].t >= HISTORY_EVERY - 1e-9) this.history.push({ t: s.t, x: [...s.x] });
    const year = Math.floor(s.t + 1e-9);
    if (year > this.year) {
      this.year = year;
      out.push({ type: 'year', year, healthy: this.outsideThisYear < 0.25 });
      this.outsideThisYear = 0;
      if (this.cfg.inventory.includes(year) && !this.inventoriesDone.has(year)) {
        this.inventoriesDone.add(year);
        this.waiting = true;
        out.push({ type: 'inventory', year, counts: sampleCounts(s, this.model.ids.map((id) => this.cfg.abundance[id]), this.rng) });
        return;
      }
      if (year >= YEARS) this.finish(out);
    }
  }

  private finish(out: Happening[]) {
    this.done = true;
    out.push({ type: 'end' });
  }

  /** Called when the player closes the Inventar. */
  resume(): Happening[] {
    const out: Happening[] = [];
    this.waiting = false;
    if (this.year >= YEARS) this.finish(out);
    return out;
  }

  private recentEvent(): GameEvent | null {
    const t = this.state.t;
    const candidates = this.events.filter((e) => (e.phase === 'active' || e.phase === 'over') && t - e.at <= BLAME_WINDOW && t >= e.at);
    return candidates.length ? candidates[candidates.length - 1] : null;
  }

  /** Adaptive help: after an extinction, the next not-yet-announced event comes later and weaker. */
  private softenNextEvent(out: Happening[]) {
    const next = this.events.find((e) => e.phase === 'scheduled');
    if (!next || next.strength < 1) return;
    next.at = Math.min(YEARS - next.lasts - 0.2, next.at + HELP_DELAY_YEARS);
    next.strength = HELP_SOFTEN;
    out.push({ type: 'help' });
  }

  // ── Tools ─────────────────────────────────────────────────────────
  toolStatus(tool: ToolId): ToolStatus {
    const def = TOOLS[tool];
    if (tool === 'reintroduce') return { state: this.reintroduceUsed ? 'used' : 'ready', left: 0 };
    const at = this.toolUsedAt[tool];
    if (at === undefined) return { state: 'ready', left: 0 };
    const since = this.state.t - at;
    if (since < def.lasts) return { state: 'active', left: def.lasts - since };
    if (since < def.cooldown) return { state: 'cooldown', left: def.cooldown - since };
    return { state: 'ready', left: 0 };
  }

  /** Applies a tool. Returns false (with a reason) when it can't be used now. */
  apply(tool: ToolId, index: number | null): { ok: boolean; reason?: 'busy' | 'species' | 'not-extinct' } {
    if (this.toolStatus(tool).state !== 'ready') return { ok: false, reason: 'busy' };
    const t = this.state.t;
    if (tool === 'regenereaza') {
      this.actives.push({ kind: 'regen', target: 'producers', from: t, to: t + TOOLS.regenereaza.lasts });
      this.toolUsedAt.regenereaza = t;
      return { ok: true };
    }
    if (index === null) return { ok: false, reason: 'species' };
    if (tool === 'protejeaza') {
      if (this.state.extinct[index]) return { ok: false, reason: 'species' };
      this.actives.push({ kind: 'protect', target: this.model.ids[index], from: t, to: t + TOOLS.protejeaza.lasts });
      this.toolUsedAt.protejeaza = t;
      return { ok: true };
    }
    if (!this.state.extinct[index]) return { ok: false, reason: 'not-extinct' };
    this.state = reintroduce(this.state, index, REINTRODUCE_LEVEL);
    this.reintroduceUsed = true;
    return { ok: true };
  }

  /** Hint: the species most at risk and the tool that helps most right now. */
  hint(): { index: number; tool: ToolId } | null {
    const s = this.state;
    const extinct = s.extinct.findIndex(Boolean);
    if (extinct >= 0 && this.toolStatus('reintroduce').state === 'ready') return { index: extinct, tool: 'reintroduce' };
    const r = this.rates();
    let worst = -1;
    let worstScore = Infinity;
    s.x.forEach((x, i) => {
      if (s.extinct[i]) return;
      const score = x + r[i] * 0.5; // low and falling first
      if (score < worstScore) [worst, worstScore] = [i, score];
    });
    if (worst < 0 || worstScore > 0.85) return null;
    const hunted = this.actives.some((a) => a.kind === 'event' && a.effect?.mortality && a.target === this.model.ids[worst] && s.t < a.to);
    const producer = this.model.producer[worst];
    if ((producer || !hunted) && this.toolStatus('regenereaza').state === 'ready' && (producer || this.model.producer.some((p, i) => p && s.x[i] < 0.8))) {
      return { index: worst, tool: 'regenereaza' };
    }
    return { index: worst, tool: this.toolStatus('protejeaza').state === 'ready' ? 'protejeaza' : 'regenereaza' };
  }
}
