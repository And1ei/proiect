import { useEffect, useRef, useState } from 'react';
import { cx } from '../../../lib/cx';
import { formatNumber } from '../../../lib/i18n';
import InteractiveFrame from '../../gamefeel/InteractiveFrame';
import HintBox from '../../gamefeel/HintBox';
import { useGameSession } from '../../gamefeel/useGameSession';
import ChoiceQuestion from '../shared/ChoiceQuestion';
import Tabs from '../shared/Tabs';
import copy from '../../../content/ro/interactives/punnett';
import { usePunnett } from './usePunnett';
import { countsText } from './genetics';
import PunnettGrid from './PunnettGrid';
import RatioStep from './RatioStep';

const MODES = Object.keys(copy.modes);
const percent = (n) => copy.text.percent.replace('{n}', formatNumber(n));

function hintFor(cross, letter) {
  const h = copy.text.hints;
  if (cross.phase === 'unknown') return h.unknown;
  if (cross.phase === 'headers') return h.headers;
  if (cross.phase === 'cells') return h.cells;
  if (cross.phase === 'ratios') return h.ratios.replace('{counts}', countsText(cross.grid, letter));
  if (cross.phase === 'word') return h.word;
  return null;
}

function CrossPanel({ modeKey, session, onDone, hidden }) {
  const mode = copy.modes[modeKey];
  const { letter } = copy.trait;
  const cross = usePunnett(mode, letter);
  const reported = useRef(false);

  useEffect(() => {
    if (cross.phase === 'done' && !reported.current) {
      reported.current = true;
      onDone(modeKey);
    }
  }, [cross.phase, modeKey, onDone]);

  const percents = copy.percentOptions;
  return (
    <div role="tabpanel" id={`punnett-${modeKey}`} aria-labelledby={`punnett-tab-${modeKey}`} hidden={hidden} className={cx('flex-col gap-6', hidden ? 'hidden' : 'flex')}>
      <p className="font-medium">{mode.problem}</p>

      {mode.unknown && (
        <div className="flex flex-col gap-2">
          <p className="text--1 text-ink-soft">{mode.unknown.observation}</p>
          <ChoiceQuestion
            name="unknown"
            prompt={copy.text.unknownPrompt}
            options={mode.unknown.options}
            answer={mode.unknown.options.indexOf(mode.unknown.actual)}
            session={session}
            solved={cross.phase !== 'unknown'}
            onSolved={cross.resolveUnknown}
          />
        </div>
      )}

      {cross.phase === 'headers' && <p className="text--1">{copy.text.headersStep}</p>}
      {cross.phase === 'cells' && <p className="text--1">{copy.text.cellsStep}</p>}
      {cross.phase !== 'unknown' && <PunnettGrid cross={cross} session={session} letter={letter} />}
      {['ratios', 'word', 'done'].includes(cross.phase) && <RatioStep cross={cross} session={session} trait={copy.trait} />}
      {['word', 'done'].includes(cross.phase) && (
        <ChoiceQuestion
          name="word"
          prompt={mode.word.text}
          options={percents.map(percent)}
          answer={percents.indexOf(cross.wordAnswer)}
          session={session}
          solved={cross.phase === 'done'}
          onSolved={cross.solveWord}
        />
      )}
      {cross.phase === 'done' ? (
        <p className="text-label text-methylene-deep">{copy.text.modeDone}</p>
      ) : (
        <HintBox hint={hintFor(cross, letter)} session={session} />
      )}
    </div>
  );
}

/** Careul lui Punnett: monohybrid cross and test cross, one tab each. */
export default function PunnettBuilder({ topic }) {
  const session = useGameSession(topic);
  const [active, setActive] = useState(MODES[0]);
  const [done, setDone] = useState([]);

  const onDone = (modeKey) => {
    setDone((d) => [...d, modeKey]);
    // Either cross solved end to end completes the interactive; the other stays available
    if (!session.completedNow) session.complete();
  };

  return (
    <InteractiveFrame topic={topic} title={copy.title} intro={copy.intro} session={session}>
      <Tabs
        items={MODES.map((key) => ({ key, label: copy.modes[key].label }))}
        active={active}
        onChange={setActive}
        label={copy.text.modesLabel}
        idPrefix="punnett"
        done={done}
      />
      {MODES.map((key) => (
        <CrossPanel key={key} modeKey={key} session={session} onDone={onDone} hidden={active !== key} />
      ))}
    </InteractiveFrame>
  );
}
