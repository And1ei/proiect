import { formatNumber, locale } from '../../../lib/i18n';

// Volume–time graph, 480 × 250. Horizontal bands separate VR, VER, VT and VIR; a bracket on the
// right spans the vital capacity. In matching mode the bands and the bracket become buttons.

const W = 480;
const H = 250;
const PLOT = { left: 34, right: 420, top: 10, bottom: 240 };
const MAX_ML = 6000;
const y = (ml) => PLOT.bottom - (ml / MAX_ML) * (PLOT.bottom - PLOT.top);
const fill = (s, vars) => s.replace(/\{(\w+)\}/g, (m, k) => vars[k] ?? m);

const TINT = { VR: 'var(--paper-shade)', VER: 'var(--methylene-50)', VT: 'var(--eosin-100)', VIR: 'var(--iodine-100)' };

export default function Spirogram({ samples, maxSamples, levels, bands, matched, matching, onPick, text }) {
  const spans = {
    VR: [0, levels.RV],
    VER: [levels.RV, levels.FRC],
    VT: [levels.FRC, levels.EIV],
    VIR: [levels.EIV, levels.TLC],
  };
  const step = (PLOT.right - PLOT.left) / (maxSamples - 1);
  const trace = samples.map((v, i) => `${i ? 'L' : 'M'}${(PLOT.left + i * step).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
  const ml = (n) => formatNumber(n);

  const interactive = (key, [from, to], label) =>
    matching && !matched.includes(key)
      ? {
          role: 'button',
          tabIndex: 0,
          'aria-label': fill(label, { from: ml(from), to: ml(to) }),
          className: 'band cursor-pointer',
          onClick: (e) => onPick(key, e.currentTarget),
          onKeyDown: (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onPick(key, e.currentTarget);
            }
          },
        }
      : { 'aria-hidden': true };

  const tag = (key) => (key === 'VR' || matched.includes(key) ? bands[key] : null);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-label={text.graphTitle} className="block h-auto w-full">
      <desc>{text.graphDesc}</desc>
      {Object.entries(spans).map(([key, [from, to]]) => (
        <g key={key}>
          <rect x={PLOT.left} y={y(to)} width={PLOT.right - PLOT.left} height={y(from) - y(to)} fill={TINT[key]} stroke="var(--ink-faint)" strokeWidth="0.8" {...(key !== 'VR' ? interactive(key, [from, to], text.bandLabel) : { 'aria-hidden': true })} />
          {tag(key) && (
            <text x={PLOT.left + 8} y={(y(from) + y(to)) / 2 + 4} fontFamily="var(--font-mono)" fontSize="11" letterSpacing="0.06em" fill="var(--ink)" pointerEvents="none" aria-hidden="true">
              {`${tag(key).short} · ${tag(key).note}`.toLocaleUpperCase(locale)}
            </text>
          )}
        </g>
      ))}

      {/* Vital capacity bracket */}
      <g {...interactive('CV', [levels.RV, levels.TLC], text.bracketLabel)}>
        <rect x={PLOT.right + 8} y={y(levels.TLC)} width="40" height={y(levels.RV) - y(levels.TLC)} fill="transparent" />
        <path
          d={`M${PLOT.right + 14} ${y(levels.TLC)} C ${PLOT.right + 24} ${y(levels.TLC)}, ${PLOT.right + 22} ${y((levels.TLC + levels.RV) / 2) - 10}, ${PLOT.right + 30} ${y((levels.TLC + levels.RV) / 2)} C ${PLOT.right + 22} ${y((levels.TLC + levels.RV) / 2) + 10}, ${PLOT.right + 24} ${y(levels.RV)}, ${PLOT.right + 14} ${y(levels.RV)}`}
          fill="none"
          stroke="var(--ink)"
          strokeWidth="1.6"
          className="bracket"
        />
        {tag('CV') && (
          <text x={PLOT.right + 34} y={y((levels.TLC + levels.RV) / 2) + 4} fontFamily="var(--font-mono)" fontSize="11" fill="var(--ink)" aria-hidden="true">
            CV
          </text>
        )}
      </g>

      {/* Axis */}
      <path d={`M${PLOT.left} ${PLOT.top} L${PLOT.left} ${PLOT.bottom} L${PLOT.right} ${PLOT.bottom}`} fill="none" stroke="var(--ink)" strokeWidth="1.2" aria-hidden="true" />
      {[0, 2000, 4000, 6000].map((v) => (
        <text key={v} x={PLOT.left - 6} y={y(v) + 4} textAnchor="end" fontFamily="var(--font-mono)" fontSize="10" fill="var(--ink-soft)" aria-hidden="true">
          {v / 1000}L
        </text>
      ))}

      <path d={trace} fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinejoin="round" aria-hidden="true" />
    </svg>
  );
}
