import { useEffect, useId, useRef, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { t } from '../../lib/i18n';
import { spring } from '../../lib/motion';
import BlobButton from '../../components/primitives/BlobButton';
import SpecimenStamp from '../feel/SpecimenStamp';
import Stars from './Stars';
import type { RunResult, Stars as StarCount } from './types';

const clock = (ms: number) => {
  const total = Math.round(ms / 1000);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
};

export interface ResultsData {
  result: RunResult;
  stars: StarCount;
  /** Personal best before this run (0 on the first play). */
  bestBefore: number;
  /** Total plays including this one. */
  plays: number;
  /** A line from the 'finish' or 'tryAgain' pool, picked once when the run ended. */
  line: string;
}

interface Props extends ResultsData {
  onAgain: () => void;
  /** "Înapoi la lecție": the next unread section of the lesson (primary button). */
  backTo: string;
  /** Opens the lesson sheet at 'slug#section' (recap links). */
  onOpenSection?: (ref: string) => void;
  /** After a run with help or several misses: the section that explains it. */
  explains?: { ref: string; title: string } | null;
  /** Design-system preview: no focus steal, no stamp animation. */
  preview?: boolean;
}

/**
 * End of a run: score, stars, personal best, plays, and an honest stamp: "Completat" for a clean
 * win, "Completat cu ajutor" whenever a hint was used. "Din nou" / "Înapoi la lecție".
 * When the game sent a recap (RunResult.recap), up to 3 "Ce ai învățat" items follow.
 */
export default function ResultsScreen({ result, stars, bestBefore, plays, line, onAgain, backTo, onOpenSection, explains, preview = false }: Props) {
  const heading = useRef<HTMLHeadingElement>(null);
  const recapId = useId();
  const won = result.outcome === 'won';
  const newBest = result.score > bestBefore && plays > 1;
  const best = Math.max(bestBefore, result.score);

  useEffect(() => {
    if (!preview) heading.current?.focus();
  }, [preview]);

  const stats: [string, ReactNode][] = [
    [t('games.results.best'), newBest ? <span className="text-eosin-deep">{best} · {t('games.results.newBest')}</span> : best],
    [t('games.results.plays'), plays],
    [t('games.results.time'), clock(result.elapsedMs)],
    [t('games.results.bestStreak'), result.bestStreak],
  ];

  return (
    <div className="grid gap-8 p-2 sm:p-4 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-12">
      <div className="flex flex-col items-start gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <h2 ref={heading} tabIndex={-1} className="text-display text-4 focus:outline-none sm:text-5">
            {t(won ? 'games.results.wonHeading' : 'games.results.lostHeading')}
          </h2>
          {won && <SpecimenStamp variant={result.hintsUsed > 0 ? 'cu-ajutor' : 'completat'} stampIn={!preview} />}
        </div>
        <p className="prose-body text-1">{line}</p>
        {explains && onOpenSection && (
          <p className="text--1">
            <button type="button" onClick={() => onOpenSection(explains.ref)} className="text-left text-methylene-deep underline underline-offset-4">
              {t('sheet.explains', { title: `„${explains.title}”` })}
            </button>
          </p>
        )}
        <div className="flex items-end gap-6">
          <div className="flex flex-col">
            <span className="text-label text-ink-soft">{t('games.results.score')}</span>
            <motion.span
              className="font-mono text-6 font-medium leading-none tabular-nums"
              initial={preview ? false : { scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={spring}
            >
              {result.score}
            </motion.span>
          </div>
          <div className="flex flex-col gap-1 pb-1">
            <span className="text-label text-ink-soft">{t('games.results.stars')}</span>
            <Stars value={stars} size="lg" animate={!preview} />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 rounded-well bg-paper-deep p-5 shadow-well">
          {stats.map(([label, value]) => (
            <div key={label} className="flex flex-col gap-0.5">
              <dt className="text-label text-ink-soft">{label}</dt>
              <dd className="font-mono text-1 tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="flex flex-wrap gap-3">
          <BlobButton to={backTo}>{t('games.results.back')}</BlobButton>
          <BlobButton variant="paper" shape="b" onClick={onAgain}>
            {t('games.results.again')}
          </BlobButton>
        </div>
      </div>

      {!!result.recap?.length && (
        <section aria-labelledby={recapId} className="flex flex-col gap-3 lg:col-span-2">
          <h3 id={recapId} className="text-label text-ink-soft">
            {t('games.results.recapHeading')}
          </h3>
          <ul className="grid gap-3 md:grid-cols-3">
            {result.recap.slice(0, 3).map((item, i) => (
              <motion.li
                key={item.title}
                className="flex flex-col gap-1.5 rounded-well border border-dashed border-ink-faint bg-paper px-4 py-3"
                initial={preview ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...spring, delay: preview ? 0 : 0.25 + i * 0.08 }}
              >
                <span className="font-display text-1 leading-heading">{item.title}</span>
                <span className="text--1 leading-body">{item.text}</span>
                {item.section && onOpenSection && (
                  <button type="button" onClick={() => onOpenSection(item.section!)} className="text-label mt-1 self-start text-methylene-deep underline decoration-dotted underline-offset-4">
                    → {t('sheet.see')}
                  </button>
                )}
              </motion.li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
