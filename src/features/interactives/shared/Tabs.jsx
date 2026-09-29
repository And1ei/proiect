import { useRef } from 'react';
import { cx } from '../../../lib/cx';
import { t } from '../../../lib/i18n';

/**
 * Tab list with arrow-key navigation (roving tabindex). Panels use id `${idPrefix}-${key}` and
 * are labelled by `${idPrefix}-tab-${key}`. `done` keys get a small tick.
 */
export default function Tabs({ items, active, onChange, label, idPrefix, done = [] }) {
  const refs = useRef({});
  const keys = items.map((i) => i.key);

  const onKeyDown = (e) => {
    const i = keys.indexOf(active);
    const next = { ArrowRight: keys[(i + 1) % keys.length], ArrowLeft: keys[(i - 1 + keys.length) % keys.length] }[e.key];
    if (!next) return;
    e.preventDefault();
    onChange(next);
    refs.current[next]?.focus();
  };

  return (
    <div role="tablist" aria-label={label} onKeyDown={onKeyDown} className="flex flex-wrap gap-2">
      {items.map(({ key, label: text }) => (
        <button
          key={key}
          ref={(el) => (refs.current[key] = el)}
          id={`${idPrefix}-tab-${key}`}
          role="tab"
          type="button"
          aria-selected={active === key}
          aria-controls={`${idPrefix}-${key}`}
          tabIndex={active === key ? 0 : -1}
          onClick={() => onChange(key)}
          className={cx(
            'rounded-btn-b px-4 py-2 font-medium shadow-well',
            active === key ? 'bg-eosin-100 ring-2 ring-eosin' : 'bg-paper hover:bg-paper-deep',
          )}
        >
          {text}
          {done.includes(key) && (
            <>
              <span className="sr-only"> ({t('game.solved')})</span>
              <span aria-hidden="true" className="ml-2 text-methylene-deep">
                ✓
              </span>
            </>
          )}
        </button>
      ))}
    </div>
  );
}
