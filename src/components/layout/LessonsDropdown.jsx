import { useEffect, useId, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { springSettle } from '../../lib/motion';
import { t } from '../../lib/i18n';
import LessonsList from './LessonsList';

/** Desktop "Lecții" disclosure: a panel with every lesson, grouped by unit. */
export default function LessonsDropdown() {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const root = useRef(null);
  const button = useRef(null);
  const { pathname } = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        button.current?.focus();
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

  return (
    <div
      ref={root}
      className="relative"
      onBlur={(e) => !root.current?.contains(e.relatedTarget) && setOpen(false)}
    >
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 rounded-tag px-3 py-2 font-medium text-ink-soft hover:text-ink aria-expanded:text-ink"
      >
        {t('nav.lessons')}
        <svg aria-hidden="true" viewBox="0 0 12 8" className={`w-3 transition-transform duration-spring ease-spring ${open ? 'rotate-180' : ''}`}>
          <path d="M1.5 1.8 C 3.5 3.8, 4.8 5.6, 6 6.2 C 7.4 5.4, 8.8 3.6, 10.5 1.6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={panelId}
            role="region"
            aria-label={t('nav.lessonsLabel')}
            className="absolute right-0 top-full z-50 mt-2 w-[40rem] max-w-[calc(100vw-2rem)] rounded-cell bg-paper-bright p-6 shadow-card"
            initial={{ opacity: 0, y: -8, scaleY: 0.96 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -6, scaleY: 0.98 }}
            transition={springSettle}
            style={{ transformOrigin: 'top right' }}
          >
            <LessonsList onNavigate={() => setOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
