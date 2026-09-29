import { t, tp } from '../../lib/i18n';
import { cx } from '../../lib/cx';
import { Pulse } from '../feel/juice';
import StreakBadge from '../feel/StreakBadge';
import SoundToggle from '../feel/SoundToggle';
import Lives from './Lives';
import { useSessionState } from './useGameSession';
import type { GameSession } from './session';
import type { GameDefinition } from './types';

const clock = (ms: number) => {
  const total = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
};

const hudButton =
  'text-label inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-tag px-2.5 py-1 text-ink-soft hover:bg-paper hover:text-ink disabled:opacity-50';

interface Props {
  session: GameSession;
  definition: GameDefinition;
  onHelp: () => void;
  /** Static preview (design-system page): no buttons. */
  preview?: boolean;
  className?: string;
}

/** Score, lives, timer, streak × multiplier, hint use, and the pause / sound / help controls. */
export default function Hud({ session, definition, onHelp, preview = false, className }: Props) {
  const score = useSessionState(session, (s) => s.score);
  const lives = useSessionState(session, (s) => s.lives);
  const maxLives = useSessionState(session, (s) => s.maxLives);
  const streak = useSessionState(session, (s) => s.streak);
  const multiplier = useSessionState(session, (s) => s.multiplier);
  const hintsUsed = useSessionState(session, (s) => s.hintsUsed);
  const paused = useSessionState(session, (s) => s.status === 'paused');
  const timer = definition.hud.timer;
  // Whole seconds only, so the HUD re-renders once a second, not on every tick
  const seconds = useSessionState(session, (s) =>
    Math.floor((timer?.mode === 'down' ? Math.max(0, (timer.limitMs ?? 0) - s.elapsedMs) : s.elapsedMs) / 1000),
  );

  return (
    <div
      role="group"
      aria-label={t('games.hud.label')}
      className={cx('flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-well bg-paper-deep px-3 py-2 shadow-well sm:px-4', className)}
    >
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <dl className="flex flex-wrap items-center gap-x-5 gap-y-1">
          <div className="flex items-baseline gap-2">
            <dt className="text-label text-ink-soft">{t('games.hud.score')}</dt>
            <dd className="font-mono text-2 font-medium leading-none tabular-nums">
              <Pulse value={score}>{score}</Pulse>
            </dd>
          </div>
          {maxLives > 0 && (
            <div className="flex items-center gap-2">
              <dt className="text-label text-ink-soft">{t('games.hud.lives')}</dt>
              <dd className="flex items-center gap-2">
                <Lives lives={lives} max={maxLives} />
                <span className="sr-only">{t('games.hud.livesValue', { n: lives, max: maxLives })}</span>
              </dd>
            </div>
          )}
          {timer && (
            <div className="flex items-baseline gap-2">
              <dt className="text-label text-ink-soft">{t(timer.mode === 'down' ? 'games.hud.timeLeft' : 'games.hud.time')}</dt>
              <dd className="font-mono text-1 tabular-nums">
                <time dateTime={`PT${seconds}S`}>{clock(seconds * 1000)}</time>
              </dd>
            </div>
          )}
        </dl>
        <StreakBadge value={streak} multiplier={multiplier} />
        {definition.hud.hints && hintsUsed > 0 && (
          <span className="text-label inline-flex items-center gap-1.5 rounded-tag bg-methylene-100 px-2 py-1 text-methylene-deep">
            <span aria-hidden="true" className="size-2 rounded-full border border-current" />
            {tp('games.hud.hints', hintsUsed)}
          </span>
        )}
      </div>

      {!preview && (
        <div className="flex flex-wrap items-center gap-1">
          <button type="button" className={hudButton} onClick={() => session.pause()} disabled={paused} aria-keyshortcuts="Escape">
            <svg aria-hidden="true" viewBox="0 0 12 14" className="w-3">
              <path d="M2.5 1.5 C 2.8 5, 2.2 9, 2.6 12.5 M9.4 1.6 C 9.6 5, 9.2 9, 9.5 12.4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
            <span className="sr-only sm:not-sr-only">{t('games.shell.pause')}</span>
          </button>
          <SoundToggle compact />
          <button type="button" className={hudButton} onClick={onHelp}>
            <span aria-hidden="true" className="inline-flex size-4 items-center justify-center rounded-full border border-current font-display text-[0.7rem] leading-none">
              ?
            </span>
            <span className="sr-only sm:not-sr-only">{t('games.shell.howTo')}</span>
          </button>
        </div>
      )}
    </div>
  );
}
