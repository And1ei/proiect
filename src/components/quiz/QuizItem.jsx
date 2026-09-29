import { useEffect, useRef, useState } from 'react';
import { cx } from '../../lib/cx';
import { t } from '../../lib/i18n';
import BlobButton from '../primitives/BlobButton';
import ChoiceGroup from './ChoiceGroup';

function isCorrect(item, answer) {
  if (item.type === 'af') {
    if (item.isTrue) return answer.tf === 0;
    return answer.tf === 1 && answer.fix === item.correctFix;
  }
  return answer.choice === item.answer;
}

function Blank({ item, choice }) {
  const [before, after] = item.sentence.split('___');
  return (
    <p className="font-display text-2 leading-heading">
      {before}
      <span className={cx('inline-block min-w-[5ch] border-b-2 px-1', choice === null ? 'border-dashed border-ink-faint text-ink-faint' : 'border-eosin')}>
        {choice === null ? <span className="sr-only">{t('quiz.blank')}</span> : item.options[choice]}
      </span>
      {after}
    </p>
  );
}

/** One quiz question. Only the first check is scored; after a wrong answer you may try again. */
export default function QuizItem({ item, index, total, onFirstCheck, onNext, isLast, focusOnMount }) {
  const [answer, setAnswer] = useState({ choice: null, tf: null, fix: null });
  const [status, setStatus] = useState(null); // null | 'correct' | 'wrong'
  const [checkedOnce, setCheckedOnce] = useState(false);
  const heading = useRef(null);
  const nextButton = useRef(null);

  useEffect(() => {
    if (focusOnMount) heading.current?.focus();
  }, [focusOnMount]);

  const update = (patch) => {
    setAnswer((a) => ({ ...a, ...patch }));
    if (status === 'wrong') setStatus(null);
  };

  // A true statement has no corrections, so "Fals" can be checked straight away
  const needsFix = item.type === 'af' && !item.isTrue;
  const canCheck =
    item.type === 'af' ? answer.tf === 0 || (answer.tf === 1 && (!needsFix || answer.fix !== null)) : answer.choice !== null;
  const locked = status === 'correct';

  const check = () => {
    const ok = isCorrect(item, answer);
    setStatus(ok ? 'correct' : 'wrong');
    if (!checkedOnce) {
      setCheckedOnce(true);
      onFirstCheck(ok);
    }
    // Correct: "Verifică" disappears, so hand focus to the next step. Wrong: stay put to retry.
    // The verdict itself is announced by the live region.
    if (ok) requestAnimationFrame(() => nextButton.current?.focus());
  };

  return (
    <div className="flex flex-col gap-6">
      <h3 ref={heading} tabIndex={-1} className="text-label text-ink-soft focus:outline-none">
        {t('quiz.progress', { n: index + 1, total })} · {t(`quiz.types.${item.type}`)}
      </h3>

      {item.type === 'grila' && (
        <ChoiceGroup legend={item.prompt} options={item.options} value={answer.choice} onChange={(i) => update({ choice: i })} disabled={locked} reveal={locked && { answer: item.answer }} lettered />
      )}

      {item.type === 'af' && (
        <>
          <p className="font-display text-2 leading-heading">{item.statement}</p>
          <ChoiceGroup legend={t('quiz.tfLabel')} options={[t('quiz.true'), t('quiz.false')]} value={answer.tf} onChange={(i) => update({ tf: i, fix: null })} disabled={locked} inline />
          {answer.tf === 1 && needsFix && (
            <ChoiceGroup legend={t('quiz.chooseFix')} options={item.fixes} value={answer.fix} onChange={(i) => update({ fix: i })} disabled={locked} reveal={locked && { answer: item.correctFix }} lettered />
          )}
        </>
      )}

      {item.type === 'completare' && (
        <>
          <Blank item={item} choice={answer.choice} />
          <ChoiceGroup legend={t('quiz.optionsLabel')} options={item.options} value={answer.choice} onChange={(i) => update({ choice: i })} disabled={locked} reveal={locked && { answer: item.answer }} inline />
        </>
      )}

      <div role="status" aria-live="polite">
        {status && (
          <div className={cx('flex flex-col gap-1 rounded-cell-alt p-4', status === 'correct' ? 'bg-methylene-50' : 'bg-eosin-50')}>
            <p className={cx('text-label', status === 'correct' ? 'text-methylene-deep' : 'text-eosin-deep')}>
              {t(status === 'correct' ? 'quiz.correct' : 'quiz.retry')}
            </p>
            <p className="text--1 leading-body">
              {item.explanation}{' '}
              {item.link && (
                <a href={item.link.href} className="text-methylene-deep underline underline-offset-4">
                  {item.link.label}
                </a>
              )}
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {!locked && (
          <BlobButton variant="eosin" onClick={check} disabled={!canCheck}>
            {t('quiz.check')}
          </BlobButton>
        )}
        {checkedOnce && (
          <BlobButton ref={nextButton} variant="methylene" shape="b" onClick={onNext}>
            {t(isLast ? 'quiz.finish' : 'quiz.next')}
          </BlobButton>
        )}
      </div>
    </div>
  );
}
