import { lazy, Suspense } from 'react';
import { FIGURES } from '../../content/ro/figures';
import { FIGURE_LOADERS } from '../../figures';
import { t } from '../../lib/i18n';
import SpecimenLabel from '../primitives/SpecimenLabel';

const cache = new Map();
const lazyFigure = (id) => {
  if (!cache.has(id)) cache.set(id, FIGURE_LOADERS[id] ? lazy(FIGURE_LOADERS[id]) : null);
  return cache.get(id);
};

/** A numbered figure plate: drawing in a recessed well, FIG tag and caption underneath. */
export default function Figure({ id }) {
  const meta = FIGURES[id];
  const Drawing = lazyFigure(id);

  return (
    <figure className="my-2 flex flex-col gap-3" data-figure={id}>
      <div className="-mx-2 rounded-well bg-paper-bright px-2 py-6 shadow-well sm:mx-0 sm:px-6">
        {Drawing && meta ? (
          <Suspense fallback={<div className="aspect-[480/660] w-full" />}>
            <Drawing meta={meta} />
          </Suspense>
        ) : (
          <p className="text-label py-12 text-center text-ink-soft">{t('figure.missing')}</p>
        )}
      </div>
      {meta && (
        <figcaption className="flex flex-wrap items-baseline gap-x-3 gap-y-2 text--1 text-ink-soft">
          <SpecimenLabel fig={meta.number} name={meta.label} tone="ink" />
          <span>{meta.caption}</span>
        </figcaption>
      )}
    </figure>
  );
}
