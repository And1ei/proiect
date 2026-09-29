import { useId } from 'react';
import { cx } from '../../lib/cx';
import { t } from '../../lib/i18n';
import Section from './Section';

const SURFACES = [
  { key: 'paper', className: 'bg-paper-bright shadow-card' },
  { key: 'eosin', className: 'surface-eosin' },
  { key: 'methylene', className: 'surface-methylene' },
  { key: 'dark', className: 'surface-ink' },
];

export default function CursorSection() {
  const inputId = useId();
  const c = (key) => t(`ds.cursor.${key}`);

  return (
    <Section id="cursor" fig={8} name={c('name')} title={c('title')} intro={c('intro')}>
      <div className="flex flex-col gap-10">
        <div className="flex flex-wrap gap-3">
          <span data-cursor data-test="cursor-target" className="text-label rounded-blob-c bg-methylene-100 px-5 py-4">
            {c('target')}
          </span>
          <span data-cursor data-test="cursor-target" className="text-label rounded-blob-d bg-eosin-100 px-8 py-7">
            {c('bigTarget')}
          </span>
        </div>

        <div>
          <h3 className="mb-1 text-1">{c('surfacesHeading')}</h3>
          <p className="mb-4 text--1 text-ink-soft">{c('surfacesHint')}</p>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {SURFACES.map(({ key, className }) => (
              <li
                key={key}
                data-test={`cursor-surface-${key}`}
                className={cx('grid aspect-[4/3] place-items-center rounded-cell p-4', className)}
              >
                <span className="text-label">{t(`ds.focus.surfaces.${key}`)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex max-w-md flex-col gap-2">
          <label htmlFor={inputId} className="font-medium">
            {c('inputLabel')}
          </label>
          <input
            id={inputId}
            type="text"
            data-test="cursor-input"
            placeholder={c('inputPlaceholder')}
            className="rounded-well bg-paper-bright px-4 py-3 shadow-well placeholder:text-ink-soft"
          />
          <p className="text--1 text-ink-soft">{c('inputHint')}</p>
        </div>
      </div>
    </Section>
  );
}
