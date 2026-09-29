import { useEffect, useState } from 'react';
import { progressStore } from '../../lib/progress';

/**
 * Watches a lesson's sections. A section counts as read once its end marker
 * ([data-section-end]) scrolls into view; the active section is the one whose heading
 * most recently crossed the upper part of the viewport.
 */
export function useSectionTracking(slug, sectionIds) {
  const [activeId, setActiveId] = useState(sectionIds[0]);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined;

    const ends = sectionIds.map((id) => document.querySelector(`[data-section-end="${id}"]`)).filter(Boolean);
    // A fast fling can carry a 1px marker past the viewport between two frames, so on every
    // callback also catch up on any marker that is already above the bottom of the screen
    const readObserver = new IntersectionObserver(() => {
      for (const el of ends) {
        if (el.getBoundingClientRect().top < window.innerHeight) {
          progressStore.markSectionRead(slug, el.dataset.sectionEnd, sectionIds);
        }
      }
    });
    const activeObserver = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setActiveId(hit.target.id);
      },
      { rootMargin: '-10% 0px -75% 0px' },
    );

    ends.forEach((el) => readObserver.observe(el));
    for (const id of sectionIds) {
      const heading = document.getElementById(id);
      if (heading) activeObserver.observe(heading);
    }
    return () => {
      readObserver.disconnect();
      activeObserver.disconnect();
    };
  }, [slug, sectionIds]);

  return activeId;
}
