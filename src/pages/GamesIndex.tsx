import { TOPICS } from '../content/ro/topics';
import { t, tp } from '../lib/i18n';
import { useProgress } from '../lib/useProgress';
import Container from '../components/primitives/Container';
import SpecimenLabel from '../components/primitives/SpecimenLabel';
import SpecimenCard from '../components/primitives/SpecimenCard';
import PageMeta from '../components/layout/PageMeta';
import Blob from '../components/primitives/Blob';
import { GAMES, gamePath, gamesForTopic } from '../games/registry';
import { preloadGame } from '../games/core/preload';
import Stars from '../games/core/Stars';
import type { GameDefinition, Stars as StarCount } from '../games/core/types';

function GameCard({ game, fig }: { game: GameDefinition; fig: number }) {
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
      </SpecimenCard>
    </li>
  );
}

/** Arcade index: every registered game, grouped by topic in programa order. */
export default function GamesIndex() {
  const groups = TOPICS.map((topic) => ({ topic, games: gamesForTopic(topic.slug) })).filter((g) => g.games.length);

  return (
    <Container size="default" className="flex flex-col gap-12 pt-10 sm:pt-16">
      <PageMeta title={t('games.title')} />
      <header className="flex max-w-measure flex-col items-start gap-5">
        <SpecimenLabel tone="methylene" tilt>
          {t('games.label')}
        </SpecimenLabel>
        <h1 className="text-display text-5 sm:text-6">{t('games.heading')}</h1>
        <p className="prose-body">{t('games.intro')}</p>
      </header>

      {GAMES.length === 0 ? (
        <section className="relative flex flex-col items-start gap-4 overflow-hidden rounded-cell border-2 border-dashed border-ink-faint p-6 sm:flex-row sm:items-center sm:gap-8 sm:p-8">
          <Blob shape="bean" tone="iodine" membrane className="size-20 shrink-0" />
          <p className="prose-body">{t('games.empty')}</p>
        </section>
      ) : (
        groups.map(({ topic, games }) => (
          <section key={topic.slug} aria-labelledby={`games-${topic.slug}`} className="flex flex-col gap-4">
            <h2 id={`games-${topic.slug}`} className="flex flex-wrap items-baseline gap-x-4 text-2">
              <span>{topic.title}</span>
            </h2>
            <ul className="grid gap-5 sm:grid-cols-2">
              {games.map((game) => (
                <GameCard key={game.id} game={game} fig={topic.fig.number} />
              ))}
            </ul>
          </section>
        ))
      )}
    </Container>
  );
}
