import { cx } from '../../lib/cx';

const widths = {
  narrow: 'max-w-narrow',
  default: 'max-w-container',
  wide: 'max-w-wide',
};

/** Horizontal page frame: centred, fluid gutters, three widths. */
export default function Container({ as: Tag = 'div', size = 'default', className, children, ...rest }) {
  return (
    <Tag className={cx('mx-auto w-full px-gutter', widths[size], className)} {...rest}>
      {children}
    </Tag>
  );
}
