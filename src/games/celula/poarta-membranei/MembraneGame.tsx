// "Poarta membranei": the React side. Renders the Phaser scene (all gameplay), a DOM overlay for
// crisp text on top of the canvas (gate names and keys, sides, phase banners, gauge labels) and the
// strip under it (explanations, notices, the hint and osmosis controls). Both modes share this file.
//
// Scene ⇄ React: the shared bus (through <PhaserGame>) reports hits, misses, lives, score and the
// recap to the shell; the game's own link (./link.ts) carries what only this game shows.
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { cx } from '../../../lib/cx';
import { spring } from '../../../lib/motion';
import { useReducedMotion } from '../../../lib/motionPreference';
import PhaserGame from '../../phaser/PhaserGame';
import LiveRegion, { useAnnouncer } from '../../core/LiveRegion';
import type { GameProps } from '../../core/types';
import { MEMBRANE, fill } from '../../../content/ro/games/poarta-membranei';
import { moleculeById, type MembraneMode } from '../../../content/ro/membrane-molecules';
import { DESIGN, GATE_REACH, MAX_HEIGHT, MEMBRANE_HALF, MEMBRANE_Y, OSMOSIS_LAYOUT, gatesFor } from './config';
import { GATE_PROTRUDE } from './art';
import { OSMOSIS } from './osmosisModel';
import { createMembraneLink, type LinkOut, type OsmosisInfo, type PhaseInfo } from './link';
import Formula, { Keycap } from './Chem';

type Message =
  | { kind: 'explain'; id: string; how: LinkOut['explain']['kind'] }
  | { kind: 'notice'; key: LinkOut['notice']['key'] }
  | { kind: 'change'; say: LinkOut['osmosis-change']['say'] }
  | { kind: 'takeaway'; key: LinkOut['takeaway']['key'] };

const pctX = (x: number) => `${(x / DESIGN.width) * 100}%`;
const pctY = (y: number) => `${(y / DESIGN.height) * 100}%`;
const RATIO = DESIGN.width / DESIGN.height;

export default function MembraneGame({ session, mode }: GameProps & { mode: MembraneMode }) {
  const [link] = useState(createMembraneLink);
  const reduced = useReducedMotion();
  const [ready, setReady] = useState(false);
  const [phase, setPhase] = useState<PhaseInfo | null>(null);
  const [message, setMessage] = useState<{ n: number; m: Message; at: number } | null>(null);
  const [osmosis, setOsmosis] = useState<OsmosisInfo | null>(null);
  const [atp, setAtp] = useState<{ value: number; max: number } | null>(null);
  const { polite, assertive, announce } = useAnnouncer();
  const S = MEMBRANE;

  const scenes = useCallback(() => import('./scene').then((m) => m.membraneScenes(mode, link)), [mode, link]);

  useEffect(() => {
    let n = 0;
    const say = (m: Message) => setMessage({ n: ++n, m, at: performance.now() });
    const offs = [
      link.on('ready', () => setReady(true)),
      link.on('phase', (p) => {
        setPhase(p);
        if (p.kind !== 'osmosis') setOsmosis(null);
        if (p.kind === 'wave') announce(fill(S.phase.wave, { n: p.waveNumber, total: p.waves }));
        if (p.kind === 'osmosis') announce(`${S.phase.osmosis}. ${S.phase.osmosisSub}.`);
      }),
      link.on('select', ({ id }) => {
        const m = id ? moleculeById(id) : null;
        if (m) announce(fill(S.a11y.selected, { name: m.short, formula: m.formula, situation: m.situation }));
      }),
      link.on('explain', ({ id, kind }) => {
        say({ kind: 'explain', id, how: kind });
        const m = moleculeById(id);
        const rule = m?.modes[mode];
        if (!m || !rule) return;
        const lead = kind === 'wrong' ? S.strip.wrong : kind === 'late' ? fill(S.strip.late, { name: m.name }) : S.strip.noAtp;
        announce(kind === 'no-atp' ? lead : `${lead} ${rule.explanation}`);
      }),
      link.on('correct', () => setMessage((cur) => (cur?.m.kind === 'explain' ? null : cur))),
      link.on('notice', ({ key }) => {
        say({ kind: 'notice', key });
        announce(S.notices[key]);
      }),
      link.on('hint-used', () => session.useHint()),
      link.on('osmosis', (info) => setOsmosis(info)),
      link.on('osmosis-change', ({ say: key }) => {
        say({ kind: 'change', say: key });
        announce(S.osmosis.changes[key]);
      }),
      link.on('takeaway', ({ key }) => {
        say({ kind: 'takeaway', key });
        announce(S.osmosis.takeaways[key]);
      }),
      link.on('atp', (v) => setAtp(v)),
    ];
    return () => offs.forEach((off) => off());
  }, [link, session, mode, announce, S]);

  useEffect(() => () => link.clear(), [link]);

  const inOsmosis = phase?.kind === 'osmosis';
  const label = mode === 'avansat' ? `${S.avansat.title}. ${S.stage}` : `${S.baza.title}. ${S.stage}`;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative mx-auto w-full select-none" style={{ width: `min(100%, calc(${MAX_HEIGHT} * ${RATIO}))` }}>
        <PhaserGame session={session} scenes={scenes} design={DESIGN} label={label} maxHeight={MAX_HEIGHT} />
        {ready && <Overlay mode={mode} phase={phase} osmosis={osmosis} reduced={reduced} />}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <StatusCard message={message?.m ?? null} n={message?.n ?? 0} fresh={!!message && performance.now() - message.at < 5000} mode={mode} osmosis={inOsmosis ? osmosis : null} reduced={reduced} />
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {inOsmosis ? (
            <>
              <StripButton onClick={() => link.emit('adjust', { dir: 1 })} keyName={S.osmosis.saltKey}>
                {S.osmosis.salt}
              </StripButton>
              <StripButton onClick={() => link.emit('adjust', { dir: -1 })} keyName={S.osmosis.diluteKey}>
                {S.osmosis.dilute}
              </StripButton>
            </>
          ) : (
            <>
              {atp && (
                <p className="text-label flex items-center gap-2 px-1 text-ink-soft" aria-label={fill(S.a11y.atp, { n: atp.value, max: atp.max })}>
                  <span>{S.strip.atp}</span>
                  <span className="flex gap-1" aria-hidden="true">
                    {Array.from({ length: atp.max }, (_, i) => (
                      <span key={i} className={cx('size-2.5 rounded-full border border-iodine-deep', i < atp.value ? 'bg-iodine' : 'bg-transparent')} />
                    ))}
                  </span>
                </p>
              )}
              <StripButton onClick={() => link.emit('hint', {})} keyName={S.strip.hintKey} tone="methylene">
                {S.strip.hint}
              </StripButton>
            </>
          )}
        </div>
      </div>
      <LiveRegion polite={polite} assertive={assertive} />
    </div>
  );
}

function StripButton({ onClick, keyName, children, tone = 'paper' }: { onClick: () => void; keyName: string; children: ReactNode; tone?: 'paper' | 'methylene' }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scaleX: 1.06, scaleY: 0.92 }}
      transition={spring}
      aria-keyshortcuts={keyName}
      className={cx(
        'text-label inline-flex min-h-11 items-center gap-2 rounded-btn-b px-4 py-2 shadow-rest',
        tone === 'methylene' ? 'bg-methylene-50 text-methylene-deep' : 'bg-paper-bright text-ink',
      )}
    >
      {children}
      <Keycap>{keyName}</Keycap>
    </motion.button>
  );
}

function StatusCard({ message, n, fresh, mode, osmosis, reduced }: { message: Message | null; n: number; fresh: boolean; mode: MembraneMode; osmosis: OsmosisInfo | null; reduced: boolean }) {
  const S = MEMBRANE;
  let body: ReactNode = <p className="text-ink-soft">{S.strip.idle}</p>;
  let tone: 'neutral' | 'bad' | 'info' | 'learn' = 'neutral';

  if (message?.kind === 'explain') {
    const m = moleculeById(message.id);
    const rule = m?.modes[mode];
    tone = 'bad';
    if (m && rule) {
      const lead = message.how === 'wrong' ? S.strip.wrong : message.how === 'late' ? fill(S.strip.late, { name: m.name }) : null;
      body = message.how === 'no-atp' ? (
        <p>{S.strip.noAtp}</p>
      ) : (
        <p>
          <Formula formula={m.formula} className="mr-2 rounded-tag bg-paper-bright px-1.5 py-0.5" />
          <strong className="font-medium">{lead}</strong> {rule.explanation}
        </p>
      );
    }
  } else if (message?.kind === 'notice') {
    tone = 'info';
    body = <p>{S.notices[message.key]}</p>;
  } else if (message?.kind === 'takeaway') {
    tone = 'learn';
    body = <p>{S.osmosis.takeaways[message.key]}</p>;
  } else if (message?.kind === 'change') {
    tone = 'info';
    body = <p>{S.osmosis.changes[message.say]}</p>;
  }

  if (osmosis) {
    const water = osmosis.tonicity === 'hipotonica' ? S.osmosis.water.in : osmosis.tonicity === 'hipertonica' ? S.osmosis.water.out : S.osmosis.water.none;
    body = (
      <div className="flex flex-col gap-1">
        {message?.kind === 'change' && fresh && <p className="font-medium">{S.osmosis.changes[message.say]}</p>}
        <p>
          {S.osmosis.outside}: <strong className="font-medium">{S.osmosis.tonicity[osmosis.tonicity]}</strong>. {water}
        </p>
      </div>
    );
    tone = osmosis.zone === 'sigur' ? 'info' : 'bad';
  }

  return (
    <motion.div
      key={osmosis ? 'osmosis' : n}
      initial={reduced ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring}
      className={cx(
        'min-h-11 flex-1 rounded-well px-4 py-2.5 text--1 leading-body',
        tone === 'bad' ? 'bg-eosin-50' : tone === 'info' ? 'bg-methylene-50' : tone === 'learn' ? 'bg-iodine-100' : 'bg-paper-deep',
      )}
    >
      {body}
    </motion.div>
  );
}

function Overlay({ mode, phase, osmosis, reduced }: { mode: MembraneMode; phase: PhaseInfo | null; osmosis: OsmosisInfo | null; reduced: boolean }) {
  const S = MEMBRANE;
  const inOsmosis = phase?.kind === 'osmosis';
  const banner = bannerText(phase);
  const gates = gatesFor(mode);
  const L = OSMOSIS_LAYOUT;
  const gx = (v: number) => L.gaugeX0 + ((v - OSMOSIS.limits[0]) / (OSMOSIS.limits[1] - OSMOSIS.limits[0])) * (L.gaugeX1 - L.gaugeX0);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 select-none overflow-hidden rounded-well">
      {/* Sides */}
      <motion.div animate={{ opacity: inOsmosis ? 0 : 1 }} transition={spring}>
        <span className="text-label absolute px-1 text-methylene-deep" style={{ left: '2.5%', top: '2.5%' }}>
          {S.sides.exterior}
        </span>
        <span className="text-label absolute px-1 text-iodine-deep" style={{ right: '2.5%', bottom: '2.5%' }}>
          {S.sides.interior}
        </span>
        {/* Gate names and keys, just under the membrane */}
        {gates.map((g) => (
          <span
            key={g.route}
            className="absolute flex -translate-x-1/2 items-center justify-center gap-1 text-center"
            style={{ left: pctX(g.x), top: pctY(MEMBRANE_Y + MEMBRANE_HALF + GATE_PROTRUDE + 8), width: pctX(g.width + 8) }}
          >
            <span className="inline-flex max-w-full items-center gap-1 rounded-tag bg-paper-bright px-1.5 py-0.5 text-[0.7rem] font-medium leading-tight text-ink shadow-[0_1px_0_var(--ink-faint)] sm:text-[0.8rem]">
              <Keycap className="shrink-0">{String(g.key)}</Keycap>
              {(() => {
                const gate: { name: string; short?: string } = S.gates[g.route];
                return gate.short ? (
                  <>
                    <span className="min-w-0 sm:hidden">{gate.short}</span>
                    <span className="hidden min-w-0 sm:inline">{gate.name}</span>
                  </>
                ) : (
                  <span className="min-w-0">{gate.name}</span>
                );
              })()}
            </span>
          </span>
        ))}
      </motion.div>

      {/* Osmosis readouts */}
      {inOsmosis && osmosis && (
        <>
          <span className="text-label absolute px-1 text-ink-soft" style={{ left: pctX(L.gaugeX0), top: pctY(L.gaugeY + 22) }}>
            {S.osmosis.gauge.crenare}
          </span>
          <span
            className="text-label absolute -translate-x-1/2 px-1 text-methylene-deep"
            style={{ left: pctX((gx(OSMOSIS.safe[0]) + gx(OSMOSIS.safe[1])) / 2), top: pctY(L.gaugeY + 22) }}
          >
            {S.osmosis.gauge.sigur}
          </span>
          <span className="text-label absolute -translate-x-full px-1 text-ink-soft" style={{ left: pctX(L.gaugeX1), top: pctY(L.gaugeY + 22) }}>
            {S.osmosis.gauge.liza}
          </span>
          <span className="absolute -translate-x-1/2 whitespace-nowrap rounded-tag bg-paper-bright px-2 py-0.5 text--2 font-medium text-ink shadow-[0_1px_0_var(--ink-faint)] sm:text--1" style={{ left: '50%', top: pctY(52) }}>
            {S.osmosis.outside}: {S.osmosis.tonicity[osmosis.tonicity]}
          </span>
          <span className="text-label absolute -translate-x-1/2 whitespace-nowrap px-1 text-ink-soft" style={{ left: '50%', top: pctY(28) }}>
            {fill(S.osmosis.left, { n: osmosis.left })}
          </span>
          <span
            className={cx('absolute -translate-x-1/2 whitespace-nowrap px-1 text--1', osmosis.zone === 'sigur' ? 'text-ink-soft' : 'font-medium text-eosin-deep')}
            style={{ left: '50%', top: pctY(L.gaugeY - 66) }}
          >
            {S.osmosis.zone[osmosis.zone]}
          </span>
        </>
      )}

      {/* Phase banner */}
      <AnimatePresence>
        {banner && (
          <motion.div
            key={banner.title}
            className="absolute inset-x-0 flex justify-center"
            style={{ top: pctY(MEMBRANE_Y - GATE_REACH - 70) }}
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.8, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
            transition={spring}
          >
            <div className="flex -rotate-1 flex-col items-center gap-0.5 rounded-cell bg-paper-bright px-5 py-3 text-center shadow-card">
              <span className="text-display text-3 leading-none">{banner.title}</span>
              {banner.sub && <span className="text-label text-ink-soft">{banner.sub}</span>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function bannerText(phase: PhaseInfo | null): { title: string; sub?: string } | null {
  const S = MEMBRANE;
  if (!phase) return null;
  if (phase.kind === 'break') {
    if (phase.next === 'wave') return { title: fill(S.phase.wave, { n: phase.waveNumber, total: phase.waves }) };
    if (phase.next === 'osmosis') return { title: S.phase.osmosis, sub: S.phase.osmosisSub };
    return null;
  }
  if (phase.kind === 'done') return { title: S.phase.done };
  return null;
}

/** Nivelul de bază (trunchi comun): difuzie și osmoză. */
export function BaseMembraneGame(props: GameProps) {
  return <MembraneGame {...props} mode="baza" />;
}

/** Avansat (curriculum de specialitate): adds facilitated diffusion, active transport and ATP. */
export function AdvancedMembraneGame(props: GameProps) {
  return <MembraneGame {...props} mode="avansat" />;
}
