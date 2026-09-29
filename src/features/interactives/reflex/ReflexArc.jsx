import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { t } from '../../../lib/i18n';
import { springSettle } from '../../../lib/motion';
import InteractiveFrame from '../../gamefeel/InteractiveFrame';
import HintBox from '../../gamefeel/HintBox';
import { useFlash } from '../../gamefeel/FeedbackFlash';
import { useGameSession } from '../../gamefeel/useGameSession';
import { DragTag, DropSlot } from '../shared/PickPlace';
import ChoiceQuestion from '../shared/ChoiceQuestion';
import copy from '../../../content/ro/interactives/reflex';

const { arc, classify, text: T } = copy;
const byId = Object.fromEntries(arc.components.map((c) => [c.id, c]));

/** Five components, five slots. Slot i accepts only the i-th component of the arc. */
function ArcBuilder({ session, placed, setPlaced }) {
  const [picked, setPicked] = useState(null);
  // Fixed number of flashes: one per component tag and one per slot
  const tagFlashes = [useFlash(), useFlash(), useFlash(), useFlash(), useFlash()];
  const slotFlashes = [useFlash(), useFlash(), useFlash(), useFlash(), useFlash()];
  const flashOfTag = (id) => tagFlashes[arc.presented.indexOf(id)];

  const drop = (id, slotKey) => {
    const i = Number(slotKey.split('-')[1]);
    const ok = arc.components[i].id === id && !placed[i];
    session.report(ok, ok ? slotFlashes[i] : flashOfTag(id));
    if (ok) setPlaced((p) => ({ ...p, [i]: id }));
    setPicked(null);
  };

  const remaining = arc.presented.filter((id) => !Object.values(placed).includes(id));
  return (
    <div className="flex flex-col gap-5">
      {remaining.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text--1 text-ink-soft">{t('game.pickHelp')}</p>
          <div role="group" aria-label={T.componentsLabel} className="flex flex-wrap gap-2">
            {remaining.map((id) => (
              <DragTag key={id} id={id} label={byId[id].label} tone="methylene" picked={picked === id} onPick={setPicked} onDrop={drop} flash={flashOfTag(id)} className="font-sans text-0" />
            ))}
          </div>
          <p className="sr-only" aria-live="polite">
            {picked ? t('game.picked', { label: byId[picked].label }) : ''}
          </p>
        </div>
      )}

      <ol className="grid gap-2">
        {arc.components.map((component, i) => {
          const id = placed[i];
          return (
            <li key={component.id} className="flex items-center gap-3">
              <span className="text-label w-16 shrink-0 text-ink-soft">{T.slot.replace('{n}', i + 1)}</span>
              <DropSlot id={`slot-${i}`} pickedId={picked} onDrop={drop} filled={id} flash={slotFlashes[i]} label={T.slot.replace('{n}', i + 1)} className="min-h-16 flex-1">
                {id && (
                  <span className="flex flex-col gap-1 text-left">
                    <span className="font-medium">{byId[id].label}</span>
                    <span className="text--2 leading-snug text-ink-soft">{byId[id].detail}</span>
                  </span>
                )}
              </DropSlot>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/** Arcul reflex: order the five components, then classify a conditioned reflex and justify it. */
export default function ReflexArc({ topic }) {
  const session = useGameSession(topic);
  const [placed, setPlaced] = useState({});
  const [typeOk, setTypeOk] = useState(false);
  const [reasonOk, setReasonOk] = useState(false);
  const reported = useRef(false);
  const arcDone = Object.keys(placed).length === arc.components.length;

  useEffect(() => {
    if (arcDone && typeOk && reasonOk && !reported.current) {
      reported.current = true;
      session.complete();
    }
  }, [arcDone, typeOk, reasonOk, session]);

  const hint = !arcDone ? T.hints.arc : !typeOk ? T.hints.type : !reasonOk ? T.hints.reason : null;

  return (
    <InteractiveFrame topic={topic} title={copy.title} intro={copy.intro} session={session}>
      <p className="font-medium">{arc.scenario}</p>
      <ArcBuilder session={session} placed={placed} setPlaced={setPlaced} />

      {arcDone && (
        <motion.div className="flex flex-col gap-5" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={springSettle}>
          <p className="text-label text-methylene-deep">{T.arcDone}</p>
          <p className="font-medium">{classify.scenario}</p>
          <ChoiceQuestion name="type" prompt={classify.typePrompt} options={classify.types} answer={classify.typeAnswer} session={session} solved={typeOk} onSolved={() => setTypeOk(true)} />
          {typeOk && (
            <ChoiceQuestion name="reason" prompt={classify.whyPrompt} options={classify.reasons} answer={classify.reasonAnswer} session={session} solved={reasonOk} onSolved={() => setReasonOk(true)} />
          )}
        </motion.div>
      )}
      {hint && <HintBox hint={hint} session={session} />}
    </InteractiveFrame>
  );
}
