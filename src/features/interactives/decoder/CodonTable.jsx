import { cx } from '../../../lib/cx';
import { GENETIC_CODE, RNA_BASES, STOP, THREE_LETTER } from '../../../content/data/geneticCode';

/**
 * The standard genetic code as a 4 × 4 table (rows: first base, columns: second base; each cell
 * lists the four codons by third base). The row and column of the current codon are tinted.
 */
export default function CodonTable({ codon, text, stopLabel }) {
  const [first, second] = codon ? [...codon] : [];
  return (
    <div className="overflow-x-auto rounded-well bg-paper p-2 shadow-well">
      <table className="w-full min-w-[30rem] border-separate border-spacing-1 text-center font-mono text--2">
        <caption className="text-label pb-2 text-left text-ink-soft">{text.tableCaption}</caption>
        <thead>
          <tr>
            <th scope="col" className="text-label p-1 text-ink-soft">
              <span className="sr-only">
                {text.firstBase} / {text.secondBase}
              </span>
            </th>
            {RNA_BASES.map((b) => (
              <th key={b} scope="col" className={cx('rounded-tag p-1 text-0', b === second && 'bg-methylene-100')}>
                {b}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {RNA_BASES.map((b1) => (
            <tr key={b1}>
              <th scope="row" className={cx('rounded-tag p-1 text-0', b1 === first && 'bg-eosin-100')}>
                {b1}
              </th>
              {RNA_BASES.map((b2) => (
                <td key={b2} className={cx('rounded-tag p-1 align-top', (b1 === first || b2 === second) && 'bg-paper-deep', b1 === first && b2 === second && '!bg-iodine-100')}>
                  <ul className="flex flex-col gap-0.5">
                    {RNA_BASES.map((b3) => {
                      const c = b1 + b2 + b3;
                      const aa = GENETIC_CODE[c];
                      return (
                        <li key={c} className="flex justify-between gap-2 whitespace-nowrap">
                          <span>{c}</span>
                          <span className={aa === STOP ? 'text-eosin-deep' : 'text-ink-soft'}>{aa === STOP ? stopLabel : THREE_LETTER[aa]}</span>
                        </li>
                      );
                    })}
                  </ul>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
