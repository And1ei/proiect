import { useEffect, useId, useRef, useState } from 'react';
import { cx } from '../../../lib/cx';
import { t } from '../../../lib/i18n';
import BlobButton from '../../../components/primitives/BlobButton';
import InteractiveFrame from '../../gamefeel/InteractiveFrame';
import HintBox from '../../gamefeel/HintBox';
import FeedbackFlash from '../../gamefeel/FeedbackFlash';
import { useGameSession } from '../../gamefeel/useGameSession';
import copy from '../../../content/ro/interactives/decoder';
import { RNA_BASES, STOP, THREE_LETTER } from '../../../content/data/geneticCode';
import { useDecoder } from './useDecoder';
import CodonTable from './CodonTable';

const fill = (s, vars) => s.replace(/\{(\w+)\}/g, (m, k) => vars[k] ?? m);
const T = copy.text;
// Amino acids sorted by Romanian name, then the stop option
const AA_OPTIONS = [
  ...Object.entries(copy.aminoAcids)
    .sort((a, b) => a[1].localeCompare(b[1], 'ro'))
    .map(([code, name]) => ({ code, label: `${name} (${THREE_LETTER[code]})` })),
  { code: STOP, label: T.stop },
];
const nameOf = (code) => (code === STOP ? 'stop' : THREE_LETTER[code]);

/** Flash for the element whose index was just judged (the hook records { index, kind, id }). */
const flashFor = (event, index) => (event && event.index === index ? { signal: event } : null);

function Strand({ label, ends, bases, total, current, event, group }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-label text-ink-soft">{label}</span>
      <div className="flex items-center gap-1">
        <span className="font-mono text--2 text-ink-soft">{ends[0]}</span>
        {Array.from({ length: total }, (_, i) => (
          <FeedbackFlash
            key={i}
            flash={group ? flashFor(event, i) : null}
            className={cx(
              'flex size-9 items-center justify-center rounded-tag font-mono text-1 shadow-well sm:size-10',
              i % 3 === 0 && i > 0 && 'ml-2',
              bases[i] ? (group ? 'bg-methylene-50' : 'bg-paper-deep') : 'border-2 border-dashed border-ink-faint',
              group && i === current && 'ring-2 ring-eosin',
            )}
          >
            {bases[i] ?? ''}
          </FeedbackFlash>
        ))}
        <span className="font-mono text--2 text-ink-soft">{ends[1]}</span>
      </div>
    </div>
  );
}

function MrnaBuilder({ dec, session }) {
  const place = (base) => session.report(dec.placeBase(base));
  const onKeyDown = (e) => {
    const base = e.key.toUpperCase();
    if (RNA_BASES.includes(base)) {
      e.preventDefault();
      place(base);
    }
  };
  return (
    <div className="flex flex-col gap-4" onKeyDown={onKeyDown}>
      <p className="text--1">{T.mrnaStep}</p>
      <div role="group" aria-label={T.basesLabel} className="flex gap-2">
        {RNA_BASES.map((b) => (
          <button key={b} type="button" onClick={() => place(b)} className="min-h-11 min-w-12 rounded-btn-c bg-paper px-4 font-mono text-1 shadow-rest hover:bg-eosin-50">
            {b}
          </button>
        ))}
      </div>
      <p className="sr-only" aria-live="polite">
        {fill(T.slotLabel, { n: dec.mrna.length + 1 })}
      </p>
    </div>
  );
}

function CodonDecode({ dec, session }) {
  const [choice, setChoice] = useState('');
  const selectId = useId();
  const select = useRef(null);
  const codon = dec.currentCodon;

  useEffect(() => {
    setChoice('');
  }, [dec.decoded.length]);

  // The base buttons just disappeared; don't leave keyboard focus on the page body
  useEffect(() => {
    select.current?.focus();
  }, []);

  const check = (e) => {
    e.preventDefault();
    if (!choice) return;
    session.report(dec.decode(choice));
    select.current?.focus();
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text--1">{T.decodeStep}</p>
      <ol aria-label={T.codonsLabel} className="flex flex-wrap gap-2">
        {dec.codons.map((c, i) => (
          <FeedbackFlash key={c + i} as="li" flash={flashFor(dec.event, i)} className={cx('flex flex-col items-center rounded-well px-3 py-2 shadow-well', i === dec.decoded.length ? 'bg-iodine-100 ring-2 ring-iodine' : 'bg-paper')}>
            <span className="font-mono text-1">{c}</span>
            <span className="text-label text-ink-soft">{dec.decoded[i] ? nameOf(dec.decoded[i]) : '·'}</span>
          </FeedbackFlash>
        ))}
      </ol>
      <form onSubmit={check} className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor={selectId} className="text--1 font-medium">
            {fill(T.chooseLabel, { codon })}
          </label>
          <select id={selectId} ref={select} value={choice} onChange={(e) => setChoice(e.target.value)} className="rounded-well bg-paper px-3 py-2 shadow-well">
            <option value="">{T.choosePlaceholder}</option>
            {AA_OPTIONS.map((o) => (
              <option key={o.code} value={o.code}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <BlobButton type="submit" size="sm" disabled={!choice}>
          {t('game.check')}
        </BlobButton>
      </form>
      <CodonTable codon={codon} text={T} stopLabel="Stop" />
    </div>
  );
}

/** Decodorul ADN: template strand → mRNA → amino acid chain, with the standard genetic code. */
export default function DnaDecoder({ topic }) {
  const session = useGameSession(topic);
  const dec = useDecoder(copy.template);
  const reported = useRef(false);

  useEffect(() => {
    if (dec.phase === 'done' && !reported.current) {
      reported.current = true;
      session.complete();
    }
  }, [dec.phase, session]);

  const codon = dec.currentCodon ?? '';
  const hint =
    dec.phase === 'mrna' ? T.hints.mrna : dec.phase === 'decode' ? fill(T.hints.decode, { codon, first: codon[0], second: codon[1] }) : null;
  const chain = dec.decoded.filter((c) => c !== STOP).map(nameOf).join('-');
  const stopCodon = dec.decoded.at(-1) === STOP ? dec.codons[dec.decoded.length - 1] : null;

  return (
    <InteractiveFrame topic={topic} title={copy.title} intro={copy.intro} session={session}>
      <div className="flex flex-col gap-3 overflow-x-auto pb-2">
        <Strand label={T.templateLabel} ends={['3′', '5′']} bases={[...copy.template]} total={copy.template.length} />
        <Strand label={T.mrnaLabel} ends={['5′', '3′']} bases={dec.mrna} total={dec.expected.length} current={dec.phase === 'mrna' ? dec.mrna.length : -1} event={dec.phase === 'mrna' ? dec.event : null} group />
      </div>

      {dec.phase === 'mrna' && <MrnaBuilder dec={dec} session={session} />}
      {dec.phase === 'decode' && <CodonDecode dec={dec} session={session} />}
      {dec.phase === 'done' && (
        <div className="flex flex-col gap-2 rounded-well bg-methylene-50 p-4">
          <p className="font-medium">{stopCodon ? fill(T.result, { chain, stop: stopCodon }) : fill(T.resultNoStop, { chain })}</p>
          <p className="text--1 text-ink-soft">{T.note}</p>
        </div>
      )}
      {hint && <HintBox hint={hint} session={session} />}
    </InteractiveFrame>
  );
}
