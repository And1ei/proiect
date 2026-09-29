import { cx } from '../../lib/cx';
import { t } from '../../lib/i18n';

const tones = {
  ink: 'bg-paper-bright text-ink',
  eosin: 'bg-eosin-100 text-eosin-deep',
  methylene: 'bg-methylene-100 text-methylene-deep',
  iodine: 'bg-iodine-100 text-iodine-deep',
};

const pad = (n) => String(n).padStart(2, '0');

/**
 * Specimen tag, e.g. "FIG. 01 / CELL". Punched hole on the left, string-tie notch on the right.
 * Pass `fig` + `name` for the standard format, or `children` for free text.
 */
export default function SpecimenLabel({
  fig,
  name,
  tone = 'ink',
  tilt = false,
  as: Tag = 'span',
  className,
  children,
}) {
  const text = children ?? `${t('specimen.figPrefix')} ${pad(fig)} / ${name}`;
  return (
    <Tag
      className={cx(
        'text-label relative inline-flex items-center gap-2 rounded-tag py-1 pl-2 pr-3 shadow-card',
        tones[tone],
        tilt && '-rotate-2',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="inline-block size-2 shrink-0 rounded-full border border-current bg-paper shadow-well"
      />
      <span>{text}</span>
    </Tag>
  );
}
