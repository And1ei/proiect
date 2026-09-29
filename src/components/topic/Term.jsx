import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { glossaryById } from '../../content/ro/glossary';
import { t } from '../../lib/i18n';

const EDGE = 12; // min distance from the viewport edge, px

/**
 * Inline glossary term. Click, Enter or Space opens a popover with the definition; Escape,
 * a second press, or clicking elsewhere closes it. A span with role="button" (not <button>)
 * so multi-word terms can wrap across lines inside a paragraph.
 */
export default function Term({ id, children }) {
  const entry = glossaryById[id];
  const [open, setOpen] = useState(false);
  const [shift, setShift] = useState(0);
  const popId = useId();
  const root = useRef(null);
  const trigger = useRef(null);
  const pop = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    const onPointer = (e) => !root.current?.contains(e.target) && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [open]);

  // Keep the popover inside the viewport
  useLayoutEffect(() => {
    if (!open || !pop.current) return setShift(0);
    const r = pop.current.getBoundingClientRect();
    const overflowRight = r.right - (window.innerWidth - EDGE);
    const overflowLeft = EDGE - r.left;
    setShift(overflowRight > 0 ? -overflowRight : overflowLeft > 0 ? overflowLeft : 0);
  }, [open]);

  if (!entry) return children;

  const toggle = () => setOpen((o) => !o);
  const onKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle();
    }
  };

  return (
    <span ref={root} className="relative">
      <span
        ref={trigger}
        role="button"
        tabIndex={0}
        aria-expanded={open}
        aria-describedby={open ? popId : undefined}
        onClick={toggle}
        onKeyDown={onKeyDown}
        onBlur={(e) => !root.current?.contains(e.relatedTarget) && setOpen(false)}
        data-cursor
        className="cursor-help rounded-[3px] underline decoration-methylene decoration-dotted decoration-2 underline-offset-[0.22em] hover:bg-methylene-50 aria-expanded:bg-methylene-100"
      >
        {children ?? entry.term}
      </span>
      {open && (
        <span
          ref={pop}
          id={popId}
          role="tooltip"
          style={{ transform: `translateX(${shift}px)` }}
          className="absolute left-0 top-full z-30 mt-2 block w-72 max-w-[calc(100vw-2rem)] rounded-well bg-paper-bright p-4 text--1 leading-body text-ink shadow-card ring-1 ring-ink-faint"
        >
          <span className="text-label mb-1 block text-methylene-deep">{entry.term}</span>
          <span className="block hyphens-auto">{entry.definition}</span>
          {entry.seeAlso?.length > 0 && (
            <span className="text-label mt-2 block text-ink-soft">
              {t('glossary.seeAlso')}: {entry.seeAlso.map((id) => glossaryById[id]?.term).join(', ')}
            </span>
          )}
        </span>
      )}
    </span>
  );
}
