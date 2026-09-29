import { useEffect } from 'react';
import { progressStore } from '../../lib/progress';

const DWELL_MS = 1200;

/**
 * Marks a section read once it has been in view for about 1.2 s (IntersectionObserver).
 * Sections are the elements with [data-lesson-section] inside `root` (or the document).
 */
export function useReadTracking(slug: string, sectionIds: string[], root: HTMLElement | null, enabled = true) {
  useEffect(() => {
    if (!enabled || typeof IntersectionObserver === 'undefined') return undefined;
    const scope: ParentNode = root ?? document;
    const timers = new Map<string, ReturnType<typeof setTimeout>>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const id = (e.target as HTMLElement).dataset.lessonSection!;
          if (e.isIntersecting) {
            if (!timers.has(id)) timers.set(id, setTimeout(() => progressStore.markSectionRead(slug, id, sectionIds), DWELL_MS));
          } else {
            clearTimeout(timers.get(id));
            timers.delete(id);
          }
        }
      },
      // "in view": at least a good part of it, or it fills most of a short screen
      { threshold: [0.35], rootMargin: '0px 0px -10% 0px' },
    );
    for (const id of sectionIds) {
      const el = scope.querySelector(`[data-lesson-section="${id}"]`);
      if (el) observer.observe(el);
    }
    return () => {
      observer.disconnect();
      timers.forEach((t) => clearTimeout(t));
    };
  }, [slug, sectionIds, root, enabled]);
}
