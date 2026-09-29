import { formulaRuns } from './formula';
import { cx } from '../../../lib/cx';

/** A chemical formula in the mono font, with real <sub>/<sup> (the font has no ₂ or ⁺ glyphs). */
export default function Formula({ formula, className }: { formula: string; className?: string }) {
  return (
    <span className={cx('whitespace-nowrap font-mono font-medium', className)}>
      {formulaRuns(formula).map((run, i) =>
        run.kind === 'sub' ? (
          <sub key={i} className="text-[0.7em] leading-none">
            {run.text}
          </sub>
        ) : run.kind === 'sup' ? (
          <sup key={i} className="text-[0.7em] leading-none">
            {run.text}
          </sup>
        ) : (
          <span key={i}>{run.text}</span>
        ),
      )}
    </span>
  );
}

/** A small keycap showing a keyboard shortcut. */
export function Keycap({ children, className }: { children: string; className?: string }) {
  return (
    <kbd
      className={cx(
        'inline-flex min-w-[1.55em] items-center justify-center rounded-[5px] border border-ink-faint bg-paper-bright px-1 font-mono text--2 font-medium leading-tight text-ink shadow-[0_1.5px_0_var(--ink-faint)]',
        className,
      )}
    >
      {children}
    </kbd>
  );
}
