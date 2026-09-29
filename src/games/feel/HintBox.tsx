import { useId, useState } from 'react';
import { t } from '../../lib/i18n';
import type { GameSession } from '../core/session';

interface Props {
  hint: string;
  session: GameSession;
}

/**
 * "Indiciu" disclosure. Opening it counts as using a hint (once per distinct hint text), which
 * marks the result "completat cu ajutor".
 */
export default function HintBox({ hint, session }: Props) {
  const [openFor, setOpenFor] = useState<string | null>(null);
  const [counted, setCounted] = useState<Set<string>>(() => new Set());
  const id = useId();
  const open = openFor === hint;

  const toggle = () => {
    if (open) return setOpenFor(null);
    setOpenFor(hint);
    if (!counted.has(hint)) {
      session.useHint();
      setCounted((s) => new Set(s).add(hint));
    }
  };

  if (!hint) return null;
  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={toggle}
        className="text-label inline-flex min-h-11 items-center gap-2 rounded-tag px-2 py-1 text-methylene-deep underline decoration-dotted underline-offset-4"
      >
        {t(open ? 'game.hideHint' : 'game.hint')}
      </button>
      <p id={id} hidden={!open} className="rounded-well bg-methylene-50 px-4 py-3 text--1 leading-body">
        {hint}
      </p>
    </div>
  );
}
