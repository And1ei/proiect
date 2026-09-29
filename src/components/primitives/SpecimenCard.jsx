import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useReducedMotion } from '../../lib/motionPreference';
import { cx } from '../../lib/cx';
import { spring } from '../../lib/motion';
import SpecimenLabel from './SpecimenLabel';

const MotionLink = motion.create(Link);

const tones = {
  paper: 'bg-paper-bright',
  eosin: 'bg-eosin-50',
  methylene: 'bg-methylene-50',
  iodine: 'bg-iodine-100',
};

/**
 * A mounted specimen: tag, title, body, optional "slide" window for a visual.
 * Becomes a single link target when given `to`; the whole card squashes on press.
 */
export default function SpecimenCard({
  fig,
  name,
  title,
  tone = 'paper',
  labelTone = 'ink',
  alt = false,
  slide,
  meta,
  to,
  headingLevel: Heading = 'h3',
  className,
  children,
}) {
  const reduce = useReducedMotion();
  const interactive = Boolean(to) && !reduce;
  const Root = to ? MotionLink : motion.article;

  return (
    <Root
      to={to}
      className={cx(
        'group relative flex flex-col gap-4 p-5 text-ink no-underline shadow-card sm:p-6',
        alt ? 'rounded-cell-alt' : 'rounded-cell',
        tones[tone],
        className,
      )}
      whileHover={interactive ? { y: -3, rotate: alt ? 0.5 : -0.5 } : undefined}
      whileTap={interactive ? { scaleX: 1.02, scaleY: 0.97 } : undefined}
      transition={spring}
    >
      {/* Slide-mount corner ticks */}
      <span aria-hidden="true" className="pointer-events-none absolute left-3 top-3 size-3 border-l border-t border-ink-faint" />
      <span aria-hidden="true" className="pointer-events-none absolute bottom-3 right-3 size-3 border-b border-r border-ink-faint" />

      {(fig != null || name) && <SpecimenLabel fig={fig} name={name} tone={labelTone} className="self-start" />}

      {slide && (
        <div className="relative aspect-[5/3] overflow-hidden rounded-well bg-paper-deep shadow-well">{slide}</div>
      )}

      {title && <Heading className="text-2 font-medium leading-heading">{title}</Heading>}

      {children && <div className="text--1 leading-body text-ink-soft sm:text-0">{children}</div>}

      {meta && (
        <p className="text-label mt-auto flex flex-wrap gap-x-4 gap-y-1 border-t border-dashed border-ink-faint pt-3 text-ink-soft">
          {meta}
        </p>
      )}
    </Root>
  );
}
