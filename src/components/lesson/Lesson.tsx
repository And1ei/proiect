// A lesson, rendered from its data file. Same component and content on the landing page
// (mode="inline", inside a topic block) and on the topic page (mode="page"). Each section is an
// anchor (/celula#membrana), is marked read after ~1.2 s in view, and games are launched from the
// point where what they need has just been taught.
import { Fragment, useId, useMemo, useRef, useState, useEffect, type ReactNode } from 'react';
import { t } from '../../lib/i18n';
import { cx } from '../../lib/cx';
import { STAIN } from '../../lib/stains';
import { useProgress } from '../../lib/useProgress';
import { catalogNumber, type Lesson as LessonData } from '../../content/ro/lessons/index.ts';
import Inline from './Inline';
import PredictCard from './PredictCard';
import GameSlide from './GameSlide';
import { useReadTracking } from './useReadTracking';

interface Props {
  lesson: LessonData;
  mode: 'inline' | 'page';
  /** Mark sections read while in view (off in previews). */
  track?: boolean;
  /** Extra content after "Pe scurt" (the topic page puts "Verifică-te" there). */
  children?: ReactNode;
}

function SeenMark({ seen }: { seen: boolean }) {
  if (!seen) return null;
  return (
    <span className="text-label inline-flex items-center gap-1 text-ink-soft" title={t('lesson.seen')}>
      <svg aria-hidden="true" viewBox="0 0 12 10" className="w-3">
        <path d="M1.5 5.5 L4.5 8.2 L10.5 1.8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {t('lesson.seen')}
    </span>
  );
}

export default function Lesson({ lesson, mode, track = true, children }: Props) {
  const page = mode === 'page';
  const H = page ? 'h2' : 'h3';
  const s = STAIN[lesson.stain];
  const root = useRef<HTMLElement>(null);
  const [rootEl, setRootEl] = useState<HTMLElement | null>(null);
  useEffect(() => setRootEl(root.current), []);
  const ids = useMemo(() => lesson.sections.map((x) => x.id), [lesson]);
  useReadTracking(lesson.slug, ids, rootEl, track);
  const { topic } = useProgress();
  const read = topic(lesson.slug).sectionsRead;
  const keyId = useId();
  const cat = catalogNumber(lesson);

  return (
    <article ref={root} data-lesson={lesson.slug} className={cx('flex flex-col', page ? 'gap-14 sm:gap-16' : 'gap-10')}>
      {lesson.sections.map((sec, i) => {
        const games = lesson.games.filter((g) => g.afterSection === sec.id);
        const headingId = `${lesson.slug}-${sec.id}-h`;
        return (
          <Fragment key={sec.id}>
            <section
              id={sec.id}
              data-lesson-section={sec.id}
              aria-labelledby={headingId}
              className={cx('grid scroll-mt-28 gap-x-10 gap-y-4', page && 'lg:grid-cols-[minmax(0,40rem)_minmax(0,15rem)]')}
            >
              <div className="flex min-w-0 flex-col gap-4">
                <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className={cx('font-mono text--1 tracking-[0.06em]', s.text)}>
                    {cat}.{i + 1}
                  </span>
                  {sec.cs && <span className="text-label rounded-tag bg-iodine-100 px-2 py-0.5 text-iodine-deep">{t('lesson.cs')}</span>}
                  <SeenMark seen={read.includes(sec.id)} />
                </p>
                <H id={headingId} className={cx('text-balance', page ? 'text-3' : 'text-2')}>
                  {sec.title}
                </H>
                <div className="lesson-body flex max-w-[64ch] flex-col gap-3">
                  {sec.body.map((para, k) => (
                    <p key={k}>
                      <Inline text={para} underline={s.decoration} />
                    </p>
                  ))}
                </div>
                {sec.predict && (
                  <div className="max-w-[56ch]">
                    <PredictCard question={sec.predict.question} answer={sec.predict.answer} />
                  </div>
                )}
              </div>
              {sec.margin && (
                <aside aria-label={t('lesson.margin')} className={cx('self-start', page && 'lg:pt-16')}>
                  <p className={cx('border-l-2 border-dashed pl-3 text--1 leading-body text-ink-soft', s.border)}>
                    <Inline text={sec.margin} />
                  </p>
                </aside>
              )}
            </section>
            {games.map((g, k) => (
              <div key={g.gameId} className={cx('max-w-[40rem]', page ? 'sm:pl-8' : 'sm:pl-4')}>
                <GameSlide gameId={g.gameId} stain={lesson.stain} catalog={cat} tilt={k % 2 ? 1 : -1.2} compact={!page} />
              </div>
            ))}
          </Fragment>
        );
      })}

      {/* "Pe scurt": the three key points, as a clipping pinned to the page */}
      <section aria-labelledby={keyId} className="relative max-w-[40rem] rotate-[0.4deg] rounded-[4px] bg-paper-bright px-5 pb-5 pt-6 shadow-card sm:px-7">
        <span aria-hidden="true" className={cx('absolute left-8 top-2 size-3 rounded-full shadow-[0_1px_0_var(--ink-faint)]', s.bg)} />
        <h3 id={keyId} className="text-label mb-3 text-ink-soft">
          {t('lesson.keyPoints')}
        </h3>
        <ol className="lesson-ol">
          {lesson.keyPoints.map((k) => (
            <li key={k}>
              <Inline text={k} />
            </li>
          ))}
        </ol>
        <p className="mt-4 border-t border-dashed border-ink-faint pt-3 font-display text-1 leading-heading">
          <span className={cx('text-label mr-2 font-body', s.text)}>{t('lesson.why')}</span>
          <Inline text={lesson.whyItMatters} />
        </p>
      </section>

      {lesson.games.length === 0 && <p className="max-w-[40rem] text--1 text-ink-soft">{t('lesson.noGame')}</p>}
      {children}
    </article>
  );
}
