// Navigation, generated from the lessons (in programa order) and the pages outside them.
import { LESSONS, catalogNumber, lessonPath } from '../../content/ro/lessons/index.ts';

export const LESSON_LINKS = LESSONS.map((lesson) => ({
  to: lessonPath(lesson.slug),
  slug: lesson.slug,
  number: catalogNumber(lesson),
  title: lesson.title,
  lesson,
}));

// Kept for the old layout pieces until the nav rewrite (S1 part 5)
export const LESSON_GROUPS = [{ id: 1, title: 'Biologie, clasa a IX-a', grade: 'a IX-a', links: LESSON_LINKS }];

// Pages outside the lessons; labels come from ui.js
export const PAGE_LINKS = [
  { to: '/', labelKey: 'nav.items.contents' },
  { to: '/jocuri', labelKey: 'nav.items.games' },
  { to: '/despre', labelKey: 'nav.items.about' },
  { to: '/credite', labelKey: 'nav.items.credits' },
];
