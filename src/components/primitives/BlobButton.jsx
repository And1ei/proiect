import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useReducedMotion } from '../../lib/motionPreference';
import { cx } from '../../lib/cx';
import { spring, squash } from '../../lib/motion';
import { token, BLOB_SHAPES } from '../../lib/tokens';

const MotionLink = motion.create(Link);

const variants = {
  eosin: 'bg-eosin text-ink',
  methylene: 'bg-methylene-deep text-paper',
  paper: 'bg-paper-bright text-ink',
  iodine: 'bg-iodine text-ink',
};

const sizes = {
  sm: 'min-h-10 px-5 text--1 gap-2',
  md: 'min-h-12 px-7 text-0 gap-2.5',
  lg: 'min-h-14 px-9 text-1 gap-3',
};

/**
 * Tactile, asymmetric button. Renders a router <Link> when given `to`, an <a> for `href`,
 * otherwise a <button>. On hover the outline morphs to the next blob shape; on press it squashes.
 */
const BlobButton = forwardRef(function BlobButton(
  { variant = 'eosin', size = 'md', shape = 'a', icon, disabled, className, children, ...rest },
  ref,
) {
  const reduce = useReducedMotion();
  const from = token(`btn-${shape}`);
  const to = token(`btn-${BLOB_SHAPES[(BLOB_SHAPES.indexOf(shape) + 1) % BLOB_SHAPES.length]}`);

  const Component = rest.to ? MotionLink : rest.href ? motion.a : motion.button;
  const isButton = Component === motion.button;
  const live = !disabled && !reduce;

  return (
    <Component
      ref={ref}
      type={isButton ? (rest.type ?? 'button') : undefined}
      disabled={isButton ? disabled : undefined}
      aria-disabled={!isButton && disabled ? true : undefined}
      tabIndex={!isButton && disabled ? -1 : undefined}
      className={cx(
        'relative inline-flex select-none items-center justify-center font-sans font-medium leading-none no-underline',
        'shadow-rest transition-shadow duration-spring ease-spring active:shadow-pressed',
        variants[variant],
        sizes[size],
        disabled && 'pointer-events-none opacity-50 saturate-50',
        className,
      )}
      initial={false}
      variants={{
        rest: { scaleX: 1, scaleY: 1, borderRadius: from },
        hover: { ...squash.hover, borderRadius: to },
        tap: { ...squash.tap, borderRadius: to },
      }}
      animate="rest"
      whileHover={live ? 'hover' : undefined}
      whileTap={live ? 'tap' : undefined}
      transition={spring}
      {...rest}
    >
      {variant === 'paper' && (
        // Cell-membrane edge: a dashed inner outline that follows the animated radius
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-1 border border-dashed border-ink-faint"
          style={{ borderRadius: 'inherit' }}
        />
      )}
      <span className="relative">{children}</span>
      {icon && (
        <motion.span
          aria-hidden="true"
          className="relative inline-flex"
          variants={{ rest: { x: 0 }, hover: { x: 4 }, tap: { x: 6 } }}
          transition={spring}
        >
          {icon}
        </motion.span>
      )}
    </Component>
  );
});

export default BlobButton;
