import { useParams } from 'react-router-dom';
import Container from '../components/primitives/Container';
import PageMeta from '../components/layout/PageMeta';
import GameShell from '../games/core/GameShell';
import { getGame } from '../games/registry';
import NotFound from './NotFound';

/** /joc/:gameId, one game inside its shell. Keyed by id so switching games starts fresh. */
export default function GamePage() {
  const { gameId } = useParams();
  const game = getGame(gameId);
  if (!game) return <NotFound />;
  return (
    <Container size="default" className="pt-10 sm:pt-14">
      <PageMeta title={game.title} description={game.tagline} />
      <GameShell key={game.id} definition={game} />
    </Container>
  );
}
