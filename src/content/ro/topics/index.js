// Loads every registered lesson file (Vite glob) and derives lookups from the registry.
import { TOPIC_SLUGS, UNITS } from './registry.js';

const modules = import.meta.glob(['./*.js', '!./index.js', '!./registry.js'], { eager: true, import: 'default' });

export const TOPICS = TOPIC_SLUGS.map((slug) => {
  const topic = modules[`./${slug}.js`];
  if (!topic) throw new Error(`Lesson file missing for registered slug: ${slug}`);
  return topic;
}).sort((a, b) => a.order - b.order);

export { UNITS };

export const getTopic = (slug) => TOPICS.find((t) => t.slug === slug) ?? null;

export const topicPath = (slugOrTopic) => `/${typeof slugOrTopic === 'string' ? slugOrTopic : slugOrTopic.slug}`;

/** Units in order, each with its lessons in curriculum order. */
export const TOPICS_BY_UNIT = UNITS.map((unit) => ({
  ...unit,
  topics: TOPICS.filter((t) => t.unit === unit.id),
})).filter((u) => u.topics.length > 0);

export function neighbors(slug) {
  const i = TOPICS.findIndex((t) => t.slug === slug);
  return { prev: TOPICS[i - 1] ?? null, next: TOPICS[i + 1] ?? null };
}

export const sectionIdsOf = (topic) => topic.sections.map((s) => s.id);
