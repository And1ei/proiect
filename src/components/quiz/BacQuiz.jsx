import { useRef, useState } from 'react';
import { t, tp } from '../../lib/i18n';
import { useProgress } from '../../lib/useProgress';
import { sectionIdsOf } from '../../content/ro/topics';
import { cx } from '../../lib/cx';
import BlobButton from '../primitives/BlobButton';
import QuizItem from './QuizItem';

function Dots({ total, index, results }) {
  return (
    <ol aria-hidden="true" className="flex gap-2">
      {Array.from({ length: total }, (_, i) => (
        <li
          key={i}
          className={cx(
            'size-3 rounded-blob-a',
            results[i] === true && 'bg-methylene',
            results[i] === false && 'bg-eosin',
            results[i] === undefined && (i === index ? 'bg-ink-soft' : 'bg-paper-shade'),
          )}
        />
      ))}
    </ol>
  );
}

/** Bacalaureat-style quiz, one question at a time. Saves the best score to local progress. */
export default function BacQuiz({ topic }) {
  const items = topic.quiz;
  const total = items.length;
  const { topic: progressOf, saveQuiz } = useProgress();
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState([]);
  const [finished, setFinished] = useState(false);
  const [round, setRound] = useState(0);
  const resultHeading = useRef(null);

  const score = results.filter(Boolean).length;
  const best = progressOf(topic.slug).quizBest;

  const next = () => {
    if (index < total - 1) return setIndex(index + 1);
    saveQuiz(topic.slug, score, total, sectionIdsOf(topic));
    setFinished(true);
    requestAnimationFrame(() => resultHeading.current?.focus());
  };

  const restart = () => {
    setIndex(0);
    setResults([]);
    setFinished(false);
    setRound((r) => r + 1);
  };

  return (
    <div className="flex flex-col gap-6 rounded-cell bg-paper-bright p-5 shadow-card sm:p-8">
      <Dots total={total} index={finished ? -1 : index} results={results} />

      {!finished ? (
        <QuizItem
          key={`${round}-${index}`}
          item={items[index]}
          index={index}
          total={total}
          isLast={index === total - 1}
          focusOnMount={index > 0 || round > 0}
          onFirstCheck={(ok) =>
            setResults((r) => {
              const copy = [...r];
              copy[index] = ok;
              return copy;
            })
          }
          onNext={next}
        />
      ) : (
        <div className="flex flex-col items-start gap-4">
          <h3 ref={resultHeading} tabIndex={-1} className="text-label text-ink-soft focus:outline-none">
            {t('quiz.resultHeading')}
          </h3>
          <p className="font-display text-3 leading-heading">{tp('quiz.score', score, { score, total })}</p>
          <p className="text--1 text-ink-soft">{t('quiz.scoreNote')}</p>
          {best && <p className="text-label text-methylene-deep">{t('quiz.best', best)}</p>}
          <BlobButton variant="paper" onClick={restart}>
            {t('quiz.restart')}
          </BlobButton>
        </div>
      )}
    </div>
  );
}
