import { cx } from '../../lib/cx';
import { t } from '../../lib/i18n';

function Tick() {
  return (
    <svg aria-hidden="true" viewBox="0 0 14 12" className="w-3 shrink-0 text-methylene-deep">
      <path d="M1.5 6.8 C 3 8, 4.2 9.4, 5.2 10.4 C 7.4 6.6, 9.8 3.6, 12.6 1.4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

/** Sticky "Pe această pagină" list: current section highlighted, read sections ticked. */
export default function SectionIndex({ sections, activeId, readIds }) {
  return (
    <nav aria-label={t('topic.onThisPage')} className="sticky top-8">
      <p className="text-label mb-3 text-ink-soft">{t('topic.onThisPage')}</p>
      <ol className="flex flex-col gap-1 border-l border-dashed border-ink-faint">
        {sections.map((s, i) => {
          const active = s.id === activeId;
          const read = readIds.includes(s.id);
          return (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                aria-current={active ? 'location' : undefined}
                className={cx(
                  'relative -ml-px flex items-baseline gap-2 border-l-2 py-1.5 pl-3 text--1 leading-heading no-underline',
                  active ? 'border-eosin text-ink' : 'border-transparent text-ink-soft hover:text-ink',
                )}
              >
                <span className="text-label">{String(i + 1).padStart(2, '0')}</span>
                <span className="flex-1">{s.heading}</span>
                {read && (
                  <>
                    <Tick />
                    <span className="sr-only">{t('topic.sectionRead')}</span>
                  </>
                )}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
