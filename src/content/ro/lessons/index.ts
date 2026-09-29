// All lessons, in programa order, and the helpers every page, the nav and the checks share.
// Plain data + pure functions (erasable TypeScript): scripts import this file directly.
import { celula } from './celula.ts';
import { ecosisteme } from './ecosisteme.ts';
import { diversitateaVietii } from './diversitatea-vietii.ts';
import { impactulUman } from './impactul-uman.ts';
import { laboratorul } from './laboratorul.ts';
import type { Lesson, LessonSection } from './types.ts';

export type { Lesson, LessonSection, QuizQuestion, Stain } from './types.ts';

export const LESSONS: readonly Lesson[] = [celula, ecosisteme, diversitateaVietii, impactulUman, laboratorul];

export const LESSON_SLUGS = LESSONS.map((l) => l.slug);

export const getLesson = (slug: string | undefined | null) => LESSONS.find((l) => l.slug === slug) ?? null;

export const lessonPath = (slug: string) => `/${slug}`;
export const sectionPath = (slug: string, sectionId: string) => `/${slug}#${sectionId}`;

/** "Preparat 03" style catalog number. */
export const catalogNumber = (lesson: Lesson) => String(lesson.number).padStart(2, '0');

export function neighbors(slug: string) {
  const i = LESSONS.findIndex((l) => l.slug === slug);
  return { prev: LESSONS[i - 1] ?? null, next: LESSONS[i + 1] ?? null };
}

// ── Inline markup: **bold** (a term defined there) and *italic* (Latin names) ──
export type InlinePart = { text: string; bold?: true; italic?: true };
export function parseInline(text: string): InlinePart[] {
  const parts: InlinePart[] = [];
  const re = /\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  let last = 0;
  for (const m of text.matchAll(re)) {
    if (m.index > last) parts.push({ text: text.slice(last, m.index) });
    parts.push(m[1] !== undefined ? { text: m[1], bold: true } : { text: m[2], italic: true });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last) });
  return parts;
}
export const plain = (text: string) => parseInline(text).map((p) => p.text).join('');

// ── Reading time: computed from the words, never typed ──
export const WPM = 180;
export const words = (text: string) => plain(text).split(/\s+/).filter(Boolean).length;
export const sectionWords = (s: LessonSection) => s.body.reduce((n, p) => n + words(p), 0);
export const lessonWords = (l: Lesson) => l.sections.reduce((n, s) => n + sectionWords(s) + (s.margin ? words(s.margin) : 0), 0);
export const readingMinutes = (l: Lesson) => Math.max(1, Math.round(lessonWords(l) / WPM));
