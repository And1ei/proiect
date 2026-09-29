import { useDeferredValue, useId, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import glossary, { glossaryById } from '../content/ro/glossary';
import { termIdsIn } from '../content/ro/markup';
import { TOPICS, topicPath } from '../content/ro/topics';
import { foldForSearch, locale, quote, t, tp } from '../lib/i18n';
import PageFrame from './PageFrame';

// Which lessons use each term: the owner plus any lesson that marks it in its text
function buildUsage() {
  const usage = new Map(glossary.map((g) => [g.id, new Set()]));
  for (const topic of TOPICS) {
    topic.glossaryIds.forEach((id) => usage.get(id)?.add(topic.slug));
    const text = JSON.stringify(topic.sections);
    termIdsIn(text).forEach((id) => usage.get(id)?.add(topic.slug));
  }
  return usage;
}

const ENTRIES = (() => {
  const usage = buildUsage();
  return [...glossary]
    .sort((a, b) => a.term.localeCompare(b.term, locale))
    .map((g) => ({
      ...g,
      haystack: foldForSearch(`${g.term} ${g.definition}`),
      folded: foldForSearch(g.term),
      topics: TOPICS.filter((topic) => usage.get(g.id).has(topic.slug)),
    }));
})();

export default function Glossary() {
  const [query, setQuery] = useState('');
  const deferred = useDeferredValue(query);
  const inputId = useId();

  const results = useMemo(() => {
    const q = foldForSearch(deferred.trim());
    if (!q) return ENTRIES;
    // Terms that start with the query first, then any match in the definition
    const starts = ENTRIES.filter((e) => e.folded.startsWith(q));
    const rest = ENTRIES.filter((e) => !e.folded.startsWith(q) && e.haystack.includes(q));
    return [...starts, ...rest];
  }, [deferred]);

  return (
    <PageFrame title={t('glossary.title')} fig={1} label={t('glossary.label')} heading={t('glossary.heading')} tone="methylene">
      <p className="prose-body">{t('glossary.intro')}</p>

      <div className="flex w-full max-w-md flex-col gap-2">
        <label htmlFor={inputId} className="font-medium">
          {t('glossary.searchLabel')}
        </label>
        <input
          id={inputId}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('glossary.searchPlaceholder')}
          autoComplete="off"
          spellCheck={false}
          className="rounded-well bg-paper-bright px-4 py-3 shadow-well placeholder:text-ink-soft"
        />
        <p role="status" className="text-label text-ink-soft">
          {tp('glossary.count', results.length)}
        </p>
      </div>

      {results.length === 0 ? (
        <p className="prose-body">{t('glossary.empty', { query: quote(query.trim()) })}</p>
      ) : (
        <dl className="flex w-full flex-col">
          {results.map((entry) => (
            <div key={entry.id} id={entry.id} className="grid gap-1 border-b border-dashed border-ink-faint py-5 sm:grid-cols-[12rem_1fr] sm:gap-6">
              <dt className="font-display text-2 font-medium leading-heading">{entry.term}</dt>
              <dd className="flex flex-col gap-2">
                <span>{entry.definition}</span>
                {entry.seeAlso?.length > 0 && (
                  <span className="text-label flex flex-wrap items-baseline gap-x-3 text-ink-soft">
                    {t('glossary.seeAlso')}:
                    {entry.seeAlso.map((id) => (
                      <a key={id} href={`#${id}`} className="normal-case tracking-normal text-methylene-deep underline">
                        {glossaryById[id].term}
                      </a>
                    ))}
                  </span>
                )}
                <span className="text-label flex flex-wrap items-baseline gap-x-3 gap-y-1 text-ink-soft">
                  {t('glossary.usedIn')}:
                  {entry.topics.map((topic) => (
                    <Link key={topic.slug} to={topicPath(topic)} className="normal-case tracking-normal text-methylene-deep underline">
                      {topic.title}
                    </Link>
                  ))}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      )}
    </PageFrame>
  );
}
