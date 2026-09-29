// Merges every registered stub with its lesson file (if one exists, via Vite glob) and derives lookups.
import { TOPIC_STUBS, UNITS } from './registry.js';

const modules = import.meta.glob(['./*.js', '!./index.js', '!./registry.js'], { eager: true, import: 'default' });

export const TOPICS = TOPIC_STUBS.map((stub) => {
  const lesson = modules[`./${stub.slug}.js`];
  return lesson ? { ...stub, ...lesson } : stub;
}).sort((a, b) => a.order - b.order);

export { UNITS };

export const getTopic = (slug) => TOPICS.find((t) => t.slug === slug) ?? null;

export const isPublished = (topic) => topic?.status === 'published';

export const topicPath = (slugOrTopic) => `/${typeof slugOrTopic === 'string' ? slugOrTopic : slugOrTopic.slug}`;

/** Units in order, each with its topics in curriculum order. */
export const TOPICS_BY_UNIT = UNITS.map((unit) => ({
  ...unit,
  topics: TOPICS.filter((t) => t.unit === unit.id),
})).filter((u) => u.topics.length > 0);

export function neighbors(slug) {
  const i = TOPICS.findIndex((t) => t.slug === slug);
  return { prev: TOPICS[i - 1] ?? null, next: TOPICS[i + 1] ?? null };
}

/** Section ids of a published lesson; stubs have none. */
export const sectionIdsOf = (topic) => (topic.sections ?? []).map((s) => s.id);
