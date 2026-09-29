import { formatNumber, quote, t } from '../../lib/i18n';
import Section from './Section';
import GlyphTest from './GlyphTest';

const STEPS = [6, 5, 4, 3, 2, 1, 0, -1, -2];
const FAMILY_CLASS = {
  Fraunces: 'text-display text-4',
  'Instrument Sans': 'font-sans text-1',
  'DM Mono': 'text-label !text-0',
};

export default function TypeSection() {
  const families = t('ds.type.families');
  const c = 'ds.type.conventions';

  return (
    <Section id="type" fig={2} name={t('ds.type.name')} title={t('ds.type.title')} intro={t('ds.type.intro')}>
      <div className="mb-12 grid gap-6 lg:grid-cols-3">
        {families.map((f) => (
          <div key={f.name} className="flex flex-col gap-3 rounded-well bg-paper-deep p-5 shadow-well">
            <p className="text-label text-ink-soft">{f.role}</p>
            <p className="text-2 font-medium">{f.name}</p>
            <p className={FAMILY_CLASS[f.name]}>{f.sample.replace('{zoom}', formatNumber(40000))}</p>
          </div>
        ))}
      </div>

      <ol className="mb-14 flex flex-col">
        {STEPS.map((step) => (
          <li
            key={step}
            className="grid grid-cols-[4.5rem_1fr] items-baseline gap-4 border-b border-dashed border-ink-faint py-3 last:border-0"
          >
            <span className="text-label text-ink-soft">{t('ds.type.step', { n: step })}</span>
            <span
              className={step >= 3 ? 'text-display' : step >= 1 ? 'font-display font-medium' : 'font-sans'}
              style={{ fontSize: `var(--step-${step})`, lineHeight: step >= 3 ? 1.05 : 1.35 }}
            >
              {t(`ds.type.scale.${step}`)}
            </span>
          </li>
        ))}
      </ol>

      <div className="mb-14">
        <GlyphTest />
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-1">{t(`${c}.heading`)}</h3>
        <ul className="prose-body flex flex-col gap-2">
          <li>{quote(t(`${c}.quote`, { percent: formatNumber(0.009, { style: 'percent', minimumFractionDigits: 1 }) }))}</li>
          <li>{t(`${c}.number`, { count: formatNumber(5_000_000) })}</li>
          <li>{t(`${c}.decimal`, { size: formatNumber(7.5) })}</li>
        </ul>
      </div>
    </Section>
  );
}
