import { Link } from 'react-router-dom';
import { cx } from '../../lib/cx';
import { t } from '../../lib/i18n';
import CellMark from './CellMark';

/** "Soft Educational" wordmark. Links home unless `asLink` is false. */
export default function Wordmark({ asLink = true, className }) {
  const [first, ...rest] = t('brand').split(' ');
  const content = (
    <>
      <CellMark className="size-8 sm:size-9" />
      <span className="text-display text-1 font-medium leading-none tracking-display sm:text-2">
        {first} <em className="font-normal">{rest.join(' ')}</em>
      </span>
    </>
  );
  const classes = cx('inline-flex items-center gap-2.5 text-ink no-underline', className);

  return asLink ? (
    <Link to="/" className={classes} aria-label={t('a11y.homeLink')}>
      {content}
    </Link>
  ) : (
    <span className={classes}>{content}</span>
  );
}
