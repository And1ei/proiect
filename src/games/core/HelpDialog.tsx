import { useEffect, useRef } from 'react';
import { t } from '../../lib/i18n';
import BlobButton from '../../components/primitives/BlobButton';
import type { GameDefinition } from './types';
import { ControlsList } from './IntroScreen';

/**
 * "Cum se joacă": a native modal <dialog> (focus trap, Escape and focus return come from the
 * browser). The shell pauses the game before opening it; closing does not resume.
 */
export default function HelpDialog({ open, onClose, definition }: { open: boolean; onClose: () => void; definition: GameDefinition }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby="game-help-title"
      className="m-auto w-[min(34rem,calc(100vw-2rem))] rounded-cell bg-paper-bright p-6 text-ink shadow-card game-dialog sm:p-8"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex flex-col gap-5">
        <h2 id="game-help-title" className="text-3">
          {t('games.shell.howTo')}
        </h2>
        <ol className="lesson-ol text--1 sm:text-0">
          {definition.instructions.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ol>
        <ControlsList controls={definition.controls} />
        <BlobButton variant="paper" size="sm" shape="c" className="self-start" onClick={onClose} autoFocus>
          {t('games.shell.close')}
        </BlobButton>
      </div>
    </dialog>
  );
}
