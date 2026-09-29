import { useEffect } from 'react';
import { t } from '../../lib/i18n';

function setMeta(selector, value) {
  const el = document.head.querySelector(selector);
  if (el) el.setAttribute('content', value);
}

/** Sets the document title and description for the current route. Renders nothing. */
export default function PageMeta({ title, description }) {
  useEffect(() => {
    const fullTitle = title ? t('meta.titleTemplate', { page: title }) : t('meta.title');
    const desc = description ?? t('meta.description');
    document.title = fullTitle;
    setMeta('meta[name="description"]', desc);
    setMeta('meta[property="og:title"]', fullTitle);
    setMeta('meta[property="og:description"]', desc);
  }, [title, description]);
  return null;
}
