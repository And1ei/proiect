import { t, tp } from '../../lib/i18n';
import { useProgress } from '../../lib/useProgress';
import SpecimenCard from '../../components/primitives/SpecimenCard';
import { gamePath } from '../registry';
import { preloadGame } from './preload';
import Stars from './Stars';
import type { GameDefinition, Stars as StarCount } from './types';

/**
 * A game as a specimen card: title, tagline, length, difficulty and the player's record. Hovering
 * or focusing it preloads the game's code (and the Phaser chunk for Phaser games).
 */
export default function GameCard({ game, fig, cta = false }: { game: GameDefinition; fig: number; cta?: boolean }) {
  const { game: progressOf } = useProgress();
  const p = progressOf(game.id);
  const intent = () => preloadGame(game);
  return (
    <li onPointerEnter={intent} onFocus={intent} className="flex">
      <SpecimenCard
        to={gamePath(game.id)}
        fig={fig}
        name={game.sandbox ? t('games.sandboxTag') : t('games.tag')}
        labelTone={game.sandbox ? 'iodine' : 'methylene'}
        title={game.title}
        className="w-full"
        meta={
          <>
            <span>{t('games.minutes', { n: game.estimatedMinutes })}</span>
            <span>{t(`games.difficulty.${game.difficulty}`)}</span>
            {p.plays > 0 && <span>{t('games.best', { score: p.bestScore })}</span>}
            {p.plays > 0 && <span>{tp('games.plays', p.plays)}</span>}
          </>
        }
      >
        <p>{game.tagline}</p>
        {p.plays > 0 && <Stars value={p.stars as StarCount} size="sm" className="mt-3" />}
        {cta && (
          <span aria-hidden="true" className="text-label mt-4 inline-flex items-center gap-2 text-methylene-deep">
            {t('games.play')}
            <svg viewBox="0 0 16 10" className="w-4">
              <path d="M1 5.2 C 5 4.6, 10 5.4, 14 5 M10.5 1.5 L 14.4 5 L 10.6 8.6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        )}
      </SpecimenCard>
    </li>
  );
}
