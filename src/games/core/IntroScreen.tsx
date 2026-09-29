import { Suspense } from 'react';
import { t, tp } from '../../lib/i18n';
import BlobButton from '../../components/primitives/BlobButton';
import Stars from './Stars';
import type { GameControls, GameDefinition, Stars as StarCount } from './types';

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
}

/**
 * First screen: how to play (the game's animated HowTo when it has one, else the instruction list),
 * controls, length and difficulty, the player's record, "Începe".
 */
export default function IntroScreen({ definition, best, onStart }: Props) {
  const { HowTo } = definition;
  const list = (
    <ol className="lesson-ol">
      {definition.instructions.map((line) => (
        <li key={line}>{line}</li>
      ))}
    </ol>
  );
  return (
    <div className="grid gap-8 p-2 sm:p-4 lg:grid-cols-[1.3fr_1fr] lg:gap-12">
      <div className="flex flex-col gap-4">
        <h2 className="text-2">{t('games.shell.howTo')}</h2>
        {HowTo ? (
          <Suspense fallback={list}>
            <HowTo />
          </Suspense>
        ) : (
          list
        )}
      </div>
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
        <BlobButton size="lg" onClick={onStart} data-autofocus>
          {t('games.shell.start')}
        </BlobButton>
      </div>
    </div>
  );
}
