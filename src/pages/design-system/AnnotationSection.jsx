import SpecimenLabel from '../../components/primitives/SpecimenLabel';
import HandUnderline from '../../components/primitives/HandUnderline';
import HandArrow from '../../components/primitives/HandArrow';
import { t } from '../../lib/i18n';
import Section from './Section';

const LABEL_TONES = ['ink', 'methylene', 'eosin', 'iodine'];
const UNDERLINES = [
  { variant: 'scribble', color: 'eosin' },
  { variant: 'wave', color: 'methylene' },
  { variant: 'double', color: 'iodine' },
  { variant: 'circle', color: 'eosin' },
];
const ARROWS = [
  { variant: 'curve', className: 'w-28 text-eosin-deep' },
  { variant: 'loop', className: 'w-32 text-methylene-deep' },
  { variant: 'short', className: 'w-12' },
];

export default function AnnotationSection() {
  const a = (key) => t(`ds.annotation.${key}`);
  const sentences = a('underlines');

  return (
    <Section id="annotation" fig={6} name={a('name')} title={a('title')} intro={a('intro')}>
      <div className="flex flex-col gap-12">
        <div>
          <h3 className="mb-4 text-1">{a('headings.label')}</h3>
          <div className="flex flex-wrap gap-3">
            {a('labels').map((label, i) => (
              <SpecimenLabel key={label} fig={i + 1} name={label} tone={LABEL_TONES[i]} tilt={i === 3} />
            ))}
            <SpecimenLabel tone="ink">{a('freeLabel')}</SpecimenLabel>
          </div>
        </div>

        <div>
          <h3 className="mb-6 text-1">{a('headings.underline')}</h3>
          <ul className="flex flex-col gap-6 font-display text-2">
            {sentences.map((s, i) => (
              <li key={s.mark}>
                {s.before}
                <HandUnderline {...UNDERLINES[i]}>{s.mark}</HandUnderline>
                {s.after}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-6 text-1">{a('headings.arrow')}</h3>
          <div className="flex flex-wrap items-end gap-10 text-ink">
            {ARROWS.map(({ variant, className }) => (
              <figure key={variant} className="flex flex-col items-start gap-2">
                <HandArrow variant={variant} className={className} />
                <figcaption className="text-label text-ink-soft">{t(`ds.annotation.arrows.${variant}`)}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
