import { useId } from 'react';
import { cx } from '../../lib/cx';

const LETTERS = ['a', 'b', 'c', 'd', 'e', 'f'];

/**
 * Radio group built on native inputs, so arrow keys, Space and screen readers work as usual.
 * `reveal` marks the correct option (and the wrong pick) once the answer has been checked.
 */
export default function ChoiceGroup({ legend, options, value, onChange, disabled, reveal, lettered = false, inline = false }) {
  const name = useId();
  return (
    <fieldset className="flex flex-col gap-3" disabled={disabled}>
      <legend className="mb-3 font-medium">{legend}</legend>
      <div className={cx('gap-2', inline ? 'flex flex-wrap' : 'flex flex-col')}>
        {options.map((option, i) => {
          const selected = value === i;
          const isAnswer = reveal && reveal.answer === i;
          const isWrongPick = reveal && selected && reveal.answer !== i;
          return (
            <label key={option} className={cx('relative block', !disabled && 'cursor-pointer')}>
              <input
                type="radio"
                name={name}
                value={i}
                checked={selected}
                onChange={() => onChange(i)}
                className="peer absolute inset-0 appearance-none opacity-0"
              />
              <span
                className={cx(
                  'flex items-baseline gap-3 rounded-well px-4 py-3 shadow-well',
                  'peer-focus-visible:outline peer-focus-visible:outline-[2.5px] peer-focus-visible:outline-offset-[3px] peer-focus-visible:outline-methylene-deep',
                  selected ? 'bg-eosin-100 ring-2 ring-eosin' : 'bg-paper-bright hover:bg-paper-deep',
                  isAnswer && 'bg-methylene-100 ring-2 ring-methylene-deep',
                  isWrongPick && 'bg-eosin-100 ring-2 ring-eosin-deep',
                )}
              >
                {lettered && (
                  <span className="text-label shrink-0 text-ink-soft">
                    {LETTERS[i]})<span className="sr-only"> </span>
                  </span>
                )}
                <span>{option}</span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
