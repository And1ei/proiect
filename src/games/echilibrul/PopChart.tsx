// Population chart, own lightweight SVG: one line per species (different dash patterns and end
// labels, not colour alone), the safe band shaded, events marked on the time axis.
import { memo, useEffect, useRef, useState } from 'react';
import { formatNumber } from '../../lib/i18n';
import type { ScenarioText } from '../../content/ro/ecosystem-species';
import { SAFE_BAND } from './ecosystemModel';
import { YEARS } from './scenarios';
import type { GameEvent } from './engine';
import { VIEW } from './view';

const H = 200;
const YMAX = 2.6;
/** Below this width the species labels move out of the plot into an HTML legend. */
const NARROW = 480;

interface Props {
  scenario: ScenarioText;
  history: { t: number; x: number[] }[];
  events: GameEvent[];
  extinct: boolean[];
}

function PopChart({ scenario, history, events, extinct }: Props) {
  const view = VIEW[scenario.id];
  // Drawn 1:1 in CSS pixels, so the text stays readable on a phone instead of shrinking with a viewBox
  const box = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(640);
  useEffect(() => {
    const el = box.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(() => setW(Math.max(260, Math.round(el.clientWidth))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const narrow = W < NARROW;
  const PAD = { l: 32, r: narrow ? 10 : 124, t: 12, b: 26 };
  const px = (t: number) => PAD.l + (t / YEARS) * (W - PAD.l - PAD.r);
  const py = (x: number) => PAD.t + (1 - Math.min(x, YMAX) / YMAX) * (H - PAD.t - PAD.b);
  const last = history[history.length - 1];
  // End labels, pushed apart so they never overlap
  const labels = scenario.species
    .map((s, i) => ({ i, name: s.name, y: py(last.x[i]) }))
    .sort((a, b) => a.y - b.y);
  for (let k = 1; k < labels.length; k += 1) labels[k].y = Math.max(labels[k].y, labels[k - 1].y + 12);
  // Thin the history for long runs (the chart never needs more than ~300 points per line)
  const stride = Math.max(1, Math.ceil(history.length / 300));
  const pts = history.filter((_, k) => k % stride === 0 || k === history.length - 1);

  return (
    <div ref={box} className="w-full">
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="block h-auto w-full" aria-hidden="true">
      <rect x={PAD.l} y={py(SAFE_BAND[1])} width={W - PAD.l - PAD.r} height={py(SAFE_BAND[0]) - py(SAFE_BAND[1])} fill="var(--methylene-50)" />
      {events
        .filter((e) => e.phase === 'active' || e.phase === 'over')
        .map((e) => (
          <g key={e.n}>
            <rect x={px(e.at)} y={PAD.t} width={Math.max(2, px(e.at + e.lasts) - px(e.at))} height={H - PAD.t - PAD.b} fill="var(--iodine-100)" opacity="0.7" />
            <path d={`M${px(e.at)} ${H - PAD.b} l5 8 h-10 Z`} fill="var(--iodine-deep)" />
            <text x={px(e.at)} y={H - 2} textAnchor="middle" fontSize="9" className="fill-iodine-deep font-mono">
              {e.n + 1}
            </text>
          </g>
        ))}
      {/* axes */}
      <line x1={PAD.l} y1={H - PAD.b} x2={W - PAD.r} y2={H - PAD.b} stroke="var(--ink-faint)" />
      {Array.from({ length: YEARS + 1 }, (_, y) => (
        <text key={y} x={px(y)} y={H - PAD.b + 12} textAnchor="middle" fontSize="9" className="fill-ink-soft font-mono">
          {y}
        </text>
      ))}
      {[0, 1, 2].map((v) => (
        <g key={v}>
          <line x1={PAD.l - 4} y1={py(v)} x2={W - PAD.r} y2={py(v)} stroke="var(--ink-faint)" strokeWidth="0.6" opacity={v === 1 ? 0.8 : 0.35} />
          <text x={PAD.l - 7} y={py(v) + 3} textAnchor="end" fontSize="9" className="fill-ink-soft font-mono">
            {formatNumber(v)}×
          </text>
        </g>
      ))}
      {scenario.species.map((s, i) => {
        const v = view.species[s.id];
        const d = pts.map((h, k) => `${k ? 'L' : 'M'}${px(h.t).toFixed(1)} ${py(h.x[i]).toFixed(1)}`).join(' ');
        return <path key={s.id} d={d} fill="none" stroke={`var(--${v.tone})`} strokeWidth="2.4" strokeDasharray={v.dash || undefined} strokeLinejoin="round" strokeLinecap="round" />;
      })}
      {!narrow && labels.map(({ i, name, y }) => {
        const v = view.species[scenario.species[i].id];
        const x0 = W - PAD.r + 8;
        return (
          <g key={i}>
            <line x1={x0} y1={y - 3} x2={x0 + 16} y2={y - 3} stroke={`var(--${v.tone})`} strokeWidth="2.4" strokeLinecap="round" strokeDasharray={v.dash || undefined} />
            <text x={x0 + 20} y={y} fontSize="10" className="fill-ink font-body" textDecoration={extinct[i] ? 'line-through' : undefined}>
              {name}
            </text>
          </g>
        );
      })}
    </svg>
      {narrow && (
        <ul aria-hidden="true" className="flex flex-wrap gap-x-4 gap-y-1 px-1 pt-1 text--2">
          {scenario.species.map((sp, i) => (
            <li key={sp.id} className={extinct[i] ? 'line-through' : undefined}>
              <svg width="18" height="6" className="mr-1.5 inline-block align-middle">
                <line x1="1" y1="3" x2="17" y2="3" stroke={`var(--${view.species[sp.id].tone})`} strokeWidth="2.4" strokeLinecap="round" strokeDasharray={view.species[sp.id].dash || undefined} />
              </svg>
              {sp.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default memo(PopChart);
