import { useId, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { t } from '../../lib/i18n';
import { spring } from '../../lib/motion';
import { useReducedMotion } from '../../lib/motionPreference';
import Inline from './Inline';

/** "Gândește-te": a question to answer in your head, then tap to see the answer. */
export default function PredictCard({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const reduced = useReducedMotion();
  return (
    <div className="relative rotate-[-0.6deg] rounded-[6px] border border-dashed border-ink-faint bg-paper-bright px-4 py-3">
      <p className="text-label mb-1 text-ink-soft">{t('lesson.predict')}</p>
      <p className="font-medium leading-body">
        <Inline text={question} />
      </p>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className="text-label mt-2 inline-flex min-h-11 items-center gap-2 text-methylene-deep underline decoration-dotted underline-offset-4"
      >
        {t(open ? 'lesson.hideAnswer' : 'lesson.showAnswer')}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.p
            id={id}
            initial={reduced ? false : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={spring}
            className="mt-1 leading-body text-ink"
          >
            <Inline text={answer} />
          </motion.p>
        )}
      </AnimatePresence>
      {!open && <p id={id} hidden />}
    </div>
  );
}
