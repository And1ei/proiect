import { useId, useState } from 'react';
import { cx } from '../../../lib/cx';
import FeedbackFlash, { useFlash } from '../../gamefeel/FeedbackFlash';

/**
 * One multiple-choice step inside an interactive. Each option is a button; a wrong pick wobbles
 * and stays open for another try, the right one locks the question and calls onSolved.
 */
export default function ChoiceQuestion({ prompt, options, answer, session, onSolved, solved = false, name }) {
  const [wrong, setWrong] = useState(() => new Set());
  const [chosen, setChosen] = useState(solved ? answer : null);
  const flash = useFlash();
  const labelId = useId();

  const choose = (i) => {
    if (chosen === answer) return;
    const ok = session.report(i === answer, flash);
    if (ok) {
      setChosen(i);
      onSolved?.();
    } else setWrong((w) => new Set(w).add(i));
  };

  return (
    <FeedbackFlash flash={flash} className="flex flex-col gap-3 rounded-well" role="group" aria-labelledby={labelId} data-question={name}>
      <p id={labelId} className="font-medium">
        {prompt}
      </p>
      <div className="flex flex-col gap-2">
        {options.map((option, i) => {
          const isAnswer = chosen === answer && i === answer;
          return (
            <button
              key={option}
              type="button"
              onClick={() => choose(i)}
              disabled={chosen === answer && !isAnswer}
              aria-pressed={isAnswer}
              className={cx(
                'rounded-well px-4 py-3 text-left shadow-well',
                isAnswer ? 'bg-methylene-100 ring-2 ring-methylene-deep' : 'bg-paper hover:bg-paper-deep',
                wrong.has(i) && !isAnswer && 'text-ink-soft line-through decoration-iodine-deep',
                chosen === answer && !isAnswer && 'opacity-60',
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
    </FeedbackFlash>
  );
}
