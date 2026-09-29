// "Safari la microscop": the React side. The Phaser scene is the microscope field; everything to read
// is in the DOM: the slide label, the observation card, the group (and type) buttons, the carnet, the
// explanations with "→ vezi în lecție". Both modes share this file.
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { cx } from '../../../lib/cx';
import { t, tp } from '../../../lib/i18n';
import { spring } from '../../../lib/motion';
import { useReducedMotion } from '../../../lib/motionPreference';
import PhaserGame from '../../phaser/PhaserGame';
import LiveRegion, { useAnnouncer } from '../../core/LiveRegion';
import { useLessonSheet } from '../../core/lessonSheet';
import type { GameProps } from '../../core/types';
import Sprite from '../../../components/illustration/Sprite';
import { SAFARI, fill } from '../../../content/ro/games/safari-microscop';
import { CLUES, GROUPS, MODE_GROUPS, SLIDES, TYPE_NAMES, organismById, type GroupId, type Organism, type SafariMode, type TypeId } from '../../../content/ro/safari-organisms.ts';
import { DESIGN, MAX_HEIGHT } from './config';
import { createSafariLink, type LinkOut } from './link';

const RATIO = DESIGN.width / DESIGN.height;

/** A small glyph per group, so the buttons differ by shape as well as by label (UI chrome). */
function GroupGlyph({ group }: { group: GroupId }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const shapes: Record<GroupId, ReactNode> = {
    bacterii: <rect x="4" y="9" width="16" height="7" rx="3.5" {...common} />,
    arhee: <path d="M4 12.5 h3 l2 -3 l2 6 l2 -6 l2 6 l2 -3 h3" {...common} />,
    protozoare: <path d="M6 13 C 4 8, 10 5, 13 7 C 17 5, 21 10, 18 14 C 20 18, 13 20, 11 17 C 7 19, 4 16, 6 13 Z" {...common} />,
    chromista: <path d="M5 9 h14 v8 h-14 z M5 12.5 h14" {...common} />,
    fungi: <path d="M12 20 V11 M12 11 L7 6 M12 11 L17 6 M12 14 L8 11" {...common} />,
    plante: <path d="M6 18 C 6 10, 12 5, 19 5 C 19 12, 14 18, 6 18 Z M6 18 L14 10" {...common} />,
    animale: <path d="M8 12 a3 3 0 1 0 0.1 0 M14 9 a3 3 0 1 0 0.1 0 M15 16 a3 3 0 1 0 0.1 0" {...common} />,
  };
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6 shrink-0">
      {shapes[group]}
    </svg>
  );
}

function Keycap({ children }: { children: string }) {
  return (
    <kbd className="inline-flex min-w-[1.5em] items-center justify-center rounded-[5px] border border-ink-faint bg-paper-bright px-1 font-mono text--2 font-medium leading-tight text-ink shadow-[0_1.5px_0_var(--ink-faint)]">
      {children}
    </kbd>
  );
}

type Message =
  | { kind: 'wrong'; id: string; picked?: GroupId }
  | { kind: 'escaped'; id: string }
  | { kind: 'right'; id: string }
  | { kind: 'type'; id: string; correct: boolean }
  | { kind: 'notice'; key: LinkOut['notice']['key'] };

export default function SafariGame({ session, mode }: GameProps & { mode: SafariMode }) {
  const [link] = useState(createSafariLink);
  const reduced = useReducedMotion();
  const sheet = useLessonSheet();
  const { polite, assertive, announce } = useAnnouncer();
  const [ready, setReady] = useState(false);
  const [slide, setSlide] = useState<{ index: number; total: number; slideId: string } | null>(null);
  const [banner, setBanner] = useState(false);
  const [selected, setSelected] = useState<{ id: string; tutorial: boolean } | null>(null);
  const [typing, setTyping] = useState<string | null>(null);
  const [hinted, setHinted] = useState<string | null>(null);
  const [message, setMessage] = useState<{ n: number; m: Message } | null>(null);
  const [carnet, setCarnet] = useState<string[]>([]);

  const scenes = useCallback(() => import('./scene').then((m) => m.safariScenes(mode, link)), [mode, link]);

  useEffect(() => {
    let n = 0;
    const say = (m: Message) => setMessage({ n: ++n, m });
    const offs = [
      link.on('ready', () => setReady(true)),
      link.on('slide', (s) => setSlide(s)),
      link.on('phase', ({ kind }) => setBanner(kind !== 'play')),
      link.on('select', ({ id, tutorial }) => {
        setSelected(id ? { id, tutorial } : null);
        setHinted(null);
        const o = id ? organismById(id) : null;
        if (o) announce(fill(SAFARI.a11y.selected, { name: o.name, clues: o.clues.map((c) => CLUES[c].text).join(' ') }));
      }),
      link.on('result', ({ id, outcome, picked }) => {
        const o = organismById(id)!;
        if (outcome === 'wrong') {
          say({ kind: 'wrong', id, picked });
          announce(`${SAFARI.wrong} ${o.explanation}`, true);
        } else if (outcome === 'escaped') {
          say({ kind: 'escaped', id });
          announce(fill(SAFARI.escaped, { name: o.name }));
        } else {
          say({ kind: 'right', id });
          announce(fill(SAFARI.a11y.right, { name: o.name, group: GROUPS[o.group].name }));
        }
      }),
      link.on('type-step', ({ id }) => setTyping(id)),
      link.on('type-result', ({ id, correct }) => {
        say({ kind: 'type', id, correct });
        const o = organismById(id)!;
        announce(correct ? fill(SAFARI.typeRight, { type: TYPE_NAMES[o.type!] }) : fill(SAFARI.typeWrong, { type: TYPE_NAMES[o.type!], clue: typeClue(o) }));
      }),
      link.on('carnet', ({ id }) => setCarnet((c) => (c.includes(id) ? c : [...c, id]))),
      link.on('notice', ({ key }) => {
        say({ kind: 'notice', key });
        announce(SAFARI.notices[key]);
      }),
      link.on('hint-used', ({ id }) => {
        session.useHint();
        setHinted(id);
      }),
    ];
    return () => offs.forEach((off) => off());
  }, [link, session, announce]);
  useEffect(() => () => link.clear(), [link]);

  const current = selected ? organismById(selected.id) : null;
  const typingOrganism = typing ? organismById(typing) : null;
  const slideInfo = slide ? SLIDES.find((s) => s.id === slide.slideId) : null;
  const label = `${mode === 'avansat' ? SAFARI.avansat.title : SAFARI.baza.title}. ${SAFARI.stage}`;
  const hintGroup = hinted ? organismById(hinted)?.group : null;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:items-start">
      {/* The field */}
      <div className="relative mx-auto w-full select-none" style={{ width: `min(100%, calc(${MAX_HEIGHT} * ${RATIO}))` }}>
        <PhaserGame session={session} scenes={scenes} design={DESIGN} label={label} maxHeight={MAX_HEIGHT} />
        {ready && slideInfo && (
          <div aria-hidden="true" className="pointer-events-none absolute left-2 top-2 flex max-w-[60%] -rotate-2 flex-col rounded-[3px] border border-ink-faint bg-paper-bright px-2.5 py-1.5 shadow-well">
            <span className="font-mono text--2 uppercase tracking-[0.08em] text-ink-soft">{fill(SAFARI.slide, { n: String(slideInfo.number).padStart(2, '0') })}</span>
            <span className="text--1 font-medium leading-tight">{slideInfo.sample}</span>
          </div>
        )}
        <AnimatePresence>
          {ready && banner && slideInfo && (
            <motion.div
              key={slideInfo.id}
              className="pointer-events-none absolute inset-x-0 top-[38%] flex justify-center px-6"
              initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={spring}
            >
              <div className="flex max-w-sm -rotate-1 flex-col items-center gap-1 rounded-cell bg-paper-bright px-5 py-3 text-center shadow-card">
                <span className="font-mono text--1 uppercase tracking-[0.1em] text-ink-soft">{fill(SAFARI.slide, { n: String(slideInfo.number).padStart(2, '0') })}</span>
                <span className="text-display text-2 leading-tight">{slideInfo.sample}</span>
                <span className="text--1 text-ink-soft">{slideInfo.context}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* The notebook margin: card, buttons, messages, carnet */}
      <div className="flex min-w-0 flex-col gap-3">
        <ObservationCard organism={current ?? null} tutorial={!!selected?.tutorial} hinted={hinted === current?.id} />

        <div role="group" aria-label={typingOrganism ? fill(SAFARI.card.pickType, { group: GROUPS[typingOrganism.group].name }) : SAFARI.card.pickGroup} className="flex flex-col gap-2">
          <p className="text-label text-ink-soft">{typingOrganism ? fill(SAFARI.card.pickType, { group: GROUPS[typingOrganism.group].name.toLowerCase() }) : SAFARI.card.pickGroup}</p>
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
            {typingOrganism
              ? (GROUPS[typingOrganism.group].types ?? []).map((type: TypeId, i) => (
                  <ChoiceButton key={type} keyName={String(i + 1)} onClick={() => link.emit('pick-type', { type })} highlighted={hinted === typingOrganism.id && type === typingOrganism.type}>
                    <span className="font-medium">{TYPE_NAMES[type]}</span>
                  </ChoiceButton>
                ))
              : MODE_GROUPS[mode].map((g, i) => (
                  <ChoiceButton key={g} keyName={String(i + 1)} onClick={() => link.emit('pick', { group: g })} highlighted={hintGroup === g} glyph={<GroupGlyph group={g} />}>
                    <span className="flex flex-col leading-tight">
                      <span className="font-medium">{GROUPS[g].name}</span>
                      <span className="hidden text--2 text-ink-soft sm:inline">{GROUPS[g].cue}</span>
                    </span>
                  </ChoiceButton>
                ))}
          </div>
          <button
            type="button"
            onClick={() => link.emit('hint', {})}
            aria-keyshortcuts="H"
            className="text-label inline-flex min-h-11 items-center gap-2 self-start rounded-btn-b bg-methylene-50 px-4 text-methylene-deep shadow-rest"
          >
            {SAFARI.hint} <Keycap>{SAFARI.hintKey}</Keycap>
          </button>
        </div>

        <MessageLine message={message} onLesson={(ref) => sheet.open(ref)} reduced={reduced} />
        <Carnet ids={carnet} />
      </div>
      <LiveRegion polite={polite} assertive={assertive} />
    </div>
  );
}

const typeClue = (o: Organism) => CLUES[o.clues.find((c) => CLUES[c].type === o.type) ?? o.clues[0]].text;

function ChoiceButton({ keyName, onClick, highlighted, glyph, children }: { keyName: string; onClick: () => void; highlighted: boolean; glyph?: ReactNode; children: ReactNode }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-keyshortcuts={keyName}
      whileTap={{ scaleX: 1.04, scaleY: 0.94 }}
      transition={spring}
      className={cx(
        'flex min-h-11 items-center gap-2 rounded-well px-3 py-1.5 text-left text--1 shadow-rest',
        highlighted ? 'bg-methylene-100 outline-dashed outline-2 outline-offset-2 outline-methylene-deep' : 'bg-paper-bright hover:bg-paper',
      )}
    >
      {glyph}
      <span className="min-w-0 flex-1">{children}</span>
      <Keycap>{keyName}</Keycap>
    </motion.button>
  );
}

/** The observation card, pinned like a slide label: name, Latin name and what is visible. */
function ObservationCard({ organism, tutorial, hinted }: { organism: Organism | null; tutorial: boolean; hinted: boolean }) {
  if (!organism) {
    return <p className="rounded-well border border-dashed border-ink-faint px-4 py-3 text--1 text-ink-soft">{SAFARI.card.empty}</p>;
  }
  const mark = tutorial || hinted;
  return (
    <section aria-label={organism.name} className="relative rotate-[-0.5deg] rounded-[4px] bg-paper-bright px-4 pb-3 pt-4 shadow-card">
      <span aria-hidden="true" className="absolute left-6 top-1.5 size-2.5 rounded-full bg-eosin shadow-[0_1px_0_var(--eosin-deep)]" />
      <div className="flex items-center gap-3">
        <Sprite id={organism.sprite} size="md" tone={organism.tone} />
        <p className="flex flex-col leading-tight">
          <span className="font-display text-1">{organism.name}</span>
          <em className="text--1 text-ink-soft">{organism.binomial}</em>
        </p>
      </div>
      <p className="text-label mb-1 mt-3 text-ink-soft">{SAFARI.card.seen}</p>
      <ul className="flex flex-col gap-1.5 text--1 leading-body">
        {organism.clues.map((c) => {
          const decides = organism.diagnostic.includes(c) && mark;
          return (
            <li key={c} className="flex gap-2">
              <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-ink-soft" />
              <span className={cx(decides && 'underline decoration-eosin decoration-2 underline-offset-4')}>
                {CLUES[c].text}
                {decides && <span className="sr-only"> ({SAFARI.card.decides})</span>}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function MessageLine({ message, onLesson, reduced }: { message: { n: number; m: Message } | null; onLesson: (ref: string) => void; reduced: boolean }) {
  if (!message) return null;
  const { m } = message;
  let tone = 'bg-paper-deep';
  let body: ReactNode = null;
  if (m.kind === 'wrong') {
    const o = organismById(m.id)!;
    tone = 'bg-eosin-50';
    body = (
      <>
        <strong className="font-medium">{SAFARI.wrong}</strong> {o.explanation}{' '}
        <button type="button" onClick={() => onLesson(o.lessonSection)} className="text-label text-methylene-deep underline decoration-dotted underline-offset-4">
          → {t('sheet.see')}
        </button>
      </>
    );
  } else if (m.kind === 'escaped') {
    body = fill(SAFARI.escaped, { name: organismById(m.id)!.name });
  } else if (m.kind === 'right') {
    const o = organismById(m.id)!;
    tone = 'bg-methylene-50';
    body = (
      <>
        <strong className="font-medium">{o.name}</strong>: {o.fact}
      </>
    );
  } else if (m.kind === 'type') {
    const o = organismById(m.id)!;
    tone = m.correct ? 'bg-methylene-50' : 'bg-iodine-100';
    body = m.correct ? fill(SAFARI.typeRight, { type: TYPE_NAMES[o.type!] }) : fill(SAFARI.typeWrong, { type: TYPE_NAMES[o.type!], clue: typeClue(o) });
  } else {
    tone = 'bg-methylene-50';
    body = SAFARI.notices[m.key];
  }
  return (
    <motion.p key={message.n} initial={reduced ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={spring} className={cx('rounded-well px-4 py-2.5 text--1 leading-body', tone)}>
      {body}
    </motion.p>
  );
}

function Carnet({ ids }: { ids: string[] }) {
  return (
    <section aria-labelledby="carnet-h" className="flex flex-col gap-2 border-l-2 border-dashed border-ink-faint pl-3">
      <h3 id="carnet-h" className="text-label flex justify-between text-ink-soft">
        <span>{SAFARI.carnet}</span>
        {ids.length > 0 && <span>{tp('safari.count', ids.length)}</span>}
      </h3>
      {ids.length === 0 ? (
        <p className="text--1 text-ink-soft">{SAFARI.carnetEmpty}</p>
      ) : (
        <ol className="flex flex-col gap-1">
          {ids.map((id) => {
            const o = organismById(id)!;
            return (
              <li key={id} className="flex items-center gap-2 text--1">
                <Sprite id={o.sprite} size="sm" tone={o.tone} />
                <span className="min-w-0">
                  {o.name} <em className="text-ink-soft">{o.binomial}</em>
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

export function BaseSafariGame(props: GameProps) {
  return <SafariGame {...props} mode="baza" />;
}

export function AdvancedSafariGame(props: GameProps) {
  return <SafariGame {...props} mode="avansat" />;
}
