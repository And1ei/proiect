// Inventar (advanced mode, end of years 5 and 10): a sample count per species from the model; the
// player computes each species' dominanță (D = n / N × 100), picks the dominant species and answers
// one question about balance. Every correct answer is computed from the counts, never hard-coded.
import { useId, useRef, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { cx } from '../../lib/cx';
import { formatNumber } from '../../lib/i18n';
import { spring } from '../../lib/motion';
import BlobButton from '../../components/primitives/BlobButton';
import Sprite from '../../components/illustration/Sprite';
import { ECO, fill } from '../../content/ro/games/echilibrul';
import type { ScenarioText } from '../../content/ro/ecosystem-species';
import { PRODUCER_HIGH_D } from './scenarios';
import { gradeInventory } from './inventory';
import { VIEW } from './view';

interface Props {
  scenario: ScenarioText;
  year: number;
  counts: number[];
  onDone: (points: number) => void;
  announce: (text: string) => void;
}

export default function Inventar({ scenario, year, counts, onDone, announce }: Props) {
  const [typed, setTyped] = useState<string[]>(() => counts.map(() => ''));
  const [dominantPick, setDominantPick] = useState<number | null>(null);
  const [balancePick, setBalancePick] = useState<'high' | 'normal' | null>(null);
  const [result, setResult] = useState<ReturnType<typeof gradeInventory> | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const name = useId();
  const producer = scenario.species.findIndex((s) => s.guild === 'producator');
  const N = counts.reduce((a, b) => a + b, 0);
  const S = ECO.inventory;

  useEffect(() => heading.current?.focus(), []);

  const check = () => {
    const r = gradeInventory(counts, producer, typed, dominantPick, balancePick);
    setResult(r);
    announce(fill(S.points, { n: r.points }));
  };

  return (
    <motion.section
      aria-labelledby={`${name}-h`}
      className="flex flex-col gap-5 rounded-cell bg-paper-bright p-4 shadow-card sm:p-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring}
    >
      <header className="flex flex-col gap-2">
        <h2 id={`${name}-h`} ref={heading} tabIndex={-1} className="text-display text-3 focus:outline-none">
          {fill(S.title, { n: year })}
        </h2>
        <p className="prose-body text--1 sm:text-0">{S.intro}</p>
      </header>

      <table className="w-full border-collapse text--1">
        <thead>
          <tr className="text-label text-left text-ink-soft">
            <th className="py-2 pr-2 font-normal" scope="col">
              <span className="sr-only">Specia</span>
            </th>
            <th className="py-2 pr-2 text-right font-normal" scope="col">
              {S.count}
            </th>
            <th className="py-2 text-right font-normal" scope="col">
              {S.d}
            </th>
          </tr>
        </thead>
        <tbody>
          {scenario.species.map((s, i) => (
            <tr key={s.id} className="border-t border-dashed border-ink-faint">
              <th scope="row" className="py-2 pr-2 text-left font-medium">
                <span className="flex items-center gap-2">
                  <Sprite id={s.sprite} size="sm" tone={VIEW[scenario.id].species[s.id].tone} />
                  <span>{s.name}</span>
                </span>
              </th>
              <td className="py-2 pr-2 text-right font-mono tabular-nums">{counts[i]}</td>
              <td className="py-2 text-right">
                <input
                  inputMode="decimal"
                  aria-label={`${S.d}: ${s.name}`}
                  value={typed[i]}
                  disabled={!!result}
                  onChange={(e) => setTyped((t) => t.map((v, k) => (k === i ? e.target.value : v)))}
                  className={cx(
                    'min-h-11 w-24 rounded-tag border bg-paper px-2 text-right font-mono tabular-nums',
                    result ? (result.perSpecies[i] ? 'border-methylene-deep' : 'border-eosin-deep') : 'border-ink-faint',
                  )}
                />
                {result && (
                  <span className={cx('mt-1 block text--2', result.perSpecies[i] ? 'text-methylene-deep' : 'text-eosin-deep')}>
                    {result.perSpecies[i] ? S.correct : fill(S.wrongD, { n: counts[i], N, d: formatNumber(result.d[i]) })}
                  </span>
                )}
              </td>
            </tr>
          ))}
          <tr className="border-t border-ink-faint">
            <th scope="row" className="py-2 text-left font-medium">
              {S.total}
            </th>
            <td className="py-2 pr-2 text-right font-mono tabular-nums">{N}</td>
            <td />
          </tr>
        </tbody>
      </table>

      <fieldset className="flex flex-col gap-2" disabled={!!result}>
        <legend className="mb-2 font-medium">{S.dominant}</legend>
        <div className="flex flex-wrap gap-2">
          {scenario.species.map((s, i) => (
            <label
              key={s.id}
              className={cx(
                'inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-btn-b px-3 py-1.5 text--1 shadow-well has-[:checked]:bg-methylene-100',
                result && i === result.dominantIndex && 'outline outline-2 outline-methylene-deep',
              )}
            >
              <input type="radio" name={`${name}-dom`} checked={dominantPick === i} onChange={() => setDominantPick(i)} className="accent-[var(--methylene-deep)]" />
              {s.name}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-2" disabled={!!result}>
        <legend className="mb-2 font-medium">{S.question}</legend>
        {(['high', 'normal'] as const).map((k) => (
          <label key={k} className="flex min-h-11 cursor-pointer items-start gap-2 rounded-well px-3 py-2 text--1 shadow-well has-[:checked]:bg-methylene-100">
            <input type="radio" name={`${name}-bal`} checked={balancePick === k} onChange={() => setBalancePick(k)} className="mt-1 accent-[var(--methylene-deep)]" />
            {fill(k === 'high' ? S.producerHigh : S.producerNormal, { t: PRODUCER_HIGH_D })}
          </label>
        ))}
        {result && (
          <p className={cx('text--1', result.balance ? 'text-methylene-deep' : 'text-eosin-deep')}>
            {fill(result.high ? S.explainHigh : S.explainNormal, { t: PRODUCER_HIGH_D })}
          </p>
        )}
      </fieldset>

      <div className="flex flex-wrap items-center gap-4">
        {result ? (
          <>
            <p className="font-mono text-1 tabular-nums text-methylene-deep">{fill(S.points, { n: result.points })}</p>
            <BlobButton onClick={() => onDone(result.points)}>{S.continue}</BlobButton>
          </>
        ) : (
          <BlobButton onClick={check} disabled={dominantPick === null || balancePick === null}>
            {S.check}
          </BlobButton>
        )}
      </div>
    </motion.section>
  );
}
