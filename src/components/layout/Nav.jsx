import { useCallback, useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { cx } from '../../lib/cx';
import { spring } from '../../lib/motion';
import { t } from '../../lib/i18n';
import Container from '../primitives/Container';
import Wordmark from '../brand/Wordmark';
import LessonsDropdown from './LessonsDropdown';
import MobileMenu from './MobileMenu';
import { PAGE_LINKS } from './navLinks';

function PageLink({ to, labelKey }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        cx('relative rounded-tag px-3 py-2 font-medium no-underline', isActive ? 'text-ink' : 'text-ink-soft hover:text-ink')
      }
    >
      {({ isActive }) => (
        <>
          {t(labelKey)}
          {isActive && (
            <motion.span
              layoutId="nav-active"
              aria-hidden="true"
              className="absolute inset-x-3 -bottom-0.5 h-1.5 rounded-blob-a bg-eosin"
              transition={spring}
            />
          )}
        </>
      )}
    </NavLink>
  );
}

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef(null);
  const { pathname } = useLocation();
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header className="relative z-40 pt-3 sm:pt-5">
      <Container size="wide" className="flex items-center justify-between gap-4 py-2">
        <Wordmark />

        <nav aria-label={t('nav.primaryLabel')} className="hidden items-center gap-1 lg:flex">
          <LessonsDropdown />
          {PAGE_LINKS.map((link) => (
            <PageLink key={link.to} {...link} />
          ))}
        </nav>

        <button
          ref={menuButton}
          type="button"
          aria-haspopup="dialog"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(true)}
          className="text-label inline-flex min-h-11 items-center gap-2 rounded-btn-b bg-paper-deep px-4 shadow-well lg:hidden"
        >
          <span aria-hidden="true" className="flex w-4 flex-col gap-[3px]">
            <span className="h-[1.5px] w-full bg-ink" />
            <span className="h-[1.5px] w-3/4 bg-ink" />
          </span>
          {t('nav.menuOpen')}
        </button>
      </Container>

      <AnimatePresence>{menuOpen && <MobileMenu onClose={closeMenu} returnFocusTo={menuButton} />}</AnimatePresence>
    </header>
  );
}
