// Navigation, generated from the lesson registry. Lessons are grouped by unit in curriculum order.
import { TOPICS_BY_UNIT, topicPath } from '../../content/ro/topics/index.js';

export const LESSON_GROUPS = TOPICS_BY_UNIT.map((unit) => ({
  id: unit.id,
  title: unit.title,
  grade: unit.grade,
  links: unit.topics.map((topic) => ({
    to: topicPath(topic),
    slug: topic.slug,
    number: String(topic.fig.number).padStart(2, '0'),
    title: topic.title,
  })),
}));

// Pages outside the lessons; labels come from ui.js
export const PAGE_LINKS = [
  { to: '/', labelKey: 'nav.items.contents' },
  { to: '/jocuri', labelKey: 'nav.items.games' },
  { to: '/dictionar', labelKey: 'nav.items.glossary' },
  { to: '/despre', labelKey: 'nav.items.about' },
  { to: '/credite', labelKey: 'nav.items.credits' },
];
