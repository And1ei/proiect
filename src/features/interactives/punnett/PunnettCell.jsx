import { useEffect, useRef, useState } from 'react';
import { cx } from '../../../lib/cx';
import FeedbackFlash, { useFlash } from '../../gamefeel/FeedbackFlash';

/** One offspring cell: "+" opens a small picker of genotypes; a wrong pick keeps it open. */
export default function PunnettCell({ value, options, disabled, onPick, session, labels, alignEnd = false }) {
  const [open, setOpen] = useState(false);
  const flash = useFlash();
  const trigger = useRef(null);
  const firstOption = useRef(null);

  useEffect(() => {
    if (open) firstOption.current?.focus();
  }, [open]);

  const close = () => {
    setOpen(false);
    trigger.current?.focus();
  };

  const pick = (genotype) => {
    const ok = session.report(onPick(genotype), flash);
    if (ok) setOpen(false);
  };

  return (
    <FeedbackFlash flash={flash} className="relative aspect-square rounded-well">
      {value ? (
        <div className="flex size-full items-center justify-center rounded-well bg-methylene-50 font-mono text-2 shadow-well" aria-label={labels.filled}>
          {value}
        </div>
      ) : (
        <button
          ref={trigger}
          type="button"
          disabled={disabled}
          aria-expanded={open}
          aria-label={labels.empty}
          onClick={() => setOpen((o) => !o)}
          className={cx(
            'flex size-full items-center justify-center rounded-well border-2 border-dashed font-mono text-3 text-ink-soft',
            disabled ? 'border-ink-faint opacity-40' : 'border-ink-faint hover:bg-paper-deep',
          )}
        >
          +
        </button>
      )}
      {open && (
        <div
          role="group"
          aria-label={labels.choose}
          onKeyDown={(e) => e.key === 'Escape' && close()}
          className={cx(
            'absolute top-full z-20 mt-2 flex gap-1 rounded-well bg-paper-bright p-2 shadow-card ring-1 ring-ink-faint',
            // Right-column cells open leftwards so the picker stays inside narrow screens
            alignEnd ? 'right-0' : 'left-1/2 -translate-x-1/2',
          )}
        >
          {options.map((g, i) => (
            <button
              key={g}
              ref={i === 0 ? firstOption : undefined}
              type="button"
              onClick={() => pick(g)}
              className="min-h-11 min-w-12 rounded-tag bg-paper px-3 font-mono text-1 shadow-well hover:bg-eosin-50"
            >
              {g}
            </button>
          ))}
        </div>
      )}
    </FeedbackFlash>
  );
}
