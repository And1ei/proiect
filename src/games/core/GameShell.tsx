// Wraps every game: intro → playing ⇄ paused → won/lost (results). Owns the session store, the HUD,
// the clock, auto-pause, Escape, focus, aria-live, progress saving, and all shared game feel
// (sound, bursts, shake, floating points, reaction lines), so individual games only report what
// happened through the session.
import { Suspense, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { t, tp } from '../../lib/i18n';
import { progressStore } from '../../lib/progress';
import { useProgress } from '../../lib/useProgress';
import { cx } from '../../lib/cx';
import { getLesson, lessonPath, sectionPath } from '../../content/ro/lessons/index.ts';
import { nextUnread } from '../../lib/stamps';
import LessonSheet, { LessonSheetContext, type LessonSheetApi } from './lessonSheet';
import SpecimenLabel from '../../components/primitives/SpecimenLabel';
import { play, preload as preloadSounds } from '../feel/sfx';
import { burst } from '../feel/burst';
import { encourage, type Situation } from '../feel/encouragement';
import { FloatingText, useFloatingText, useShake } from '../feel/juice';
import { multiplierFor, type SessionEvent } from './session';
import { useGameSession, useSessionState } from './useGameSession';
import Hud from './Hud';
import IntroScreen from './IntroScreen';
import PauseOverlay from './PauseOverlay';
import HelpDialog from './HelpDialog';
import ResultsScreen, { type ResultsData } from './ResultsScreen';
import LiveRegion, { useAnnouncer } from './LiveRegion';
import { preloadGame } from './preload';
import type { GameDefinition } from './types';

/** Minimum gap between two reaction lines of the same kind, so fast games don't chatter. */
const REACTION_GAP_MS: Partial<Record<Situation, number>> = { correct: 2500, wrong: 1200 };
const TICK_MS = 250;

function StageLoading() {
  return (
    <p role="status" className="text-label flex min-h-64 items-center justify-center text-ink-soft">
      {t('games.shell.loading')}
    </p>
  );
}

export default function GameShell({ definition }: { definition: GameDefinition }) {
  const session = useGameSession(definition);
  const status = useSessionState(session, (s) => s.status);
  const run = useSessionState(session, (s) => s.run);
  const autoPaused = useSessionState(session, (s) => s.autoPaused);
  const { game: progressOf, data: progressData } = useProgress();
  const saved = progressOf(definition.id);
  const topic = getLesson(definition.topicSlug);
  const titleId = useId();

  const stage = useRef<HTMLDivElement>(null);
  const bestBefore = useRef(0);
  const lastReaction = useRef<Partial<Record<Situation, number>>>({});
  const scoreTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [helpOpen, setHelpOpen] = useState(false);
  const [sheet, setSheet] = useState<string | null>(null);
  // The section right before this game in its lesson: what the game needs was taught there
  const lessonSection = topic?.games.find((g) => g.gameId === definition.id)?.afterSection ?? null;
  const sheetApi = useMemo<LessonSheetApi>(
    () => ({
      open: (ref: string) => {
        session.pause();
        setSheet(ref);
      },
    }),
    [session],
  );
  const [reaction, setReaction] = useState<{ id: number; text: string; tone: 'good' | 'bad' | 'neutral' } | null>(null);
  const [results, setResults] = useState<ResultsData | null>(null);
  const { polite, assertive, announce } = useAnnouncer();
  const { ref: shakeRef, shake } = useShake();
  const floats = useFloatingText();

  const { Component } = definition;

  // Intent: the player is on the game page, so fetch the game (and Phaser) while they read
  useEffect(() => preloadGame(definition), [definition]);

  const react = useCallback((situation: Situation, vars?: Record<string, number>) => {
    const now = performance.now();
    const gap = REACTION_GAP_MS[situation] ?? 0;
    if (now - (lastReaction.current[situation] ?? -Infinity) < gap) return;
    lastReaction.current[situation] = now;
    const tone = situation === 'wrong' ? 'bad' : situation === 'nearWin' ? 'neutral' : 'good';
    setReaction({ id: now, text: encourage(situation, vars), tone });
  }, []);

  const focusStage = useCallback(() => {
    // The game component may still be loading: try for a few frames
    let tries = 0;
    const attempt = () => {
      const el = stage.current?.querySelector<HTMLElement>('[data-game-stage]') ?? null;
      if (el) el.focus({ preventScroll: true });
      else if (tries++ < 60) requestAnimationFrame(attempt);
    };
    requestAnimationFrame(attempt);
  }, []);

  // ── Clock ──
  useEffect(() => {
    if (status !== 'playing') return undefined;
    let last = performance.now();
    const id = setInterval(() => {
      const now = performance.now();
      session.tick(now - last);
      last = now;
    }, TICK_MS);
    return () => clearInterval(id);
  }, [status, session]);

  // ── Auto-pause: tab hidden or window loses focus. Resuming needs an explicit press. ──
  useEffect(() => {
    const onVisibility = () => document.hidden && session.pause(true);
    const onBlur = () => session.pause(true);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', onBlur);
    };
  }, [session]);

  // ── Escape pauses (the help dialog handles its own Escape) ──
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !helpOpen && !sheet && session.get().status === 'playing') {
        e.preventDefault();
        session.pause();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [session, helpOpen, sheet]);

  // ── Session events → feel ──
  useEffect(() => {
    const floatAt = (e: SessionEvent) => {
      if (!e.points || !e.at || definition.usesPhaser || !stage.current) return; // Phaser draws its own
      const r = stage.current.getBoundingClientRect();
      floats.spawn(`+${e.points}`, e.at.x - r.left, e.at.y - r.top, e.type === 'streak' ? 'iodine' : 'methylene');
    };
    const announceScore = () => {
      clearTimeout(scoreTimer.current);
      scoreTimer.current = setTimeout(() => announce(t('games.announce.score', { score: session.get().score })), 1500);
    };
    return session.store.subscribe((s, prev) => {
      const e = s.lastEvent;
      if (!e || e === prev.lastEvent) return;
      switch (e.type) {
        case 'hit':
          play('correct');
          react('correct');
          floatAt(e);
          announceScore();
          break;
        case 'score':
          play('pop');
          floatAt(e);
          announceScore();
          break;
        case 'streak': {
          const m = multiplierFor(e.streak ?? 0);
          play('streak');
          const badge = stage.current?.parentElement?.querySelector('[data-streak-badge]')?.getBoundingClientRect();
          burst('streak', e.at ?? (badge ? { x: badge.left + badge.width / 2, y: badge.top + badge.height / 2 } : undefined));
          react('streak', { n: e.streak ?? 0, m });
          announce(t('games.announce.streak', { n: e.streak, m }));
          floatAt(e);
          break;
        }
        case 'miss':
          play('wrong');
          react('wrong');
          break;
        case 'life-lost':
          play('wrong');
          shake();
          react('wrong');
          if (s.lives > 0) announce(tp('games.announce.lives', s.lives));
          break;
        case 'hint':
          play('click');
          announce(t('games.announce.hint'));
          break;
        case 'near-win':
          react('nearWin');
          break;
      }
    });
  }, [session, definition.usesPhaser, react, announce, shake, floats]);

  // ── Status transitions: focus, announcements, results, progress ──
  useEffect(
    () =>
      session.store.subscribe((s, prev) => {
        if (s.status === prev.status && s.run === prev.run) return;
        if (s.status === 'playing' && (prev.status !== 'paused' || s.run !== prev.run)) {
          bestBefore.current = progressStore.get().games[definition.id]?.bestScore ?? 0;
          lastReaction.current = {};
          setReaction(null);
          setResults(null);
          announce(t('games.announce.started'));
          focusStage();
        } else if (s.status === 'paused') {
          announce(t('games.announce.paused'));
        } else if (s.status === 'playing') {
          announce(t('games.announce.resumed'));
          focusStage();
        } else if (s.status === 'won' || s.status === 'lost') {
          clearTimeout(scoreTimer.current);
          const result = session.result();
          const stars = definition.stars(result);
          progressStore.saveGame(definition.id, { score: result.score, stars, usedHelp: result.hintsUsed > 0 });
          const won = s.status === 'won';
          play(won ? 'win' : 'lose');
          if (won) burst('success');
          announce(t(won ? 'games.announce.won' : 'games.announce.lost', { score: result.score }), true);
          setResults({
            result,
            stars,
            bestBefore: bestBefore.current,
            plays: progressStore.get().games[definition.id]?.plays ?? 1,
            line: encourage(won ? 'finish' : 'tryAgain'),
          });
        }
      }),
    [session, definition, announce, focusStage],
  );

  useEffect(() => () => clearTimeout(scoreTimer.current), []);

  const start = () => {
    preloadSounds();
    play('click');
    session.start();
  };

  const openHelp = () => {
    session.pause();
    setHelpOpen(true);
  };

  const playingOrPaused = status === 'playing' || status === 'paused';

  // "Înapoi la lecție": the next unread section of this game's lesson (fallback: the topic page)
  const unread = topic ? nextUnread(topic, progressData) : null;
  const backTo = topic ? (unread ? sectionPath(topic.slug, unread.id) : lessonPath(topic.slug)) : '/jocuri';
  // After a run with help or several misses, one line points to the section that explains it
  const struggled = !!results && (results.result.hintsUsed > 0 || results.result.misses >= 3);
  const explainRef = results?.result.recap?.find((r) => r.section)?.section ?? (topic && lessonSection ? `${topic.slug}#${lessonSection}` : null);
  const [explainSlug, explainId] = explainRef ? explainRef.split('#') : [null, null];
  const explainSection = explainSlug ? getLesson(explainSlug)?.sections.find((x) => x.id === explainId) : null;
  const explains = struggled && explainRef && explainSection ? { ref: explainRef, title: explainSection.title } : null;

  return (
    <LessonSheetContext.Provider value={sheetApi}>
    <section aria-labelledby={titleId} className="flex flex-col gap-6">
      <header className="flex flex-col items-start gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <SpecimenLabel tone="methylene" tilt>
            {topic ? `${t('games.tag')} / ${topic.title}` : t('games.tag')}
          </SpecimenLabel>
          {definition.sandbox && <SpecimenLabel tone="iodine">{t('games.sandboxTag')}</SpecimenLabel>}
        </div>
        <h1 id={titleId} className="text-display text-4 sm:text-5">
          {definition.title}
        </h1>
        <p className="prose-body text-1">{definition.tagline}</p>
      </header>

      <div className="relative rounded-cell bg-paper-bright p-3 shadow-card sm:p-5">
        {/* Slide-mount corner ticks, as on SpecimenCard */}
        <span aria-hidden="true" className="pointer-events-none absolute left-3 top-3 size-3 border-l border-t border-ink-faint" />
        <span aria-hidden="true" className="pointer-events-none absolute bottom-3 right-3 size-3 border-b border-r border-ink-faint" />

        {status === 'intro' && (
          <IntroScreen
            definition={definition}
            best={saved}
            onStart={start}
            lesson={topic}
            onReread={topic ? () => sheetApi.open(lessonSection ? `${topic.slug}#${lessonSection}` : topic.slug) : undefined}
            readBefore={!!topic && !!lessonSection && (progressData.topics[topic.slug]?.sectionsRead ?? []).includes(lessonSection)}
          />
        )}

        {playingOrPaused && (
          <div className="flex flex-col gap-3">
            <div data-hud>
              <Hud session={session} definition={definition} onHelp={openHelp} />
            </div>
            <div ref={stage} className="relative">
              <motion.div ref={shakeRef} inert={status === 'paused'} aria-label={t('games.shell.stage')} role="region">
                <Suspense fallback={<StageLoading />}>
                  {/* DOM games remount per run; Phaser games restart their scenes in place */}
                  <Component key={definition.usesPhaser ? 'phaser' : run} session={session} />
                </Suspense>
              </motion.div>
              <FloatingText items={floats.items} />
              {status === 'paused' && (
                <PauseOverlay
                  auto={autoPaused}
                  onResume={() => session.resume()}
                  onHelp={() => setHelpOpen(true)}
                  onRestart={() => session.restart()}
                />
              )}
            </div>
            <p
              aria-hidden="true"
              className={cx(
                'text-label min-h-[1.5em] px-1',
                reaction?.tone === 'bad' ? 'text-iodine-deep' : reaction?.tone === 'neutral' ? 'text-ink-soft' : 'text-methylene-deep',
              )}
            >
              {reaction && (
                <motion.span key={reaction.id} className="inline-block" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 180, damping: 16 }}>
                  {reaction.text}
                </motion.span>
              )}
            </p>
          </div>
        )}

        {(status === 'won' || status === 'lost') && results && (
          <ResultsScreen {...results} onAgain={() => session.restart()} backTo={backTo} onOpenSection={(ref) => sheetApi.open(ref)} explains={explains} />
        )}
      </div>

      <HelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} definition={definition} />
      <LessonSheet target={sheet} onClose={() => setSheet(null)} />
      <LiveRegion polite={polite} assertive={assertive} />
    </section>
    </LessonSheetContext.Provider>
  );
}
