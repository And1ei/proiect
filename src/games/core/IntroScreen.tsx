import { Suspense } from 'react';
import { t, tp } from '../../lib/i18n';
import BlobButton from '../../components/primitives/BlobButton';
import Stars from './Stars';
import type { GameControls, GameDefinition, Stars as StarCount } from './types';
import type { Lesson } from '../../content/ro/lessons/index.ts';
import Inline from '../../components/lesson/Inline';

const INPUTS = ['touch', 'mouse', 'keyboard'] as const;

export function ControlsList({ controls }: { controls: GameControls }) {
  const rows = INPUTS.filter((k) => controls[k]);
  if (!rows.length) return null;
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-label text-ink-soft">{t('games.shell.controls')}</h3>
      <dl className="grid gap-x-4 gap-y-1.5 text--1 sm:grid-cols-[7rem_1fr]">
        {rows.map((k) => (
          <div key={k} className="contents">
            <dt className="text-label pt-0.5 text-ink-soft">{t(`games.shell.controlTypes.${k}`)}</dt>
            <dd>{controls[k]}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

interface Props {
  definition: GameDefinition;
  best: { bestScore: number; stars: number; plays: number };
  onStart: () => void;
  /** The game's lesson: its "Pe scurt" is shown, with "Recitește lecția" (opens the lesson sheet). */
  lesson?: Lesson | null;
  onReread?: () => void;
  /** The section before this game was read: "Începe" is primary; otherwise reading is suggested. */
  readBefore?: boolean;
}

/**
 * First screen: how to play (the game's animated HowTo when it has one, else the instruction list),
 * controls, length and difficulty, the player's record, "Începe".
 */
export default function IntroScreen({ definition, best, onStart, lesson, onReread, readBefore = false }: Props) {
  const { HowTo } = definition;
  const list = (
    <ol className="lesson-ol">
      {definition.instructions.map((line) => (
        <li key={line}>{line}</li>
      ))}
    </ol>
  );
  const side = (
    <div className="flex flex-col items-start gap-6">
      <ControlsList controls={definition.controls} />
      <p className="text-label flex flex-wrap gap-x-4 gap-y-1 text-ink-soft">
        <span>{t('games.minutes', { n: definition.estimatedMinutes })}</span>
        <span>{t(`games.difficulty.${definition.difficulty}`)}</span>
      </p>
      {best.plays > 0 && (
        <p className="flex flex-wrap items-center gap-3 text--1 text-ink-soft">
          <Stars value={best.stars as StarCount} size="sm" />
          <span>{t('games.best', { score: best.bestScore })}</span>
          <span>{tp('games.plays', best.plays)}</span>
        </p>
      )}
      {lesson && (
        <div className="relative w-full max-w-[34rem] rotate-[0.4deg] rounded-[4px] bg-paper px-5 pb-4 pt-5 shadow-card">
          <h3 className="text-label mb-2 text-ink-soft">{t('lesson.keyPoints')}</h3>
          <ol className="lesson-ol text--1">
            {lesson.keyPoints.map((k) => (
              <li key={k}>
                <Inline text={k} />
              </li>
            ))}
          </ol>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-3">
        {lesson && onReread && !readBefore && (
          <BlobButton size="lg" variant="methylene" onClick={onReread}>
            {t('sheet.reread')}
          </BlobButton>
        )}
        <BlobButton size="lg" variant={lesson && !readBefore ? 'paper' : 'eosin'} shape="b" onClick={onStart} data-autofocus>
          {t(lesson && !readBefore ? 'sheet.skip' : 'games.shell.start')}
        </BlobButton>
        {lesson && onReread && readBefore && (
          <BlobButton size="lg" variant="paper" shape="c" onClick={onReread}>
            {t('sheet.reread')}
          </BlobButton>
        )}
      </div>
    </div>
  );

  // An animated HowTo gets the full width; the controls and "Începe" follow underneath
  if (HowTo) {
    return (
      <div className="flex flex-col gap-8 p-2 sm:p-4">
        <div className="flex flex-col gap-4">
          <h2 className="text-2">{t('games.shell.howTo')}</h2>
          <Suspense fallback={list}>
            <HowTo />
          </Suspense>
        </div>
        {side}
      </div>
    );
  }

  return (
    <div className="grid gap-8 p-2 sm:p-4 lg:grid-cols-[1.3fr_1fr] lg:gap-12">
      <div className="flex flex-col gap-4">
        <h2 className="text-2">{t('games.shell.howTo')}</h2>
        {list}
      </div>
      {side}
    </div>
  );
}
