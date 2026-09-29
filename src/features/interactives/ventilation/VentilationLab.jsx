import { useEffect, useId, useRef, useState } from 'react';
import { formatNumber } from '../../../lib/i18n';
import BlobButton from '../../../components/primitives/BlobButton';
import InteractiveFrame from '../../gamefeel/InteractiveFrame';
import HintBox from '../../gamefeel/HintBox';
import FeedbackFlash, { useFlash } from '../../gamefeel/FeedbackFlash';
import { useGameSession } from '../../gamefeel/useGameSession';
import copy from '../../../content/ro/interactives/ventilation';
import { useBreathing } from './useBreathing';
import ThoraxFigure from './ThoraxFigure';
import Spirogram from './Spirogram';
import PleuraCallout from './PleuraCallout';

const T = copy.text;
const fill = (s, vars) => s.replace(/\{(\w+)\}/g, (m, k) => vars[k] ?? m);
const MAX_SAMPLES = 260;

/** Mecanica ventilației: breathe the model, read the volumes off the graph, and the pleura check. */
export default function VentilationLab({ topic }) {
  const session = useGameSession(topic);
  const breath = useBreathing(copy.volumes);
  const [matched, setMatched] = useState([]);
  const [pleuraOk, setPleuraOk] = useState(false);
  const graphFlash = useFlash();
  const graphBox = useRef(null);
  const sliderId = useId();
  const reported = useRef(false);

  const cyclesDone = breath.cycles >= copy.cyclesNeeded;
  const current = copy.matchOrder[matched.length];
  const matchDone = !current;

  useEffect(() => {
    if (cyclesDone && matchDone && pleuraOk && !reported.current) {
      reported.current = true;
      session.complete();
    }
  }, [cyclesDone, matchDone, pleuraOk, session]);

  const pick = (key, element) => {
    const box = element.getBoundingClientRect();
    const frame = graphBox.current.getBoundingClientRect();
    const origin = { x: box.left + box.width / 2 - frame.left, y: box.top + box.height / 2 - frame.top };
    const ok = session.report(key === current, graphFlash, origin);
    if (ok) setMatched((m) => [...m, key]);
  };

  const hint = !cyclesDone ? T.hints.cycles : !matchDone ? T.hints[current] : !pleuraOk ? T.hints.pleura : null;

  return (
    <InteractiveFrame topic={topic} title={copy.title} intro={copy.intro} session={session}>
      <div className="grid items-center gap-6 sm:grid-cols-[13rem_1fr]">
        <div className="flex flex-col gap-2">
          <ThoraxFigure volume={breath.volume} levels={breath.levels} text={T} />
          <p className="text-label text-center text-ink-soft" aria-hidden="true">
            {breath.direction === 'in' ? T.airIn : breath.direction === 'out' ? T.airOut : ' '}
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <BlobButton variant="methylene" onClick={breath.inspire}>
              {T.inspire}
            </BlobButton>
            <BlobButton variant="paper" onClick={breath.expire}>
              {T.expire}
            </BlobButton>
          </div>
          <p className="text-label text-ink-soft" aria-live="polite">
            {fill(T.cycles, { n: Math.min(breath.cycles, copy.cyclesNeeded), needed: copy.cyclesNeeded })}
          </p>
          <div className="flex flex-col gap-1">
            <label htmlFor={sliderId} className="text--1 font-medium">
              {T.slider}
            </label>
            <input
              id={sliderId}
              type="range"
              min={breath.levels.RV}
              max={breath.levels.TLC}
              step={100}
              value={breath.target}
              aria-valuetext={fill(T.valueText, { ml: formatNumber(breath.target) })}
              onChange={(e) => breath.setTarget(Number(e.target.value))}
              className="w-full accent-[color:var(--methylene-deep)]"
            />
          </div>
        </div>
      </div>

      {/* The graph gets the full width of the interactive */}
      <div ref={graphBox}>
        <FeedbackFlash flash={graphFlash} pop={1.015} className="rounded-well bg-paper p-2 shadow-well">
          <Spirogram
            samples={breath.samples}
            maxSamples={MAX_SAMPLES}
            levels={breath.levels}
            bands={copy.bands}
            matched={matched}
            matching={cyclesDone && !matchDone}
            onPick={pick}
            text={T}
          />
        </FeedbackFlash>
      </div>

      {cyclesDone && (
        <p className="font-medium" aria-live="polite">
          {matchDone ? T.matchDone : `${T.matchIntro} ${fill(T.matchPrompt, { name: copy.bands[current].name.toLocaleLowerCase('ro'), short: current })}`}
        </p>
      )}

      <PleuraCallout pleura={copy.pleura} session={session} solved={pleuraOk} onSolved={() => setPleuraOk(true)} />
      {hint && <HintBox hint={hint} session={session} />}
    </InteractiveFrame>
  );
}
