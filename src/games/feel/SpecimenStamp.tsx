import { motion } from 'motion/react';
import { cx } from '../../lib/cx';
import { t } from '../../lib/i18n';
import { spring } from '../../lib/motion';

export type StampVariant = 'completat' | 'cu-ajutor';

const VARIANTS: Record<StampVariant, { label: string; tone: string }> = {
  completat: { label: 'progress.stamp', tone: 'text-eosin-deep' },
  // Honest, not a failure: same stamp shape, calmer ink
  'cu-ajutor': { label: 'game.stampAssisted', tone: 'text-methylene-deep' },
};

interface Props {
  variant?: StampVariant;
  size?: 'sm' | 'md';
  /** Plays one press-down, for the moment something is completed on screen. */
  stampIn?: boolean;
  className?: string;
}

/** Hand-inked stamp: "Completat", or "Completat cu ajutor" when hints were used. */
export default function SpecimenStamp({ variant = 'completat', size = 'md', stampIn = false, className }: Props) {
  const small = size === 'sm';
  const v = VARIANTS[variant] ?? VARIANTS.completat;
  return (
    <motion.span
      className={cx(
        'relative inline-flex shrink-0 -rotate-3 items-center font-mono uppercase tracking-label',
        small ? 'px-1.5 py-0.5 text-[0.625rem]' : 'px-3 py-1 text--2',
        v.tone,
        className,
      )}
      initial={stampIn ? { scale: 1.6, opacity: 0, rotate: -12 } : false}
      animate={{ scale: 1, opacity: 1, rotate: -3 }}
      transition={spring}
    >
      {/* Rough double border, like a rubber stamp pressed unevenly */}
      <svg aria-hidden="true" className="absolute inset-0 size-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 30">
        <path d="M2 3.5 C 30 1.8, 70 2.6, 98 2.2 C 98.8 11, 97.6 20, 98.4 27.6 C 68 28.6, 32 27.4, 2.4 28.2 C 1.6 20, 2.8 11, 2 3.5 Z" fill="none" stroke="currentColor" strokeWidth={small ? 1.4 : 1.8} vectorEffect="non-scaling-stroke" />
        {!small && <path d="M5 6 C 34 5, 66 5.6, 95 5.2 M5.4 25 C 36 25.6, 64 24.8, 95.2 25.4" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.6" vectorEffect="non-scaling-stroke" />}
      </svg>
      <span className="relative">{t(v.label)}</span>
    </motion.span>
  );
}
