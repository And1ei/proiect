import { lazy, Suspense } from 'react';
import { INTERACTIVE_LOADERS } from '../../interactives/registry';
import { t } from '../../lib/i18n';
import SpecimenLabel from '../primitives/SpecimenLabel';
import Blob from '../primitives/Blob';

const cache = new Map();
const lazyInteractive = (type) => {
  if (!cache.has(type)) cache.set(type, INTERACTIVE_LOADERS[type] ? lazy(INTERACTIVE_LOADERS[type]) : null);
  return cache.get(type);
};

function Placeholder({ type, topic }) {
  return (
    <div className="relative flex flex-col items-start gap-3 overflow-hidden rounded-cell border-2 border-dashed border-ink-faint p-6 sm:flex-row sm:items-center sm:gap-6">
      <Blob shape="amoeba" tone="methylene" membrane className="size-16 shrink-0" />
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <SpecimenLabel fig={topic.fig.number} name={t('interactive.label')} tone="methylene" />
          <span className="text-label text-ink-soft">{t('interactive.pending')}</span>
        </div>
        <p className="font-display text-2 font-medium leading-heading">{t(`interactive.types.${type}`)}</p>
        <p className="text--1 text-ink-soft">{t('interactive.placeholder', { topic: topic.title })}</p>
      </div>
    </div>
  );
}

/** Mounts the lesson's interactive when it exists, otherwise a dashed specimen frame. */
export default function InteractiveSlot({ topic }) {
  const { type, config } = topic.interactive;
  const Component = lazyInteractive(type);

  return (
    <section className="my-4" aria-label={t(`interactive.types.${type}`)} data-interactive={type}>
      {Component ? (
        <Suspense fallback={<Placeholder type={type} topic={topic} />}>
          <Component config={config} topic={topic} />
        </Suspense>
      ) : (
        <Placeholder type={type} topic={topic} />
      )}
    </section>
  );
}
