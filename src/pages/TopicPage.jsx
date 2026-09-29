import { getTopic } from '../content/ro/topics';
import NotFound from './NotFound';
import TopicComingSoon from './TopicComingSoon';

export default function TopicPage({ slug }) {
  const topic = getTopic(slug);
  if (!topic) return <NotFound />;
  return <TopicComingSoon topic={topic} />;
}
