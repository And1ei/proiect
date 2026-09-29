import { Fragment } from 'react';
import { parseInline } from '../../content/ro/markup';
import Term from './Term';

/** Renders lesson text, turning [[id|text]] markup into <Term> popovers. */
export default function RichText({ text }) {
  return parseInline(text).map((part, i) =>
    typeof part === 'string' ? (
      <Fragment key={i}>{part}</Fragment>
    ) : (
      <Term key={i} id={part.termId}>
        {part.label ?? undefined}
      </Term>
    ),
  );
}
