import { cx } from '../../lib/cx';

const widths = {
  narrow: 'max-w-narrow',
  default: 'max-w-container',
  wide: 'max-w-wide',
};

/** Horizontal page frame: centred, fluid gutters, three widths. */
/**
 * @param {Object & Record<string, unknown>} props
 * @param {string} [props.as]
 * @param {'narrow' | 'default' | 'wide'} [props.size]
 * @param {string} [props.className]
 * @param {import('react').ReactNode} [props.children]
 */
export default function Container({ as: Tag = 'div', size = 'default', className, children, ...rest }) {
  return (
    <Tag className={cx('mx-auto w-full px-gutter', widths[size], className)} {...rest}>
      {children}
    </Tag>
  );
}
