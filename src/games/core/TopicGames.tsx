import { useId } from 'react';
import { t } from '../../lib/i18n';
import { gamesForTopic } from '../registry';
import GameCard from './GameCard';

/**
 * "Joacă" section for a topic page (published lesson or "În curând" stub): every registered game
 * whose topicSlug matches, as cards. Renders nothing when the topic has no games yet.
 */
export default function TopicGames({ slug, fig }: { slug: string; fig: number }) {
  const games = gamesForTopic(slug);
  const id = useId();
  if (!games.length) return null;
  return (
    <section aria-labelledby={id} className="flex flex-col gap-4">
      <h2 id={id} className="text-3">
        {t('games.topicHeading')}
      </h2>
      <ul className="grid gap-5 sm:grid-cols-2">
        {games.map((game) => (
          <GameCard key={game.id} game={game} fig={fig} cta />
        ))}
      </ul>
    </section>
  );
}
