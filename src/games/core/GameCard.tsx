import { Link } from 'react-router-dom';
import { t, tp } from '../../lib/i18n';
import { cx } from '../../lib/cx';
import { useProgress } from '../../lib/useProgress';
import SpecimenCard from '../../components/primitives/SpecimenCard';
import { gamePath } from '../registry';
import type { GameFamily } from '../../content/stats';
import { preloadGame } from './preload';
import Stars from './Stars';
import type { GameDefinition, Stars as StarCount } from './types';

function LevelLink({ game, advanced }: { game: GameDefinition; advanced: boolean }) {
  const { game: progressOf } = useProgress();
  const p = progressOf(game.id);
  const intent = () => preloadGame(game);
  return (
    <li>
      <Link
        to={gamePath(game.id)}
        onPointerEnter={intent}
        onFocus={intent}
        aria-label={`${t('games.play')} „${game.title}”`}
        className={cx(
          'flex min-h-11 flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-btn-b border px-4 py-2 text-ink no-underline shadow-rest hover:bg-paper',
          advanced ? 'border-iodine-deep' : 'border-methylene-deep',
        )}
      >
        <span className="flex flex-col">
          <span className={cx('text-label', advanced ? 'text-iodine-deep' : 'text-methylene-deep')}>{advanced ? t('games.levels.advanced') : t('games.levels.base')}</span>
          <span className="text--1 text-ink-soft">
            {t('games.minutes', { n: game.estimatedMinutes })} · {t(`games.difficulty.${game.difficulty}`)}
            {p.plays > 0 && ` · ${t('games.best', { score: p.bestScore })} · ${tp('games.plays', p.plays)}`}
          </span>
        </span>
        <span className="flex items-center gap-3">
          {p.plays > 0 && <Stars value={p.stars as StarCount} size="sm" />}
          <span aria-hidden="true" className="text-label">
            {t('games.play')} →
          </span>
        </span>
      </Link>
    </li>
  );
}

/**
 * A game as a specimen card: title, tagline, and one button per level (base first, then the
 * advanced twin) with its length, difficulty and the player's record. Hovering or focusing a level
 * preloads its code (and the Phaser chunk for Phaser games).
 */
export default function GameCard({ family, fig }: { family: GameFamily; fig: number }) {
  const { base } = family;
  return (
    <li className="flex">
      <SpecimenCard
        fig={fig}
        name={base.sandbox ? t('games.sandboxTag') : t('games.tag')}
        labelTone={base.sandbox ? 'iodine' : 'methylene'}
        title={base.title}
        className="w-full"
      >
        <p>{base.tagline}</p>
        <ul aria-label={t('games.levels.label')} className="mt-4 flex flex-col gap-2">
          {family.levels.map((g) => (
            <LevelLink key={g.id} game={g} advanced={g.id !== base.id} />
          ))}
        </ul>
      </SpecimenCard>
    </li>
  );
}
