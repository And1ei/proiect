import { locale } from '../../lib/i18n';

const LINE_HEIGHT = 17;

/**
 * Figure label with a leader line. (tx, ty) is the point on the drawing; (x, y) is where the
 * text starts (anchor "start") or ends (anchor "end"). `lines` is a string or string[].
 * The leader stops just short of the text so it never overprints it.
 */
export default function Annotation({ part, x, y, tx, ty, lines, anchor = 'start' }) {
  const rows = (Array.isArray(lines) ? lines : [lines]).map((l) => l.toLocaleUpperCase(locale));
  const gap = anchor === 'start' ? -6 : 6;
  const midY = y - 4 + ((rows.length - 1) * LINE_HEIGHT) / 2;

  return (
    <g data-annotation-for={part} aria-hidden="true">
      <path
        d={`M${tx} ${ty} L${x + gap} ${midY}`}
        fill="none"
        stroke="var(--ink)"
        strokeWidth="1"
        strokeDasharray="3 2"
        opacity="0.75"
      />
      <circle cx={tx} cy={ty} r="2.6" fill="var(--ink)" />
      <text
        x={x}
        y={y}
        textAnchor={anchor}
        fill="var(--ink)"
        fontFamily="var(--font-mono)"
        fontSize="13.5"
        letterSpacing="0.08em"
      >
        {rows.map((row, i) => (
          <tspan key={row} x={x} dy={i === 0 ? 0 : LINE_HEIGHT}>
            {row}
          </tspan>
        ))}
      </text>
    </g>
  );
}
