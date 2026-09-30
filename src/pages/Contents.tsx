// The landing page: what this is (five seconds), a game two taps away, and the five lessons as a
// learning path the reader can open in place. Everything here is computed from the lesson files and
// the game registry: no typed counts, no dummy cards.
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { t } from '../lib/i18n';
import { cx } from '../lib/cx';
import { spring, springSettle } from '../lib/motion';
import { useReducedMotion } from '../lib/motionPreference';
import { useMediaQuery } from '../lib/useMediaQuery';
import { useProgress } from '../lib/useProgress';
import { STAIN } from '../lib/stains';
import { continueTarget, stampsOf } from '../lib/stamps';
import { LESSONS, catalogNumber, lessonPath, readingMinutes, type Lesson as LessonData } from '../content/ro/lessons/index.ts';
import { gamePath } from '../games/registry';
import { firstPlayable, gameCount, isAdvanced, gamesSummary, lessonCount, levelsForTopic, plural, readingMinutesTotal } from '../content/stats';
import { preloadGame } from '../games/core/preload';
import Container from '../components/primitives/Container';
import PageMeta from '../components/layout/PageMeta';
import HandUnderline from '../components/primitives/HandUnderline';
import Lesson from '../components/lesson/Lesson';
import GameSlide from '../components/lesson/GameSlide';
import Stamps from '../components/lesson/Stamps';
import Inline from '../components/lesson/Inline';

function TopicBlock({ lesson, open, onToggle }: { lesson: LessonData; open: boolean; onToggle: () => void }) {
  const reduced = useReducedMotion();
  const s = STAIN[lesson.stain];
  const games = levelsForTopic(lesson.slug);
  const panelId = `panel-${lesson.slug}`;
  const titleId = `title-${lesson.slug}`;

  return (
    <li id={lesson.slug} data-rail-mark={lesson.stain} className="scroll-mt-24">
      <div className="grid grid-cols-[3.25rem_minmax(0,1fr)] gap-x-4 sm:grid-cols-[4.5rem_minmax(0,1fr)] sm:gap-x-6 lg:grid-cols-[5rem_minmax(0,1fr)_17rem]">
        {/* Catalog number on the slide's stain strip */}
        <div className="row-span-2 flex flex-col items-center">
          <span className={cx('font-display text-4 font-medium leading-none sm:text-5', s.text)}>{catalogNumber(lesson)}</span>
          <span aria-hidden="true" className={cx('mt-3 w-1 flex-1 rounded-full opacity-70', s.bg)} />
        </div>

        <div className="flex min-w-0 flex-col items-start gap-2 pb-2">
          <h2 id={titleId} className="text-2 sm:text-3">
            <button
              type="button"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={onToggle}
              className="group inline-flex min-h-11 items-start gap-3 text-left"
            >
              <span className="text-balance">{lesson.title}</span>
              <motion.span aria-hidden="true" animate={{ rotate: open ? 90 : 0 }} transition={reduced ? { duration: 0 } : spring} className={cx('mt-2 inline-block text-1', s.text)}>
                ›
              </motion.span>
            </button>
          </h2>
          <p className="max-w-[58ch] text-ink-soft">
            <Inline text={lesson.hook} />
          </p>
          <p className="text-label flex flex-wrap items-center gap-x-4 gap-y-2 text-ink-soft">
            <span>{t('lesson.readingTime', { n: readingMinutes(lesson) })}</span>
            <span>{plural(lesson.sections.length, 'sectiune')}</span>
            <Stamps lesson={lesson} />
          </p>
        </div>

        {/* Quick play: a game is always at most two taps away (nothing here for a topic without one) */}
        {games.length > 0 && (
          <div className="col-start-2 flex flex-wrap items-start gap-2 pb-2 lg:col-start-3 lg:row-start-1 lg:flex-col lg:items-stretch lg:pt-1">
            {games.map((g) => (
              <Link
                key={g.id}
                to={gamePath(g.id)}
                onPointerEnter={() => preloadGame(g)}
                onFocus={() => preloadGame(g)}
                aria-label={`${t('games.play')} „${g.title}”`}
                className={cx('inline-flex min-h-11 items-center justify-between gap-3 rounded-btn-b border px-4 py-2 text--1 font-medium no-underline hover:bg-paper-bright', s.border, s.text)}
              >
                {/* The advanced twin is labelled by its level: the title is already on the base button */}
                <span>{isAdvanced(g) ? t('games.levels.advanced') : `${t('games.play')} „${g.title}”`}</span>
                <span aria-hidden="true">→</span>
              </Link>
            ))}
          </div>
        )}

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              id={panelId}
              role="region"
              aria-labelledby={titleId}
              key="panel"
              className="col-span-2 overflow-hidden sm:col-start-2 sm:col-span-1 lg:col-span-2"
              initial={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
              animate={reduced ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
              exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
              transition={reduced ? { duration: 0 } : springSettle}
            >
              <div className="flex flex-col gap-8 pb-10 pt-6">
                <Lesson lesson={lesson} mode="inline" />
                <Link to={lessonPath(lesson.slug)} className="text-label self-start text-ink-soft underline underline-offset-4 hover:text-ink">
                  {t('landing.page')}
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </li>
  );
}

export default function Contents() {
  const { data } = useProgress();
  const { hash } = useLocation();
  const desktop = useMediaQuery('(min-width: 1024px)');
  const start = useMemo(firstPlayable, []);
  const cont = continueTarget(data);

  // Default: the first topic not yet fully read is open (none when all are read). A deep link
  // /#celula opens that one instead.
  const [open, setOpen] = useState<string[]>(() => {
    const fromHash = hash.slice(1);
    if (LESSONS.some((l) => l.slug === fromHash)) return [fromHash];
    const first = LESSONS.find((l) => !stampsOf(l, data).citit);
    return first ? [first.slug] : [];
  });

  useEffect(() => {
    const slug = hash.slice(1);
    if (!LESSONS.some((l) => l.slug === slug)) return;
    setOpen((o) => (o.includes(slug) ? o : desktop ? [...o, slug] : [slug]));
    const id = requestAnimationFrame(() => document.getElementById(slug)?.scrollIntoView({ block: 'start' }));
    return () => cancelAnimationFrame(id);
  }, [hash, desktop]);

  const toggle = (slug: string) =>
    setOpen((o) => (o.includes(slug) ? o.filter((x) => x !== slug) : desktop ? [...o, slug] : [slug]));

  return (
    <>
      <PageMeta />
      <Container size="wide" className="flex flex-col gap-16 pt-10 sm:gap-20 sm:pt-16">
        {/* Masthead: left-aligned, with the "start here" clipping pinned off to the side */}
        <header className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-end lg:gap-16">
          <div className="flex max-w-[44rem] flex-col items-start gap-5">
            <p className="font-mono text--1 uppercase tracking-[0.1em] text-ink-soft">{t('landing.set')}</p>
            <h1 className="text-display text-5 sm:text-6">{t('landing.title')}</h1>
            <p className="lesson-body max-w-[52ch] text-1">
              {t(gameCount ? 'landing.leadA' : 'landing.leadNoGamesA')}{' '}
              <HandUnderline variant="scribble" className="">
                {t(gameCount ? 'landing.leadMark' : 'landing.leadNoGamesMark')}
              </HandUnderline>
              {t('landing.leadB')}
            </p>
            <p className="text-label text-ink-soft">
              {[gamesSummary(), plural(lessonCount, 'lectie'), t('landing.minutes', { n: readingMinutesTotal })].filter(Boolean).join(' · ')}
            </p>
          </div>

          {start && (
            <aside aria-labelledby="start-here" className="relative flex flex-col gap-3 lg:-mb-4 lg:rotate-[1.2deg]">
              <h2 id="start-here" className="text-label text-ink-soft">
                {t('landing.startHere')}
              </h2>
              <GameSlide gameId={start.game.id} stain={start.lesson.stain} catalog={catalogNumber(start.lesson)} compact tilt={0} />
              <Link to={`/#${start.lesson.slug}`} className="text--1 self-start text-ink-soft underline underline-offset-4 hover:text-ink">
                {t('landing.orRead')}
              </Link>
              {cont && (
                <Link to={cont.to} className="text--1 self-start text-methylene-deep underline underline-offset-4">
                  {t('landing.continue', { label: cont.label })}
                </Link>
              )}
            </aside>
          )}
        </header>

        <section aria-labelledby="path-heading" className="flex flex-col gap-8">
          <h2 id="path-heading" className="font-mono text--1 uppercase tracking-[0.1em] text-ink-soft">
            {t('landing.path')}
          </h2>
          <ol className="flex flex-col gap-10 sm:gap-12">
            {LESSONS.map((lesson) => (
              <TopicBlock key={lesson.slug} lesson={lesson} open={open.includes(lesson.slug)} onToggle={() => toggle(lesson.slug)} />
            ))}
          </ol>
        </section>
      </Container>
    </>
  );
}


