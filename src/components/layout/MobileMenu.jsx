import { useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'motion/react';
import { springSettle } from '../../lib/motion';
import { t } from '../../lib/i18n';
import Container from '../primitives/Container';
import Wordmark from '../brand/Wordmark';
import LessonsList from './LessonsList';
import { PAGE_LINKS } from './navLinks';

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Full-screen menu for small screens. Modal: traps focus, locks scroll, Escape closes. */
export default function MobileMenu({ onClose, returnFocusTo }) {
  const panel = useRef(null);
  const closeButton = useRef(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButton.current?.focus();
    const trigger = returnFocusTo.current;

    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key !== 'Tab') return;
      const items = [...panel.current.querySelectorAll(FOCUSABLE)];
      const first = items[0];
      const last = items.at(-1);
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKey);
      trigger?.focus();
    };
  }, [onClose, returnFocusTo]);

  return (
    <motion.div
      ref={panel}
      role="dialog"
      aria-modal="true"
      aria-label={t('nav.menuTitle')}
      className="fixed inset-0 z-50 overflow-y-auto bg-paper lg:hidden"
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={springSettle}
    >
      <Container size="wide" className="flex items-center justify-between gap-4 pb-6 pt-5">
        <Wordmark />
        <button
          ref={closeButton}
          type="button"
          onClick={onClose}
          className="text-label inline-flex min-h-11 items-center gap-2 rounded-btn-b bg-paper-deep px-4 shadow-well"
        >
          <svg aria-hidden="true" viewBox="0 0 12 12" className="w-3">
            <path d="M1.5 1.8 C 4.5 4.6, 7.4 7.6, 10.6 10.4 M10.4 1.6 C 7.6 4.4, 4.6 7.4, 1.6 10.6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          {t('nav.menuClose')}
        </button>
      </Container>

      <Container size="wide" as="nav" aria-label={t('nav.primaryLabel')} className="flex flex-col gap-10 pb-16">
        <LessonsList large onNavigate={onClose} />
        <section aria-labelledby="menu-other-pages">
          <h2 id="menu-other-pages" className="text-label mb-2 text-ink-soft">
            {t('nav.otherPages')}
          </h2>
          <ul className="flex flex-col">
            {PAGE_LINKS.map((link) => (
              <li key={link.to}>
                <NavLink to={link.to} end onClick={onClose} className="block rounded-tag px-2 py-2 text-1 no-underline hover:bg-paper-deep">
                  {t(link.labelKey)}
                </NavLink>
              </li>
            ))}
          </ul>
        </section>
      </Container>
    </motion.div>
  );
}
