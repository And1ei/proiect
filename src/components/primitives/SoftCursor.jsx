import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, useMotionValue, useSpring } from 'motion/react';
import { useReducedMotion } from '../../lib/motionPreference';
import { springFollow } from '../../lib/motion';
import { useMediaQuery } from '../../lib/useMediaQuery';

const INTERACTIVE = 'a[href], button:not([disabled]), [role="button"], [role="switch"], select, label[for], summary, [data-cursor]';
const TEXT_ENTRY = 'input:not([type="button"],[type="submit"],[type="reset"],[type="checkbox"],[type="radio"],[type="range"],[type="color"],[type="file"]), textarea, [contenteditable="true"]';
// Game stages need the exact pointer: a spring-trailing ring would lag behind the aim
const NATIVE_CURSOR = `${TEXT_ENTRY}, [data-game-stage]`;
const PULL = 0.2; // how far the ring leans toward a hovered element's centre (0–1)
const stretch = { type: 'spring', stiffness: 180, damping: 16 };

/**
 * Small soft ring that trails the pointer. Over an interactive element it grows and
 * stretches toward that element's centre. Mounts only when some pointer is a real mouse
 * or trackpad; hides itself for touch/pen input and over text fields.
 */
export default function SoftCursor() {
  // any-*: hybrid laptops report a coarse primary pointer but still have a trackpad
  const hasFinePointer = useMediaQuery('(any-hover: hover) and (any-pointer: fine)');
  const reduce = useReducedMotion();
  if (!hasFinePointer || reduce) return null;
  return <Ring />;
}

function Ring() {
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(false);
  const [engaged, setEngaged] = useState(false);
  const last = useRef(null); // last mouse position, for re-checks without movement
  const pressed = useRef(false);

  const x = useSpring(useMotionValue(-100), springFollow);
  const y = useSpring(useMotionValue(-100), springFollow);
  const angle = useMotionValue(0);
  const scaleX = useSpring(1, stretch);
  const scaleY = useSpring(1, stretch);

  // Place and shape the ring for a pointer at (px, py), based on what is under it right now
  const update = useRef(() => {});
  update.current = (px, py) => {
    const hit = document.elementFromPoint(px, py);
    const press = pressed.current ? 0.82 : 1;

    if (hit?.closest(NATIVE_CURSOR)) {
      setVisible(false); // native cursor takes over (see global.css)
      return;
    }
    setVisible(true);

    const target = hit?.closest(INTERACTIVE);
    if (!target) {
      x.set(px);
      y.set(py);
      scaleX.set(press);
      scaleY.set(press);
      setEngaged(false);
      return;
    }

    const r = target.getBoundingClientRect();
    const dx = r.left + r.width / 2 - px;
    const dy = r.top + r.height / 2 - py;
    // Stretch grows with distance from centre, relative to the element's size
    const reach = Math.min(Math.hypot(dx, dy) / (Math.max(r.width, r.height) / 2), 1);
    const s = 1 + reach * 0.35;

    x.set(px + dx * PULL);
    y.set(py + dy * PULL);
    angle.set((Math.atan2(dy, dx) * 180) / Math.PI);
    scaleX.set(1.7 * s * press);
    scaleY.set((1.7 / s) * press);
    setEngaged(true);
  };

  useEffect(() => {
    const isMouse = (e) => e.pointerType === 'mouse';
    const onMove = (e) => {
      if (!isMouse(e)) return setVisible(false);
      last.current = { x: e.clientX, y: e.clientY };
      update.current(e.clientX, e.clientY);
    };
    const onDown = (e) => {
      pressed.current = true;
      onMove(e);
    };
    const onUp = (e) => {
      pressed.current = false;
      onMove(e);
    };
    // Content can move under a still pointer; re-check against the last known position
    let frame = 0;
    const recheck = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => last.current && update.current(last.current.x, last.current.y));
    };
    const onLeave = () => {
      last.current = null;
      setVisible(false);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    window.addEventListener('scroll', recheck, { passive: true, capture: true });
    window.addEventListener('resize', recheck, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('scroll', recheck, { capture: true });
      window.removeEventListener('resize', recheck);
      document.documentElement.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  // New route = new content under the pointer; wait a frame for it to render
  useEffect(() => {
    const id = requestAnimationFrame(() => last.current && update.current(last.current.x, last.current.y));
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  // Hide the native cursor only while the ring is actually on screen
  useEffect(() => {
    document.documentElement.toggleAttribute('data-soft-cursor', visible);
    return () => document.documentElement.removeAttribute('data-soft-cursor');
  }, [visible]);

  return (
    <motion.div
      aria-hidden="true"
      data-soft-cursor-ring
      className="pointer-events-none fixed left-0 top-0 z-[80]"
      style={{ x, y, rotate: angle, opacity: visible ? 1 : 0 }}
    >
      {/* Rotation lives on the parent so the child's scaleX stretches along the pointing direction */}
      <motion.div
        className="-ml-3.5 -mt-3.5 size-7 border-[1.5px] border-ink"
        style={{
          scaleX,
          scaleY,
          borderRadius: '46% 54% 52% 48% / 50% 46% 54% 50%',
          // Light halo on both sides of the ink line keeps it visible on dark and light surfaces
          boxShadow: '0 0 0 1.5px var(--paper-bright), inset 0 0 0 1.5px var(--paper-bright)',
        }}
      >
        <motion.span
          className="block size-full bg-eosin"
          style={{ borderRadius: 'inherit' }}
          initial={false}
          animate={{ opacity: engaged ? 0.35 : 0 }}
          transition={stretch}
        />
      </motion.div>
    </motion.div>
  );
}
