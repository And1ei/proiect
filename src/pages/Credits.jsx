import { t } from '../lib/i18n';
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

export default function Credits() {
  return (
    <PageFrame title={t('credits.title')} fig={3} label={t('credits.label')} heading={t('credits.heading')} tone="iodine">
      <p className="prose-body">{t('credits.intro')}</p>
      <div className="mt-6 flex w-full flex-col gap-12">
        <CreditList heading={t('credits.fontsHeading')} items={t('credits.fonts')} />
        <CreditList heading={t('credits.codeHeading')} items={t('credits.code')} />
        <section>
          <h2 className="mb-3 text-2">{t('credits.figuresHeading')}</h2>
          <p className="prose-body">{t('credits.figures')}</p>
        </section>
        <section>
          <h2 className="mb-3 text-2">{t('credits.sourcesHeading')}</h2>
          <p className="prose-body">{t('credits.sources')}</p>
        </section>
      </div>
    </PageFrame>
  );
}
