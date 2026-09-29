import { createContext, useContext, useId } from 'react';
import { cx } from '../../lib/cx';

const WobbleContext = createContext(undefined);

/**
 * SVG plate for schematic figures. Provides <title>/<desc> for screen readers and a subtle
 * displacement filter that gives ink outlines a hand-drawn wobble (see <Ink>).
 */
export default function Illustration({ viewBox, title, desc, className, role = 'img', children }) {
  const raw = useId().replace(/[^a-zA-Z0-9]/g, '');
  const ids = { title: `${raw}-t`, desc: `${raw}-d`, wobble: `${raw}-w` };

  return (
    <svg
      viewBox={viewBox}
      // "group" when the plate contains focusable parts (role="img" would hide them from assistive tech)
      role={role}
      aria-labelledby={`${ids.title} ${ids.desc}`}
      className={cx('block h-auto w-full overflow-visible', className)}
    >
      <title id={ids.title}>{title}</title>
      <desc id={ids.desc}>{desc}</desc>
      <defs>
        <filter id={ids.wobble} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="7" />
          <feDisplacementMap in="SourceGraphic" scale="2.4" />
        </filter>
      </defs>
      <WobbleContext.Provider value={`url(#${ids.wobble})`}>{children}</WobbleContext.Provider>
    </svg>
  );
}

/** Group whose shapes share the wobble filter; put fills and their ink outlines together. */
export function Ink({ children, ...rest }) {
  const filter = useContext(WobbleContext);
  return (
    <g filter={filter} stroke="var(--ink)" strokeWidth="1.75" strokeLinejoin="round" strokeLinecap="round" {...rest}>
      {children}
    </g>
  );
}
