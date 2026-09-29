import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { t } from '../../lib/i18n';
import { cx } from '../../lib/cx';
import { spring } from '../../lib/motion';
import { useReducedMotion } from '../../lib/motionPreference';
import { useProgress } from '../../lib/useProgress';
import { getGame, gamePath } from '../../games/registry';
import { preloadGame } from '../../games/core/preload';
import Stars from '../../games/core/Stars';
import type { Stars as StarCount } from '../../games/core/types';
import { STAIN } from '../../lib/stains';
import type { Stain } from '../../content/ro/lessons/index.ts';

/**
 * A game as a glass microscope slide: a frosted label strip (stain-coloured, with the catalog mark)
 * and the game on the glass. Hangs slightly off the reading column. Renders nothing for an id that
 * isn't registered, so lessons keep working when a game is missing.
 */
export default function GameSlide({ gameId, stain, catalog, tilt = -1.2, compact = false }: { gameId: string; stain: Stain; catalog: string; tilt?: number; compact?: boolean }) {
  const game = getGame(gameId);
  const reduced = useReducedMotion();
  const { game: progressOf } = useProgress();
  if (!game) return null;
  const p = progressOf(game.id);
  const s = STAIN[stain];
  const intent = () => preloadGame(game);
  const advanced = game.id.endsWith('-avansat');

  return (
    <motion.div
      className={cx('relative', !compact && 'lg:-mr-24')}
      style={{ rotate: reduced ? 0 : tilt }}
      whileHover={reduced ? undefined : { rotate: 0, y: -2 }}
      transition={spring}
      onPointerEnter={intent}
      onFocus={intent}
    >
      <Link
        to={gamePath(game.id)}
        className="group flex min-h-24 overflow-hidden rounded-[10px] border border-ink-faint text-ink no-underline shadow-card"
        style={{ background: 'linear-gradient(100deg, var(--paper-bright) 0%, var(--paper) 100%)' }}
      >
        {/* the frosted label end of the slide */}
        <span className={cx('flex w-16 shrink-0 flex-col items-center justify-between py-3 font-mono text--2 uppercase tracking-[0.08em] text-paper-bright sm:w-20', s.bg)}>
          <span>{t('lesson.slideGame')}</span>
          <span className="text-2 font-medium leading-none">{catalog}</span>
          <span>{advanced ? 'CS' : 'TC'}</span>
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-1 px-4 py-3">
          <span className="text-label text-ink-soft">
            {t('games.minutes', { n: game.estimatedMinutes })} · {t(`games.difficulty.${game.difficulty}`)}
          </span>
          <span className="font-display text-1 leading-heading">{game.title}</span>
          {!compact && <span className="text--1 leading-body text-ink-soft">{game.tagline}</span>}
          <span className="mt-1 flex items-center justify-between gap-3">
            <span className={cx('text-label inline-flex items-center gap-1.5', s.text)}>
              {t('games.play')}
              <svg aria-hidden="true" viewBox="0 0 16 10" className="w-4 transition-transform group-hover:translate-x-0.5">
                <path d="M1 5.2 C 5 4.6, 10 5.4, 14 5 M10.5 1.5 L 14.4 5 L 10.6 8.6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            {p.plays > 0 && <Stars value={p.stars as StarCount} size="sm" />}
          </span>
        </span>
      </Link>
    </motion.div>
  );
}
