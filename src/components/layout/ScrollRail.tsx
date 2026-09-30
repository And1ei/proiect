// How far down the page you are, as a notebook margin rule: a slim dashed ink line on the left edge
// that fills with the stain of the part you are reading, with a tick at each real section of the
// page (the topic blocks on the landing page, the lesson sections on a topic page, the topics on
// /jocuri). The current section's tick is inked and longer. Decorative: aria-hidden, no pointer
// events, never on a game route, hidden when the page doesn't scroll. Native scrolling untouched.
//
// Progress is the document's: scrollY / (scrollHeight − innerHeight), 0 at the top and 1 at the
// bottom. It is re-measured on scroll, on resize, when the document's size changes (ResizeObserver:
// blocks opening, lazy pages arriving, fonts loading) and on every route change. Marks are elements
// inside <main> with data-rail-mark="<stain>".
import { useEffect, useRef, useState } from 'react';
import { useLocation, useMatch } from 'react-router-dom';
import { motion, useMotionValue, useSpring } from 'motion/react';
import { spring } from '../../lib/motion';
import { useReducedMotion } from '../../lib/motionPreference';

interface Mark {
  at: number;
  stain: string;
}

const clamp = (n: number) => Math.min(1, Math.max(0, n));
/** A section counts as reached when its top passes this share of the viewport. */
const READ_LINE = 0.3;
/** Below this many pixels of scroll the page counts as not scrollable. */
const MIN_SCROLL = 48;

export default function ScrollRail() {
  const { pathname } = useLocation();
  const inGame = useMatch('/joc/:gameId') !== null;
  const reduced = useReducedMotion();
  const progress = useMotionValue(0);
  const smooth = useSpring(progress, { stiffness: 190, damping: 28, mass: 0.6, restDelta: 0.0005 });
  const [marks, setMarks] = useState<Mark[]>([]);
  const [current, setCurrent] = useState(-1);
  const [scrollable, setScrollable] = useState(false);
  const marksRef = useRef<Mark[]>([]);

  useEffect(() => {
    if (inGame) return undefined;
    let frame = 0;
    let max = 1;

    const onScroll = () => {
      const p = max > MIN_SCROLL ? clamp(window.scrollY / max) : 0;
      progress.set(p);
      let cur = -1;
      marksRef.current.forEach((m, i) => {
        if (m.at <= p + 0.001) cur = i;
      });
      setCurrent(cur);
    };

    const measure = () => {
      frame = 0;
      max = document.documentElement.scrollHeight - window.innerHeight;
      setScrollable(max > MIN_SCROLL);
      const next = [...document.querySelectorAll<HTMLElement>('main [data-rail-mark]')].map((el) => ({
        at: max > 0 ? clamp((el.getBoundingClientRect().top + window.scrollY - window.innerHeight * READ_LINE) / max) : 0,
        stain: el.dataset.railMark || 'ink-soft',
      }));
      const prev = marksRef.current;
      if (next.length !== prev.length || next.some((m, i) => Math.abs(m.at - prev[i].at) > 0.001 || m.stain !== prev[i].stain)) {
        marksRef.current = next;
        setMarks(next);
      }
      onScroll();
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', schedule);
    const ro = new ResizeObserver(schedule);
    ro.observe(document.documentElement);
    ro.observe(document.body);
    document.fonts?.ready.then(schedule);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', schedule);
      ro.disconnect();
    };
  }, [pathname, inGame, progress]);

  if (inGame) return null;
  const stain = marks[Math.max(0, current)]?.stain ?? 'ink-soft';
  const move = reduced ? { duration: 0 } : spring;

  return (
    <motion.div
      aria-hidden="true"
      data-scroll-rail=""
      className="pointer-events-none fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] left-[max(0.25rem,env(safe-area-inset-left))] top-24 z-20 w-2.5 md:bottom-12 md:top-28 lg:left-3"
      initial={false}
      animate={{ opacity: scrollable ? 1 : 0 }}
      transition={move}
    >
      <span className="absolute inset-y-0 left-[calc(50%-0.5px)] border-l border-dashed border-ink-faint" />
      <motion.span
        data-rail-fill=""
        className="absolute inset-y-0 left-[calc(50%-1.5px)] w-[3px] origin-top rounded-full"
        style={{ scaleY: reduced ? progress : smooth, background: `var(--${stain})` }}
      />
      {marks.map((m, i) => (
        <motion.span
          key={i}
          className="absolute left-0 h-[1.5px] w-full origin-left rounded-full"
          style={{ top: `${m.at * 100}%`, background: i === current ? `var(--${m.stain})` : 'var(--ink-soft)' }}
          initial={false}
          animate={{ scaleX: i === current ? 1.5 : 0.7, opacity: i <= current ? 1 : 0.55 }}
          transition={move}
        />
      ))}
    </motion.div>
  );
}
