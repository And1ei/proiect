// "Echilibrul": React + SVG (no Phaser). A requestAnimationFrame loop advances the engine; the view
// re-renders about ten times a second. Both scenarios share this component (`scenario` prop).
//
// Session mapping: a healthy year → hit (streak × multiplier); an unhealthy year → miss; an
// extinction → loseLife (the recap is set first, since the run can end right there); the end of
// year ten → finish('won', recap). Inventar points → addScore.
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { cx } from '../../lib/cx';
import { spring } from '../../lib/motion';
import { useReducedMotion } from '../../lib/motionPreference';
import Sprite from '../../components/illustration/Sprite';
import LiveRegion, { useAnnouncer } from '../core/LiveRegion';
import { useSessionState } from '../core/useGameSession';
import type { GameProps, RecapItem } from '../core/types';
import { ECO, fill } from '../../content/ro/games/echilibrul';
import { GUILD_NAME, SCENARIOS, type ScenarioId } from '../../content/ro/ecosystem-species';
import { levelOf, trendOf, type Level } from './ecosystemModel';
import { EcoEngine, type GameEvent, type Happening } from './engine';
import { POINTS_PER_YEAR, TOOLS, YEARS, type ToolId } from './scenarios';
import { VIEW, seasonOf } from './view';
import ScenePlate from './ScenePlate';
import FoodWeb from './FoodWeb';
import PopChart from './PopChart';
import Inventar from './Inventar';

const TOOL_IDS: ToolId[] = ['protejeaza', 'regenereaza', 'reintroduce'];
const RENDER_MS = 100;

type Note = { n: number; kind: 'tip' | 'help' | 'crisis' | 'extinct' | 'tool' | 'hint' | 'year'; text: string };

function Keycap({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex min-w-[1.5em] items-center justify-center rounded-[5px] border border-ink-faint bg-paper-bright px-1 font-mono text--2 font-medium leading-tight text-ink shadow-[0_1.5px_0_var(--ink-faint)]">
      {children}
    </kbd>
  );
}

const LEVEL_MARK: Record<Level, string> = { disparut: '×', critic: '!!', scazut: '!', normal: '', ridicat: '↑' };

export default function EcoGame({ session, scenario: scenarioId }: GameProps & { scenario: ScenarioId }) {
  const scenario = SCENARIOS[scenarioId];
  const reduced = useReducedMotion();
  const status = useSessionState(session, (s) => s.status);
  const engineRef = useRef<EcoEngine | null>(null);
  if (!engineRef.current) engineRef.current = new EcoEngine(scenarioId, Math.floor(Math.random() * 1e9));
  const engine = engineRef.current;
  // Dev only: lets audit scripts and the console inspect the run (window.__ecoEngine)
  if (import.meta.env.DEV) (window as unknown as { __ecoEngine?: EcoEngine }).__ecoEngine = engine;

  const [, setFrame] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [selected, setSelected] = useState<number | null>(null);
  const [armed, setArmed] = useState<ToolId | null>(null);
  const [hinted, setHinted] = useState<{ index: number; tool: ToolId } | null>(null);
  const [note, setNote] = useState<Note | null>(() => ({ n: 0, kind: 'tip', text: ECO.firstTip }));
  const [inventory, setInventory] = useState<{ year: number; counts: number[] } | null>(null);
  const { polite, assertive, announce } = useAnnouncer();
  const cards = useRef<(HTMLButtonElement | null)[]>([]);
  const noteN = useRef(1);
  const say = useCallback((kind: Note['kind'], text: string, speak = true) => {
    setNote({ n: noteN.current++, kind, text });
    if (speak) announce(text);
  }, [announce]);

  const names = scenario.species.map((s) => s.name);
  const headline = useCallback((e: GameEvent) => scenario.events.find((x) => x.kind === e.kind)!.headline, [scenario]);
  const mechanism = useCallback((e: GameEvent) => scenario.events.find((x) => x.kind === e.kind)!.mechanism, [scenario]);
  const nameOf = useCallback((id: string) => scenario.species.find((s) => s.id === id)!.name, [scenario]);

  /** "Ce ai învățat": the events that caused losses first, then the rest that happened. */
  const recap = useCallback((): RecapItem[] => {
    const happened = engine.events.filter((e) => e.phase === 'active' || e.phase === 'over');
    const weight = (e: GameEvent) => e.lost.length * 10 + e.critical.length;
    return [...happened]
      .sort((a, b) => weight(b) - weight(a) || a.at - b.at)
      .slice(0, 3)
      .map((e) => {
        const consequence = e.lost.length
          ? ' ' + fill(ECO.recapLost, { event: fill(ECO.eventYear, { n: Math.floor(e.at) + 1 }), names: e.lost.map(nameOf).join(', ') })
          : e.critical.length
            ? ' ' + fill(ECO.recapCritical, { event: fill(ECO.eventYear, { n: Math.floor(e.at) + 1 }), names: e.critical.map(nameOf).join(', ') })
            : '';
        return { title: headline(e), text: `${mechanism(e)}${consequence}` };
      });
  }, [engine, headline, mechanism, nameOf]);

  // ── Happenings → session, announcements, notes ──
  const handle = useCallback(
    (h: Happening) => {
      switch (h.type) {
        case 'telegraph':
          announce(`${headline(h.event)}. ${fill(ECO.soon, { n: Math.round(engine.secondsUntil(h.event)) })}.`);
          break;
        case 'event-start':
          announce(`${headline(h.event)}. ${mechanism(h.event)}`);
          break;
        case 'year':
          if (h.healthy) session.hit(POINTS_PER_YEAR);
          else session.miss();
          if (h.year < YEARS) announce(`${fill(ECO.year, { n: h.year + 1, total: YEARS })}. ${h.healthy ? ECO.healthyYear : ECO.unhealthyYear}`);
          break;
        case 'critical':
          announce(fill(ECO.summary, { name: names[h.index], trend: ECO.trends.scadere, level: ECO.levels.critic }));
          break;
        case 'extinct':
          session.setRecap(recap());
          say('extinct', fill(ECO.extinct, { name: names[h.index] }));
          session.loseLife();
          break;
        case 'help':
          say('help', ECO.help);
          break;
        case 'crisis':
          if (h.on) say('crisis', ECO.crisis);
          else setNote((n) => (n?.kind === 'crisis' ? null : n));
          break;
        case 'inventory':
          setInventory({ year: h.year, counts: h.counts });
          break;
        case 'end':
          session.finish('won', recap());
          break;
      }
    },
    [announce, engine, headline, mechanism, names, recap, say, session],
  );

  // ── The loop ──
  useEffect(() => {
    if (status !== 'playing' || inventory) return undefined;
    let raf = 0;
    let last = performance.now();
    let lastRender = 0;
    const loop = (now: number) => {
      const happened = engine.advance((now - last) / 1000, speed);
      last = now;
      happened.forEach(handle);
      if (happened.length || now - lastRender > RENDER_MS) {
        lastRender = now;
        setFrame((f) => f + 1);
      }
      if (!engine.done) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [status, inventory, engine, speed, handle]);

  // ── Tools ──
  const applyTool = useCallback(
    (tool: ToolId, index: number | null) => {
      const r = engine.apply(tool, index);
      if (!r.ok) {
        if (r.reason === 'not-extinct') say('tool', ECO.toolNeedsExtinct);
        else if (r.reason === 'species') setArmed(tool);
        return;
      }
      setArmed(null);
      setHinted(null);
      const target = tool === 'regenereaza' ? ECO.producers : index !== null ? names[index] : '';
      say('tool', fill(ECO.toolApplied, { tool: ECO.tools[tool].name, target }));
      setFrame((f) => f + 1);
    },
    [engine, names, say],
  );

  const pickTool = (tool: ToolId) => {
    if (engine.toolStatus(tool).state !== 'ready') return;
    if (!TOOLS[tool].needsSpecies) return applyTool(tool, null);
    setArmed((a) => (a === tool ? null : tool));
  };

  const pickSpecies = (i: number) => {
    setSelected(i);
    if (armed) applyTool(armed, i);
  };

  const hint = () => {
    const h = engine.hint();
    session.useHint();
    if (!h) {
      say('hint', ECO.hintNone);
      return;
    }
    setHinted(h);
    setSelected(h.index);
    say('hint', fill(ECO.hintText, { name: names[h.index], tool: ECO.tools[h.tool].name }));
  };

  // ── Keyboard: ← → species, 1 2 3 tools, Enter apply, H hint, Space pause ──
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (inventory || (e.target as HTMLElement).tagName === 'INPUT') return;
    const n = scenario.species.length;
    const focusCard = (i: number) => {
      setSelected(i);
      cards.current[i]?.focus();
    };
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const cur = selected ?? (e.key === 'ArrowRight' ? -1 : 0);
      focusCard((cur + (e.key === 'ArrowRight' ? 1 : n - 1)) % n);
    } else if (/^[1-3]$/.test(e.key)) {
      pickTool(TOOL_IDS[Number(e.key) - 1]);
    } else if (e.key === 'Enter' && armed && selected !== null && (e.target as HTMLElement).tagName !== 'BUTTON') {
      e.preventDefault();
      applyTool(armed, selected);
    } else if (e.key.toLowerCase() === 'h') {
      hint();
    } else if (e.key === ' ' && (e.target as HTMLElement).tagName !== 'BUTTON') {
      e.preventDefault();
      session.pause();
    }
  };

  // ── Derived view data ──
  const s = engine.state;
  const r = engine.rates();
  const year = Math.min(YEARS, Math.floor(s.t) + 1);
  const yearFrac = s.t - Math.floor(s.t);
  const producerIndex = scenario.species.findIndex((x) => x.guild === 'producator');
  const bloom = Math.max(0, s.x[producerIndex] - 1.3);
  const logEvents = engine.events.filter((e) => e.phase !== 'scheduled').slice().reverse();
  const summaries = scenario.species.map((sp, i) =>
    fill(ECO.summary, { name: sp.name, trend: ECO.trends[s.extinct[i] ? 'stabil' : trendOf(r[i])], level: ECO.levels[levelOf(s.x[i], s.extinct[i])] }),
  );
  const inspect = selected !== null ? scenario.species[selected] : null;
  const title = scenarioId === 'balta' ? ECO.balta.title : ECO.padure.title;

  const history = useMemo(() => engine.history, [engine, s.t]); // eslint-disable-line react-hooks/exhaustive-deps

  if (inventory) {
    return (
      <div data-game-stage tabIndex={-1} className="focus:outline-none">
        <Inventar
          scenario={scenario}
          year={inventory.year}
          counts={inventory.counts}
          announce={announce}
          onDone={(points) => {
            if (points > 0) session.addScore(points);
            setInventory(null);
            engine.resume().forEach(handle);
          }}
        />
        <LiveRegion polite={polite} assertive={assertive} />
      </div>
    );
  }

  return (
    <div data-game-stage tabIndex={-1} onKeyDown={onKeyDown} aria-label={`${title}. ${ECO.stage}`} role="group" className="flex flex-col gap-4 focus:outline-none">
      {/* Year strip */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <p className="flex items-baseline gap-2">
          <span className="text-display text-2 leading-none">{fill(ECO.year, { n: year, total: YEARS })}</span>
          <span className="text-label text-ink-soft">{ECO.seasons[seasonOf(s.t)]}</span>
        </p>
        <div aria-hidden="true" className="relative h-2 min-w-24 flex-1 overflow-hidden rounded-full bg-paper-deep shadow-well">
          <span className="absolute inset-y-0 left-0 rounded-full bg-methylene-200" style={{ width: `${((s.t) / YEARS) * 100}%` }} />
          <span className="absolute inset-y-0 w-px bg-methylene-deep" style={{ left: `${((Math.floor(s.t) + yearFrac) / YEARS) * 100}%` }} />
        </div>
        <div role="group" aria-label={ECO.speed} className="flex items-center gap-1">
          {[1, 2].map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={speed === v}
              onClick={() => setSpeed(v)}
              className={cx('text-label min-h-11 min-w-11 rounded-tag px-2 font-mono', speed === v ? 'bg-methylene-100 text-methylene-deep' : 'text-ink-soft hover:bg-paper-deep')}
            >
              {fill(ECO.speedValue, { n: v })}
            </button>
          ))}
        </div>
        <button type="button" onClick={hint} aria-keyshortcuts="H" className="text-label inline-flex min-h-11 items-center gap-2 rounded-btn-b bg-methylene-50 px-4 text-methylene-deep shadow-rest">
          {ECO.hint} <Keycap>{ECO.hintKey}</Keycap>
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-4">
          {/* The plate */}
          <div className="relative overflow-hidden rounded-well shadow-well">
            <ScenePlate scenario={scenario} t={s.t} x={s.x} extinct={s.extinct} bloom={bloom} crisis={engine.crisis} selected={selected} reduced={reduced} />
            <ul className="sr-only">
              {summaries.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>

          {/* Tools */}
          <div role="group" aria-label="Unelte" className="grid gap-2 sm:grid-cols-3">
            {TOOL_IDS.map((tool) => {
              const st = engine.toolStatus(tool);
              const def = TOOLS[tool];
              const isArmed = armed === tool;
              const suggested = hinted?.tool === tool;
              const progress = st.state === 'active' ? st.left / def.lasts : st.state === 'cooldown' ? 1 - st.left / (def.cooldown - def.lasts) : 0;
              return (
                <motion.button
                  key={tool}
                  type="button"
                  aria-pressed={def.needsSpecies ? isArmed : undefined}
                  aria-keyshortcuts={String(def.key)}
                  aria-disabled={st.state !== 'ready'}
                  onClick={() => pickTool(tool)}
                  whileTap={st.state === 'ready' && !reduced ? { scaleX: 1.04, scaleY: 0.94 } : undefined}
                  transition={spring}
                  title={ECO.tools[tool].help}
                  className={cx(
                    'relative flex min-h-14 flex-col items-start gap-1 overflow-hidden rounded-well px-3 py-2 text-left shadow-rest',
                    isArmed ? 'bg-methylene-100 ring-2 ring-methylene-deep' : 'bg-paper-bright',
                    st.state !== 'ready' && 'opacity-70',
                    suggested && 'outline-dashed outline-2 outline-offset-2 outline-methylene-deep',
                  )}
                >
                  <span className="flex w-full items-center justify-between gap-2">
                    <span className="font-medium">{ECO.tools[tool].name}</span>
                    <Keycap>{String(def.key)}</Keycap>
                  </span>
                  <span className="text-label text-ink-soft">
                    {isArmed ? ECO.toolState.pick : ECO.toolState[st.state]}
                  </span>
                  {(st.state === 'active' || st.state === 'cooldown') && (
                    <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1 bg-paper-deep">
                      <span className={cx('block h-full', st.state === 'active' ? 'bg-methylene' : 'bg-ink-faint')} style={{ width: `${progress * 100}%` }} />
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Species cards */}
          <div role="group" aria-label="Specii" className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {scenario.species.map((sp, i) => {
              const level = levelOf(s.x[i], s.extinct[i]);
              const trend = s.extinct[i] ? 'stabil' : trendOf(r[i]);
              const bad = level !== 'normal';
              return (
                <button
                  key={sp.id}
                  ref={(el) => {
                    cards.current[i] = el;
                  }}
                  type="button"
                  aria-pressed={selected === i}
                  aria-label={`${summaries[i]}${armed ? `. ${ECO.tools[armed].name}` : ''}`}
                  onClick={() => pickSpecies(i)}
                  onFocus={() => setSelected(i)}
                  className={cx(
                    'flex min-h-11 flex-col items-start gap-1 rounded-well px-2.5 py-2 text-left shadow-well transition-colors',
                    selected === i ? 'bg-methylene-50 ring-2 ring-methylene-deep' : 'bg-paper',
                    armed && 'outline-dashed outline-1 outline-offset-2 outline-methylene',
                    hinted?.index === i && 'outline-dashed outline-2 outline-offset-2 outline-eosin-deep',
                  )}
                >
                  <span className={cx(s.extinct[i] && 'opacity-40')}>
                    <Sprite id={sp.sprite} size="sm" tone={VIEW[scenarioId].species[sp.id].tone} />
                  </span>
                  <span className="text--1 font-medium leading-tight">{sp.name}</span>
                  <span className={cx('text-label flex items-center gap-1.5', bad ? 'text-eosin-deep' : 'text-ink-soft')}>
                    {LEVEL_MARK[level] && <span aria-hidden="true" className="font-mono">{LEVEL_MARK[level]}</span>}
                    {ECO.levels[level]}
                    {!s.extinct[i] && (
                      <span aria-hidden="true" className="font-mono">
                        {trend === 'crestere' ? '↗' : trend === 'scadere' ? '↘' : '→'}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Note line + inspector */}
          <AnimatePresence mode="wait" initial={false}>
            {note && (
              <motion.p
                key={note.n}
                initial={reduced ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={spring}
                className={cx(
                  'rounded-well px-4 py-2.5 text--1 leading-body',
                  note.kind === 'extinct' || note.kind === 'crisis' ? 'bg-eosin-50' : note.kind === 'help' || note.kind === 'hint' || note.kind === 'tip' ? 'bg-methylene-50' : 'bg-paper-deep',
                )}
              >
                {note.text}
              </motion.p>
            )}
          </AnimatePresence>
          {inspect && (
            <section aria-label={ECO.inspect} className="grid gap-x-6 gap-y-2 rounded-well bg-paper-bright px-4 py-3 text--1 shadow-well sm:grid-cols-2">
              <p className="sm:col-span-2">
                <strong className="font-display text-1 font-medium">{inspect.name}</strong>{' '}
                {inspect.binomial ? <em className="text-ink-soft">{inspect.binomial}</em> : <span className="text-ink-soft">({inspect.group})</span>}
                <span className="text-label ml-2 text-ink-soft">{GUILD_NAME[inspect.guild]}</span>
              </p>
              <p className="sm:col-span-2">{inspect.role}</p>
              <p>
                <span className="text-label text-ink-soft">{ECO.eats}: </span>
                {inspect.eats.length ? inspect.eats.map(nameOf).join(', ') : ECO.nothing}
              </p>
              <p>
                <span className="text-label text-ink-soft">{ECO.eatenBy}: </span>
                {inspect.eatenBy.length ? inspect.eatenBy.map(nameOf).join(', ') : ECO.nobody}
              </p>
              <p className="text-ink-soft sm:col-span-2">{inspect.fact}</p>
            </section>
          )}
          <section aria-label={ECO.chart} className="rounded-well bg-paper-bright px-3 py-3 shadow-well">
            <h3 className="text-label px-1 text-ink-soft">{ECO.chart}</h3>
            <PopChart scenario={scenario} history={history} events={engine.events} extinct={s.extinct} />
            <p className="px-1 text--2 text-ink-soft">{ECO.chartLegend}</p>
          </section>
        </div>

        {/* Right column: food web and the journal */}
        <div className="flex min-w-0 flex-col gap-4">
          <section aria-label={ECO.web} className="rounded-well bg-paper-bright px-3 pb-2 pt-3 shadow-well">
            <h3 className="text-label px-1 text-ink-soft">{ECO.web}</h3>
            <FoodWeb scenario={scenario} x={s.x} extinct={s.extinct} selected={selected} reduced={reduced} />
            <p className="px-1 text--2 text-ink-soft">{ECO.webLegend}</p>
          </section>
          <section aria-label={ECO.log} className="flex flex-col gap-3">
            <h3 className="text-label text-ink-soft">{ECO.log}</h3>
            {logEvents.length === 0 && <p className="text--1 text-ink-soft">{ECO.quiet}</p>}
            <ol className="flex flex-col gap-3">
              <AnimatePresence initial={false}>
                {logEvents.slice(0, 3).map((e) => (
                  <motion.li
                    key={e.n}
                    layout={!reduced}
                    initial={reduced ? false : { opacity: 0, y: -10, rotate: -2 }}
                    animate={{ opacity: 1, y: 0, rotate: e.n % 2 ? 0.8 : -0.8 }}
                    transition={spring}
                    className={cx('relative rounded-[4px] bg-paper-bright px-4 pb-3 pt-4 shadow-card', e.phase === 'over' && 'opacity-80')}
                  >
                    <span aria-hidden="true" className="absolute left-1/2 top-1.5 size-2.5 -translate-x-1/2 rounded-full bg-eosin shadow-[0_1px_0_var(--eosin-deep)]" />
                    <p className="text-label flex justify-between gap-2 text-ink-soft">
                      <span>{fill(ECO.eventYear, { n: Math.floor(e.at) + 1 })}</span>
                      <span className={cx(e.phase === 'active' && 'text-eosin-deep')}>
                        {e.phase === 'telegraphed' ? fill(ECO.soon, { n: Math.ceil(engine.secondsUntil(e) / speed) }) : e.phase === 'active' ? ECO.now : ECO.over}
                      </span>
                    </p>
                    <p className="mt-1 font-display text-1 leading-heading">{headline(e)}</p>
                    {e.phase !== 'telegraphed' && <p className="mt-1 text--1 leading-body text-ink-soft">{mechanism(e)}</p>}
                  </motion.li>
                ))}
              </AnimatePresence>
            </ol>
          </section>
        </div>
      </div>


      <LiveRegion polite={polite} assertive={assertive} />
    </div>
  );
}

export function ForestGame(props: GameProps) {
  return <EcoGame {...props} scenario="padure" />;
}

export function PondGame(props: GameProps) {
  return <EcoGame {...props} scenario="balta" />;
}
