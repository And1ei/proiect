import { useState } from 'react';
import { t } from '../../../lib/i18n';
import { useFlash } from '../../gamefeel/FeedbackFlash';
import { DragTag, DropSlot } from '../shared/PickPlace';
import PunnettCell from './PunnettCell';
import { genotypesFor } from './genetics';
import copy from '../../../content/ro/interactives/punnett';

const fill = (s, vars) => s.replace(/\{(\w+)\}/g, (m, k) => vars[k] ?? m);

function HeaderSlot({ id, cross, picked, onDrop, flash, label }) {
  const allele = cross.alleleIn(id);
  return (
    <DropSlot id={id} pickedId={picked} onDrop={onDrop} filled={allele} flash={flash} label={label} className="size-full">
      {allele && <span className="font-mono text-2">{allele}</span>}
    </DropSlot>
  );
}

/** Allele tags + the 2 × 2 careu with droppable headers and fillable cells. */
export default function PunnettGrid({ cross, session, letter }) {
  const [picked, setPicked] = useState(null);
  // One flash per tag and per header (fixed count, so hooks stay in order)
  const flashes = {
    'p1-0': useFlash(), 'p1-1': useFlash(), 'p2-0': useFlash(), 'p2-1': useFlash(),
    c0: useFlash(), c1: useFlash(), r0: useFlash(), r1: useFlash(),
  };

  const drop = (tagId, slot) => {
    const ok = cross.drop(tagId, slot);
    session.report(ok, flashes[ok ? slot : tagId]);
    setPicked(null);
  };

  const headersDone = cross.phase !== 'headers';
  const options = genotypesFor(letter);
  const pickedTag = cross.tags.find((tag) => tag.id === picked);

  return (
    <div className="flex flex-col gap-5">
      {!headersDone && (
        <div className="flex flex-col gap-3">
          <p className="text--1 text-ink-soft">{t('game.pickHelp')}</p>
          <div className="flex flex-wrap gap-6">
            {[1, 2].map((n) => (
              <div key={n} className="flex flex-col gap-2">
                <span className="text--1 text-ink-soft">
                  <span className="text-label">{fill(copy.text.parent, { n })}:</span>{' '}
                  {/* Genotypes are case-sensitive: keep them out of the uppercase label style */}
                  <span className="font-mono text-ink">{n === 1 ? cross.parent1 : cross.parent2}</span>
                </span>
                <div className="flex gap-2">
                  {cross.tags
                    .filter((tag) => tag.parent === n && !cross.isPlaced(tag.id))
                    .map((tag) => (
                      <DragTag
                        key={tag.id}
                        id={tag.id}
                        label={tag.allele}
                        tone={n === 1 ? 'eosin' : 'methylene'}
                        picked={picked === tag.id}
                        onPick={setPicked}
                        onDrop={drop}
                        flash={flashes[tag.id]}
                      />
                    ))}
                </div>
              </div>
            ))}
          </div>
          <p className="sr-only" aria-live="polite">
            {pickedTag ? t('game.picked', { label: pickedTag.allele }) : ''}
          </p>
        </div>
      )}

      <div className="grid w-full max-w-[20rem] grid-cols-[3.5rem_1fr_1fr] grid-rows-[3.5rem_auto_auto] gap-2">
        <span className="text-label flex items-end justify-center pb-1 text-center text-[0.6rem] leading-tight text-ink-soft">
          {copy.text.corner}
        </span>
        {['c0', 'c1'].map((id) => (
          <HeaderSlot key={id} id={id} cross={cross} picked={picked} onDrop={drop} flash={flashes[id]} label={fill(copy.text.gametesOf, { n: 1 })} />
        ))}
        {[0, 1].map((r) => (
          <div key={r} className="contents">
            <HeaderSlot id={`r${r}`} cross={cross} picked={picked} onDrop={drop} flash={flashes[`r${r}`]} label={fill(copy.text.gametesOf, { n: 2 })} />
            {[0, 1].map((c) => (
              <PunnettCell
                key={c}
                value={cross.cells[`${r}-${c}`]}
                options={options}
                disabled={!headersDone}
                alignEnd={c === 1}
                session={session}
                onPick={(g) => cross.fill(r, c, g)}
                labels={{
                  empty: fill(copy.text.cellEmpty, { r: r + 1, c: c + 1 }),
                  filled: fill(copy.text.cellFilled, { r: r + 1, c: c + 1, g: cross.cells[`${r}-${c}`] }),
                  choose: copy.text.chooseGenotype,
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
