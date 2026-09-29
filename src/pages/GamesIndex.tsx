import { LESSONS as TOPICS } from '../content/ro/lessons/index.ts';
import { useEffect } from 'react';
import { t } from '../lib/i18n';
import Container from '../components/primitives/Container';
import SpecimenLabel from '../components/primitives/SpecimenLabel';
import PageMeta from '../components/layout/PageMeta';
import Blob from '../components/primitives/Blob';
import { GAMES, gamesForTopic } from '../games/registry';
import GameCard from '../games/core/GameCard';
import { preloadPhaser } from '../games/phaser/loadPhaser';

/** Arcade index: every registered game, grouped by topic in programa order. */
export default function GamesIndex() {
  const groups = TOPICS.map((topic) => ({ topic, games: gamesForTopic(topic.slug) })).filter((g) => g.games.length);

  // Idle time on the arcade: fetch the Phaser chunk so the first Phaser game opens quickly
  useEffect(() => {
    if (!GAMES.some((game) => game.usesPhaser)) return undefined;
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1200));
    const cancel = window.cancelIdleCallback ?? window.clearTimeout;
    const id = idle(() => preloadPhaser(), { timeout: 4000 });
    return () => cancel(id);
  }, []);

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
                <GameCard key={game.id} game={game} fig={topic.number} />
              ))}
            </ul>
          </section>
        ))
      )}
    </Container>
  );
}
