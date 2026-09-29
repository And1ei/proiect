import { t } from '../../lib/i18n';
import { cx } from '../../lib/cx';
import { STAIN } from '../../lib/stains';
import { useProgress } from '../../lib/useProgress';
import { stampsOf } from '../../lib/stamps';
import type { Lesson } from '../../content/ro/lessons/index.ts';

const KEYS = ['citit', 'jucat', 'stapanit'] as const;

/**
 * The three progress stamps of a topic in its stain: citit, jucat, stăpânit. Earned stamps are
 * inked; missing ones are a faint dashed outline (the text says which, never colour alone).
 * No percentages. `size="xs"` for the nav.
 */
export default function Stamps({ lesson, size = 'sm', className }: { lesson: Lesson; size?: 'xs' | 'sm'; className?: string }) {
  const { data } = useProgress();
  const st = stampsOf(lesson, data);
  const s = STAIN[lesson.stain];
  const earned = KEYS.filter((k) => st[k]);
  return (
    <span className={cx('inline-flex items-center gap-1', className)} role="img" aria-label={earned.length ? t('stamps.aria', { list: earned.map((k) => t(`stamps.${k}`)).join(', ') }) : t('stamps.none')}>
      {KEYS.map((k, i) =>
        size === 'xs' ? (
          <span key={k} aria-hidden="true" className={cx('size-2 rounded-full border', st[k] ? `${s.bg} ${s.border}` : 'border-dashed border-ink-faint')} />
        ) : (
          <span
            key={k}
            aria-hidden="true"
            className={cx(
              'inline-flex items-center rounded-[3px] border px-1.5 py-px font-mono text-[0.66rem] uppercase leading-snug tracking-[0.08em]',
              st[k] ? `${s.border} ${s.text}` : 'border-dashed border-ink-faint text-ink-faint',
            )}
            style={{ rotate: `${[-2, 1.5, -1][i]}deg` }}
          >
            {t(`stamps.${k}`)}
          </span>
        ),
      )}
    </span>
  );
}
