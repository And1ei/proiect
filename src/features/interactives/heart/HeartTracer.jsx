import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { useReducedMotion } from '../../../lib/motionPreference';
import { springSettle } from '../../../lib/motion';
import BlobButton from '../../../components/primitives/BlobButton';
import InteractiveFrame from '../../gamefeel/InteractiveFrame';
import HintBox from '../../gamefeel/HintBox';
import FeedbackFlash, { useFlash } from '../../gamefeel/FeedbackFlash';
import { useGameSession } from '../../gamefeel/useGameSession';
import Tabs from '../shared/Tabs';
import HeartFigure from '../../../figures/HeartFigure';
import { FIGURES } from '../../../content/ro/figures';
import copy from '../../../content/ro/interactives/heart';
import { routePath, useHeartTracer } from './useHeartTracer';

const T = copy.text;

/** Traced route so far: one segment per correct step, each drawn in with a spring. */
function Route({ steps, index }) {
  return (
    <g fill="none" stroke="var(--iodine-deep)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
      {index > 0 && <circle cx={steps[0].route[0][0]} cy={steps[0].route[0][1]} r="6" fill="var(--iodine)" stroke="none" />}
      {Array.from({ length: Math.max(index - 1, 0) }, (_, k) => (
        <motion.path key={k} d={routePath(steps, k, k + 1)} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={springSettle} />
      ))}
    </g>
  );
}

/** Recap: a bright pulse runs once along the whole circuit. */
function Pulse({ steps, run }) {
  return (
    <motion.path
      key={run}
      d={routePath(steps, 0, steps.length - 1)}
      pathLength="1"
      fill="none"
      stroke="var(--paper-bright)"
      strokeWidth="3"
      strokeLinecap="round"
      strokeDasharray="0.08 1"
      initial={{ strokeDashoffset: 0.08, opacity: 1 }}
      animate={{ strokeDashoffset: -1, opacity: 0 }}
      transition={{ strokeDashoffset: { type: 'spring', duration: 1.8, bounce: 0 }, opacity: { type: 'spring', duration: 0.4, bounce: 0, delay: 1.5 } }}
    />
  );
}

/** Drumul sângelui: trace the pulmonary and systemic circuits by clicking structures in order. */
export default function HeartTracer({ topic }) {
  const session = useGameSession(topic);
  const tracer = useHeartTracer(copy.circuits);
  const reduce = useReducedMotion();
  const flash = useFlash();
  const wrapper = useRef(null);
  const [pulseRun, setPulseRun] = useState(0);
  const reported = useRef(false);

  useEffect(() => {
    if (tracer.complete && !reduce) setPulseRun((r) => r + 1);
  }, [tracer.complete, tracer.active, reduce]);

  useEffect(() => {
    if (!reported.current && tracer.done.length === tracer.keys.length) {
      reported.current = true;
      session.complete();
    }
  }, [tracer.done, tracer.keys.length, session]);

  const onActivate = (part, element) => {
    const box = element.getBoundingClientRect();
    const frame = wrapper.current.getBoundingClientRect();
    const origin = { x: box.left + box.width / 2 - frame.left, y: box.top + box.height / 2 - frame.top };
    session.report(tracer.activate(part), flash, origin);
  };

  const circuit = copy.circuits[tracer.active];
  return (
    <InteractiveFrame topic={topic} title={copy.title} intro={copy.intro} session={session}>
      <Tabs
        items={tracer.keys.map((key) => ({ key, label: copy.circuits[key].label }))}
        active={tracer.active}
        onChange={tracer.setActive}
        label={T.circuitsLabel}
        idPrefix="heart"
        done={tracer.done}
      />
      <div role="tabpanel" id={`heart-${tracer.active}`} aria-labelledby={`heart-tab-${tracer.active}`} className="flex flex-col gap-4">
        <p className="font-medium">{circuit.start}</p>
        <p className="text-label text-ink-soft" aria-live="polite">
          {tracer.complete ? T.traced : T.progress.replace('{n}', tracer.index + 1).replace('{total}', tracer.steps.length)}
        </p>
        <div ref={wrapper}>
          <FeedbackFlash flash={flash} pop={1.015} className="rounded-well bg-paper p-2 shadow-well sm:p-4">
            <HeartFigure meta={FIGURES.inima} interactive lit={tracer.lit} onActivate={onActivate}>
              <Route steps={tracer.steps} index={tracer.index} />
              {tracer.complete && pulseRun > 0 && <Pulse steps={tracer.steps} run={pulseRun} />}
            </HeartFigure>
          </FeedbackFlash>
        </div>
        {tracer.complete && !reduce && (
          <BlobButton size="sm" variant="paper" className="self-start" onClick={() => setPulseRun((r) => r + 1)}>
            {T.replay}
          </BlobButton>
        )}
        {!tracer.complete && <HintBox hint={tracer.steps[tracer.index].hint} session={session} />}
      </div>
    </InteractiveFrame>
  );
}
