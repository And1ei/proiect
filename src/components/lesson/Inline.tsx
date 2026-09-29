import { Fragment } from 'react';
import { parseInline } from '../../content/ro/lessons/index.ts';
import { cx } from '../../lib/cx';

/**
 * Lesson text with its two marks: **term** (defined right there: bold, with a stain underline) and
 * *Latin name* (italic). `stainText` is the stain's text class for the underline colour.
 */
export default function Inline({ text, underline }: { text: string; underline?: string }) {
  return (
    <>
      {parseInline(text).map((p, i) =>
        p.bold ? (
          <strong key={i} className={cx('font-semibold decoration-2 underline-offset-[0.22em]', underline && `underline ${underline}`)}>
            {p.text}
          </strong>
        ) : p.italic ? (
          <em key={i}>{p.text}</em>
        ) : (
          <Fragment key={i}>{p.text}</Fragment>
        ),
      )}
    </>
  );
}
