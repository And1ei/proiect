import { cx } from '../../lib/cx';
import { t } from '../../lib/i18n';
import BlobButton from '../../components/primitives/BlobButton';
import Section from './Section';

// Each surface re-points --focus (see .surface-* in global.css) so the ring keeps ≥3:1
const SURFACES = [
  { key: 'paper', className: 'bg-paper', button: 'eosin' },
  { key: 'eosin', className: 'surface-eosin', button: 'paper' },
  { key: 'methylene', className: 'surface-methylene', button: 'paper' },
  { key: 'dark', className: 'surface-ink', button: 'eosin' },
];

export default function FocusSection() {
  const f = (key) => t(`ds.focus.${key}`);

  return (
    <Section id="focus" fig={9} name={f('name')} title={f('title')} intro={f('intro')}>
      <ul className="grid gap-4 sm:grid-cols-2">
        {SURFACES.map(({ key, className, button }) => (
          <li key={key} className={cx('flex flex-col gap-4 rounded-cell p-6', className, key === 'paper' && 'shadow-card')}>
            <p className="text-label">{f(`surfaces.${key}`)}</p>
            <div className="flex flex-wrap items-center gap-4">
              <BlobButton size="sm" variant={button}>
                {f('button')}
              </BlobButton>
              <BlobButton size="sm" variant={key === 'methylene' ? 'iodine' : 'methylene'}>
                {f('buttonAlt')}
              </BlobButton>
              <a href="#focus" className="underline decoration-2 underline-offset-4">
                {f('link')}
              </a>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
