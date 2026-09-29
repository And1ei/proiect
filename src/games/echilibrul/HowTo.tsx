// The animated "Cum se joacă" for Echilibrul (GameDefinition.howTo): three steps built from the
// game's real pieces (the live food web, a journal clipping, the tool buttons).
import { useEffect, useState, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { useReducedMotion } from '../../lib/motionPreference';
import { spring } from '../../lib/motion';
import { ECO } from '../../content/ro/games/echilibrul';
import { SCENARIOS, type ScenarioId } from '../../content/ro/ecosystem-species';
import FoodWeb from './FoodWeb';

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
        <span aria-hidden="true" className="font-display text-2 leading-none text-eosin-deep">
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

function HowTo({ scenarioId }: { scenarioId: ScenarioId }) {
  const reduced = useReducedMotion();
  const scenario = SCENARIOS[scenarioId];
  const [beat, setBeat] = useState(0);
  useEffect(() => {
    if (reduced) return undefined;
    const id = setInterval(() => setBeat((b) => b + 1), 1600);
    return () => clearInterval(id);
  }, [reduced]);
  // populations that swell and shrink, like in the game (the predators lag the prey)
  const x = scenario.species.map((_, i) => 1 + 0.55 * Math.sin(beat * 0.9 - i * 0.9));
  const event = scenario.events[beat % scenario.events.length];
  const steps = ECO.howTo.steps;
  const armed = beat % 3;

  return (
    <ol aria-label={ECO.howTo.label} className="grid gap-3 md:grid-cols-3">
      <Step n={1} title={steps[0].title} text={steps[0].text} reduced={reduced}>
        <div className="w-full max-w-[15rem]">
          <FoodWeb scenario={scenario} x={x} extinct={scenario.species.map(() => false)} selected={null} reduced={reduced} />
        </div>
      </Step>
      <Step n={2} title={steps[1].title} text={steps[1].text} reduced={reduced}>
        <motion.div
          key={event.kind}
          initial={reduced ? false : { opacity: 0, y: -14, rotate: -4 }}
          animate={{ opacity: 1, y: 0, rotate: -1 }}
          transition={spring}
          className="relative w-[85%] rounded-[4px] bg-paper px-4 pb-3 pt-4 shadow-card"
        >
          <span className="absolute left-1/2 top-1.5 size-2.5 -translate-x-1/2 rounded-full bg-eosin shadow-[0_1px_0_var(--eosin-deep)]" />
          <p className="text-label flex justify-between text-ink-soft">
            <span>{ECO.eventYear.replace('{n}', '3')}</span>
            <span className="text-eosin-deep">{ECO.soon.replace('{n}', '5')}</span>
          </p>
          <p className="mt-1 font-display text-1 leading-heading">{event.headline}</p>
        </motion.div>
      </Step>
      <Step n={3} title={steps[2].title} text={steps[2].text} reduced={reduced}>
        <div className="flex w-full flex-col gap-2">
          {(['protejeaza', 'regenereaza', 'reintroduce'] as const).map((tool, i) => (
            <motion.span
              key={tool}
              animate={{ scale: armed === i && !reduced ? 1.03 : 1 }}
              transition={spring}
              className={`flex items-center justify-between rounded-well px-3 py-1.5 text--1 shadow-rest ${armed === i ? 'bg-methylene-100 ring-2 ring-methylene-deep' : 'bg-paper'}`}
            >
              <span className="font-medium">{ECO.tools[tool].name}</span>
              <kbd className="rounded-[5px] border border-ink-faint bg-paper-bright px-1 font-mono text--2">{i + 1}</kbd>
            </motion.span>
          ))}
        </div>
      </Step>
    </ol>
  );
}

export function ForestHowTo() {
  return <HowTo scenarioId="padure" />;
}

export function PondHowTo() {
  return <HowTo scenarioId="balta" />;
}
