import { token } from '../../lib/tokens';
import { t } from '../../lib/i18n';
import Section from './Section';

const families = [
  { key: 'paper', swatches: ['paper', 'paper-bright', 'paper-deep', 'paper-shade', 'ink', 'ink-soft', 'ink-faint'] },
  { key: 'eosin', swatches: ['eosin-50', 'eosin-100', 'eosin-200', 'eosin', 'eosin-deep'] },
  { key: 'methylene', swatches: ['methylene-50', 'methylene-100', 'methylene-200', 'methylene', 'methylene-deep'] },
  { key: 'iodine', swatches: ['iodine-100', 'iodine-200', 'iodine', 'iodine-deep'] },
];

// Swatches whose value is AA-safe (≥4.5:1) as text on --paper
const TEXT_SAFE = new Set(['ink', 'ink-soft', 'eosin-deep', 'methylene-deep', 'iodine-deep']);
const DARK = new Set(['ink', 'ink-soft', 'methylene-deep', 'eosin-deep', 'iodine-deep', 'methylene']);
const SHAPES = ['rounded-blob-a', 'rounded-blob-b', 'rounded-blob-c', 'rounded-blob-d'];

function Swatch({ name, index }) {
  return (
    <li className="flex flex-col gap-2">
      <div
        className={`grid aspect-square w-full place-items-center shadow-rest ${SHAPES[index % SHAPES.length]}`}
        style={{ background: `var(--${name})` }}
      >
        {TEXT_SAFE.has(name) && (
          <span className={`text-label ${DARK.has(name) ? 'text-paper' : 'text-ink'}`}>{t('ds.color.textSafe')}</span>
        )}
      </div>
      <div>
        <p className="font-mono text--1 text-ink">--{name}</p>
        <p className="font-mono text--2 uppercase text-ink-soft">{token(name)}</p>
      </div>
    </li>
  );
}

export default function ColorSection() {
  return (
    <Section id="color" fig={1} name={t('ds.color.name')} title={t('ds.color.title')} intro={t('ds.color.intro')}>
      <div className="flex flex-col gap-10">
        {families.map(({ key, swatches }) => (
          <div key={key}>
            <h3 className="mb-1 text-1">{t(`ds.color.families.${key}.name`)}</h3>
            <p className="mb-4 text--1 text-ink-soft">{t(`ds.color.families.${key}.note`)}</p>
            <ul className="grid grid-cols-3 gap-4 sm:grid-cols-5 lg:grid-cols-7">
              {swatches.map((s, i) => (
                <Swatch key={s} name={s} index={i} />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}
