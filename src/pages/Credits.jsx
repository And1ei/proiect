import { t } from '../lib/i18n';
import { ALL_ASSETS } from '../assets/urls';
import { LICENSE_INFO } from '../assets/manifest';
import Sprite from '../components/illustration/Sprite';
import PageFrame from './PageFrame';

function CreditList({ heading, items }) {
  return (
    <section className="w-full">
      <h2 className="mb-3 text-2">{heading}</h2>
      <ul className="flex flex-col">
        {items.map((item) => (
          <li
            key={item.name}
            className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-dashed border-ink-faint py-3"
          >
            <span>
              <span className="font-medium">{item.name}</span>
              {item.by && <span className="text-ink-soft"> {t('credits.by', { name: item.by })}</span>}
            </span>
            <span className="text-label text-ink-soft">{item.license}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

const KIND_ORDER = ['icon', 'organism', 'ui', 'texture', 'sound'];

/** Every shipped image and sound, straight from src/assets/manifest.ts (the single source). */
function AssetCredits() {
  const groups = KIND_ORDER.map((kind) => ({ kind, assets: ALL_ASSETS.filter((a) => a.kind === kind) })).filter((g) => g.assets.length);
  return (
    <div className="flex flex-col gap-8">
      {groups.map(({ kind, assets }) => (
        <section key={kind} aria-labelledby={`assets-${kind}`}>
          <h3 id={`assets-${kind}`} className="text-label mb-2 text-ink-soft">
            {t(`credits.asset.kinds.${kind}`)}
          </h3>
          <ul className="flex flex-col">
            {assets.map((a) => (
              <li key={a.id} className="flex gap-4 border-b border-dashed border-ink-faint py-4">
                {a.kind !== 'sound' && <Sprite id={a.id} size="md" tone="methylene-deep" className="mt-1" />}
                <div className="flex min-w-0 flex-col gap-1">
                  <span>
                    <span className="font-medium">{a.title}</span>
                    <span className="text-ink-soft"> {t('credits.by', { name: a.author })}</span>
                  </span>
                  <span className="text--1 text-ink-soft">
                    {t('credits.asset.source')}:{' '}
                    <a href={a.sourceUrl} rel="noopener" className="underline decoration-ink-faint hover:decoration-eosin">
                      {a.sourceName}
                    </a>
                    {' · '}
                    {t('credits.asset.license')}:{' '}
                    <a href={LICENSE_INFO[a.license].url} rel="noopener license" className="underline decoration-ink-faint hover:decoration-eosin">
                      {LICENSE_INFO[a.license].name}
                    </a>
                    {a.attributionRequired && <> · {t('credits.asset.attribution')}</>}
                  </span>
                  <span className="text--1 text-ink-soft">
                    {t('credits.asset.changes')}: {a.modifications}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

export default function Credits() {
  return (
    <PageFrame title={t('credits.title')} fig={3} label={t('credits.label')} heading={t('credits.heading')} tone="iodine">
      <p className="prose-body">{t('credits.intro')}</p>
      <div className="mt-6 flex w-full flex-col gap-12">
        <CreditList heading={t('credits.fontsHeading')} items={t('credits.fonts')} />
        <CreditList heading={t('credits.codeHeading')} items={t('credits.code')} />
        <section className="w-full">
          <h2 className="mb-3 text-2">{t('credits.figuresHeading')}</h2>
          <p className="prose-body mb-6">{t('credits.figures')}</p>
          <AssetCredits />
        </section>
        <section>
          <h2 className="mb-3 text-2">{t('credits.sourcesHeading')}</h2>
          <p className="prose-body">{t('credits.sources')}</p>
        </section>
      </div>
    </PageFrame>
  );
}
