import { cx } from '../../lib/cx';
import { t } from '../../lib/i18n';
import HandArrow from '../primitives/HandArrow';

const tones = {
  retine: 'bg-eosin-50 text-ink',
  stiai: 'bg-methylene-50 text-ink',
};

const labelTones = {
  retine: 'text-eosin-deep',
  stiai: 'text-methylene-deep',
};

/**
 * A margin note ("Reține" / "Știai că?"). Inline below 1024px; from lg it is positioned in
 * the right margin by its parent (see BlockList) with a hand-drawn arrow toward the text.
 */
export default function MarginNote({ kind, children }) {
  return (
    <aside className={cx('relative rounded-cell-alt p-4 text--1 leading-body shadow-card', tones[kind])}>
      <HandArrow
        variant="short"
        animate={false}
        className={cx('absolute -left-9 top-4 hidden w-7 -scale-x-100 lg:block', labelTones[kind])}
      />
      <p className={cx('text-label mb-1', labelTones[kind])}>{t(`topic.notes.${kind}`)}</p>
      <div>{children}</div>
    </aside>
  );
}
