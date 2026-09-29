// The animated "Cum se joacă" of Safari la microscop (GameDefinition.howTo): the real pieces in
// miniature (the round field, an observation card, the group buttons). No Phaser here.
import { useEffect, useState, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { useReducedMotion } from '../../../lib/motionPreference';
import { spring } from '../../../lib/motion';
import { cx } from '../../../lib/cx';
import Sprite from '../../../components/illustration/Sprite';
import { SAFARI } from '../../../content/ro/games/safari-microscop';
import { CLUES, GROUPS, organismById } from '../../../content/ro/safari-organisms.ts';

function Step({ n, title, text, children, reduced }: { n: number; title: string; text: string; children: ReactNode; reduced: boolean }) {
  return (
    <motion.li
      className="flex flex-col gap-3 rounded-cell-alt bg-paper p-3 shadow-well"
      initial={reduced ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring, delay: reduced ? 0 : 0.12 * n }}
    >
      <div aria-hidden="true" className="relative flex h-44 items-center justify-center overflow-hidden rounded-well bg-paper-bright p-2">
        {children}
      </div>
      <div className="flex gap-2.5 px-1">
        <span aria-hidden="true" className="font-display text-2 leading-none text-safranin-deep">
          {n}
        </span>
        <p className="flex flex-col gap-0.5 text--1 leading-body">
          <strong className="font-medium text-ink">{title}</strong>
          <span className="text-ink-soft">{text}</span>
        </p>
      </div>
    </motion.li>
  );
}

export function SafariHowTo() {
  const reduced = useReducedMotion();
  const [beat, setBeat] = useState(0);
  useEffect(() => {
    if (reduced) return undefined;
    const id = setInterval(() => setBeat((b) => b + 1), 1400);
    return () => clearInterval(id);
  }, [reduced]);
  const o = organismById('parameci')!;
  const steps = SAFARI.howTo.steps;
  const groups = ['bacterii', 'protozoare', 'chromista', 'fungi'] as const;

  return (
    <ol aria-label={SAFARI.howTo.label} className="grid gap-3 md:grid-cols-3">
      <Step n={1} title={steps[0].title} text={steps[0].text} reduced={reduced}>
        <div className="relative h-36 w-36">
          <svg viewBox="0 0 100 100" className="absolute inset-0 size-full">
            <defs>
              <clipPath id="howto-field">
                <circle cx="50" cy="50" r="47" />
              </clipPath>
            </defs>
            <circle cx="50" cy="50" r="47" fill="var(--paper)" />
            <g clipPath="url(#howto-field)" stroke="var(--methylene-100)" strokeWidth="0.8">
              {[10, 20, 30, 40, 50, 60, 70, 80, 90].map((v) => (
                <g key={v}>
                  <line x1={v} y1="0" x2={v} y2="100" />
                  <line x1="0" y1={v} x2="100" y2={v} />
                </g>
              ))}
            </g>
            <circle cx="50" cy="50" r="47" fill="none" stroke="var(--ink-soft)" strokeWidth="1.6" />
          </svg>
          <motion.div
            className="absolute left-1/2 top-1/2 -ml-6 -mt-6"
            initial={false}
            animate={reduced ? { x: 0, y: 0 } : { x: beat % 2 ? 6 : -34, y: beat % 2 ? 2 : -22 }}
            transition={spring}
          >
            <Sprite id={o.sprite} size="md" tone={o.tone} />
            {beat % 2 === 1 && <span className="absolute -inset-2 rounded-full border-2 border-eosin" />}
          </motion.div>
        </div>
      </Step>
      <Step n={2} title={steps[1].title} text={steps[1].text} reduced={reduced}>
        <div className="w-full rotate-[-0.5deg] rounded-[4px] bg-paper px-3 py-2 text--2 shadow-card">
          <p className="flex items-center gap-2">
            <Sprite id={o.sprite} size="sm" tone={o.tone} />
            <span className="font-display text-0">{o.name}</span>
            <em className="text-ink-soft">{o.binomial}</em>
          </p>
          <ul className="mt-1.5 flex flex-col gap-1">
            {o.clues.filter((c, i) => o.diagnostic.includes(c) || i === 0).map((c) => (
              <li key={c} className={cx(o.diagnostic.includes(c) && beat % 2 === 0 && 'underline decoration-eosin decoration-2 underline-offset-4')}>
                {CLUES[c].text}
              </li>
            ))}
          </ul>
        </div>
      </Step>
      <Step n={3} title={steps[2].title} text={steps[2].text} reduced={reduced}>
        <div className="grid w-full grid-cols-2 gap-1.5">
          {groups.map((g, i) => (
            <motion.span
              key={g}
              animate={{ scale: g === o.group && beat % 2 === 1 && !reduced ? 1.05 : 1 }}
              transition={spring}
              className={cx('flex items-center justify-between rounded-well px-2 py-1.5 text--2 shadow-rest', g === o.group && beat % 2 === 1 ? 'bg-methylene-100 ring-2 ring-methylene-deep' : 'bg-paper')}
            >
              <span className="font-medium">{GROUPS[g].name}</span>
              <kbd className="rounded-[4px] border border-ink-faint bg-paper-bright px-1 font-mono">{i + 1}</kbd>
            </motion.span>
          ))}
        </div>
      </Step>
    </ol>
  );
}
