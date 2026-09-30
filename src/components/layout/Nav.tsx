// Site navigation, generated from the lessons and the registry.
//   Desktop (md+): notebook index tabs hanging from the top edge, one per topic in programa order
//   (catalog number, short name, stain edge, its progress dots), plus Jocuri. It scrolls away
//   with the page, so it never covers content, and nothing depends on hover.
//   Phone: a thumb bar at the bottom (Acasă, Jocuri, Cuprins); Cuprins opens a sheet with the topics.
//   Game routes: the nav steps aside for the shell and leaves one clear way back.
import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useMatch } from 'react-router-dom';
import { motion } from 'motion/react';
import { t } from '../../lib/i18n';
import { cx } from '../../lib/cx';
import { spring } from '../../lib/motion';
import { useReducedMotion } from '../../lib/motionPreference';
import { STAIN } from '../../lib/stains';
import { LESSONS, catalogNumber, lessonPath, getLesson } from '../../content/ro/lessons/index.ts';
import { getGame } from '../../games/registry';
import Container from '../primitives/Container';
import Wordmark from '../brand/Wordmark';
import Stamps from '../lesson/Stamps';
import { gameCount } from '../../content/stats';

function IndexTabs() {
  const { pathname } = useLocation();
  const reduced = useReducedMotion();
  return (
    <nav aria-label={t('nav.primaryLabel')} className="hidden min-w-0 md:block">
      <ul className="flex min-w-0 items-start gap-1 lg:gap-1.5">
        {LESSONS.map((lesson) => {
          const active = pathname === lessonPath(lesson.slug);
          const s = STAIN[lesson.stain];
          return (
            <li key={lesson.slug} className="min-w-0">
              <NavLink
                to={lessonPath(lesson.slug)}
                title={lesson.title}
                aria-label={`${catalogNumber(lesson)}. ${lesson.title}`}
                className={cx(
                  'group relative flex min-h-11 max-w-[11.5rem] flex-col gap-1 rounded-b-[10px] border-x border-b border-t-4 px-3 pb-2 pt-2 no-underline shadow-well transition-colors',
                  s.border,
                  active ? 'bg-paper-bright text-ink' : 'bg-paper-deep text-ink-soft hover:bg-paper-bright hover:text-ink',
                )}
              >
                <motion.span
                  className="flex items-baseline gap-2"
                  animate={{ y: active && !reduced ? 4 : 0 }}
                  transition={spring}
                >
                  <span className={cx('font-mono text--2 font-medium', s.text)}>{catalogNumber(lesson)}</span>
                  <span className="truncate text--1 font-medium">{lesson.navTitle}</span>
                </motion.span>
                <Stamps lesson={lesson} size="xs" className="pl-[1.6rem]" />
              </NavLink>
            </li>
          );
        })}
        {gameCount > 0 && (
          <li>
            <NavLink
              to="/jocuri"
              className={({ isActive }) =>
                cx(
                  'flex min-h-11 items-center rounded-b-[10px] border-x border-b border-t-4 border-ink-faint px-3 pb-2 pt-2 text--1 font-medium no-underline shadow-well',
                  isActive ? 'bg-paper-bright text-ink' : 'bg-paper-deep text-ink-soft hover:bg-paper-bright hover:text-ink',
                )
              }
            >
              {t('nav.items.games')}
            </NavLink>
          </li>
        )}
      </ul>
    </nav>
  );
}

function ContentsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby="contents-sheet-title"
      className="game-dialog m-0 mt-auto max-h-[85dvh] w-full max-w-none bg-transparent p-0"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={reduced ? { opacity: 0 } : { y: 40, opacity: 0 }}
        animate={open ? { y: 0, opacity: 1 } : {}}
        transition={spring}
        className="rounded-t-[24px] bg-paper px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 text-ink shadow-card"
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 id="contents-sheet-title" className="text-label text-ink-soft">
            {t('nav.topics')}
          </h2>
          <button type="button" onClick={onClose} className="text-label min-h-11 px-2 text-ink-soft">
            {t('nav.menuClose')}
          </button>
        </div>
        <ol className="flex flex-col">
          {LESSONS.map((lesson) => {
            const s = STAIN[lesson.stain];
            return (
              <li key={lesson.slug} className="border-t border-dashed border-ink-faint">
                <NavLink to={lessonPath(lesson.slug)} onClick={onClose} className={({ isActive }) => cx('flex min-h-14 items-center gap-3 py-2 no-underline', isActive && 'font-semibold')}>
                  <span className={cx('w-8 font-display text-2 leading-none', s.text)}>{catalogNumber(lesson)}</span>
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="font-medium leading-tight">{lesson.title}</span>
                    <Stamps lesson={lesson} />
                  </span>
                </NavLink>
              </li>
            );
          })}
        </ol>
      </motion.div>
    </dialog>
  );
}

function BottomBar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => setOpen(false), [pathname]);
  const onTopic = LESSONS.some((l) => pathname === lessonPath(l.slug));
  const item = 'flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text--2 font-medium no-underline';
  return (
    <>
      <nav aria-label={t('nav.primaryLabel')} className="fixed inset-x-0 bottom-0 z-40 border-t border-dashed border-ink-faint bg-paper-deep pb-[env(safe-area-inset-bottom)] md:hidden">
        <ul className="flex">
          <li className="flex flex-1">
            <NavLink to="/" end className={({ isActive }) => cx(item, isActive ? 'text-ink' : 'text-ink-soft')}>
              <svg aria-hidden="true" viewBox="0 0 20 20" className="w-5">
                <path d="M3 9.5 L10 3.5 L17 9.5 M5 8.5 V16.5 H15 V8.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {t('nav.home')}
            </NavLink>
          </li>
          {gameCount > 0 && (
            <li className="flex flex-1">
              <NavLink to="/jocuri" className={({ isActive }) => cx(item, isActive ? 'text-ink' : 'text-ink-soft')}>
                <svg aria-hidden="true" viewBox="0 0 20 20" className="w-5">
                  <rect x="2.5" y="6" width="15" height="8" rx="2" fill="none" stroke="currentColor" strokeWidth="1.7" />
                  <path d="M5.5 6 V14" stroke="currentColor" strokeWidth="1.7" />
                </svg>
                {t('nav.items.games')}
              </NavLink>
            </li>
          )}
          <li className="flex flex-1">
            <button type="button" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)} className={cx(item, onTopic ? 'text-ink' : 'text-ink-soft')}>
              <svg aria-hidden="true" viewBox="0 0 20 20" className="w-5">
                <path d="M4 5 H16 M4 10 H16 M4 15 H12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
              {t('nav.contentsSheet')}
            </button>
          </li>
        </ul>
      </nav>
      <ContentsSheet open={open} onClose={() => setOpen(false)} />
    </>
  );
}

/** On a game route: the shell owns the screen; one way back (to the game's lesson, or the games). */
function GameBar({ gameId }: { gameId: string }) {
  const game = getGame(gameId);
  const lesson = game ? getLesson(game.topicSlug) : null;
  return (
    <header className="relative z-40 pt-3">
      <Container size="wide" className="flex items-center justify-between gap-4">
        <Link to={lesson ? lessonPath(lesson.slug) : '/jocuri'} className="text-label inline-flex min-h-11 items-center gap-2 text-ink-soft no-underline hover:text-ink">
          <span aria-hidden="true">←</span>
          {lesson ? t('nav.backToLesson', { title: lesson.navTitle }) : t('nav.backToGames')}
        </Link>
        <Wordmark className="" />
      </Container>
    </header>
  );
}

export default function Nav() {
  const game = useMatch('/joc/:gameId');
  if (game?.params.gameId) return <GameBar gameId={game.params.gameId} />;
  return (
    <>
      <header className="relative z-40">
        <Container size="wide" className="flex items-start justify-between gap-4 lg:gap-6">
          <div className="shrink-0 pt-4 sm:pt-5">
            <Wordmark className="" />
          </div>
          <IndexTabs />
        </Container>
      </header>
      <BottomBar />
    </>
  );
}
