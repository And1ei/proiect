import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { t } from '../../lib/i18n';
import { springSettle } from '../../lib/motion';
import BlobButton from '../../components/primitives/BlobButton';

interface Props {
  auto: boolean;
  onResume: () => void;
  onHelp: () => void;
  onRestart: () => void;
}

/**
 * Covers the stage while paused (the board is hidden, so pausing is never a free look).
 * Resuming always takes an explicit press: focus lands on "Continuă".
 */
export default function PauseOverlay({ auto, onResume, onHelp, onRestart }: Props) {
  const resume = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    resume.current?.focus();
  }, []);

  return (
    <motion.div
      role="group"
      aria-labelledby="game-paused-title"
      className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-5 rounded-well bg-paper p-6 text-center shadow-well"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={springSettle}
    >
      <h2 id="game-paused-title" className="text-display text-4">
        {t('games.shell.pausedHeading')}
      </h2>
      {auto && <p className="prose-body max-w-[32ch] text--1 sm:text-0">{t('games.shell.autoPaused')}</p>}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <BlobButton ref={resume} onClick={onResume}>
          {t('games.shell.resume')}
        </BlobButton>
        <BlobButton variant="paper" shape="b" onClick={onHelp}>
          {t('games.shell.howTo')}
        </BlobButton>
        <BlobButton variant="paper" shape="c" onClick={onRestart}>
          {t('games.shell.restart')}
        </BlobButton>
      </div>
    </motion.div>
  );
}
