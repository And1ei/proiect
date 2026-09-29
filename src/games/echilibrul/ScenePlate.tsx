// The ecosystem as a paper-cut specimen plate: layered procedural strips (forest canopy and ground,
// or reeds and water) whose colours drift with the seasons, and the species as manifest silhouettes,
// as many as the population. Colours come from the palette tokens only.
import { memo, useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { getAsset } from '../../assets/urls';
import { readPalette } from '../phaser/palette';
import type { ScenarioText } from '../../content/ro/ecosystem-species';
import { PLATE, VIEW, headcount, spot } from './view';

const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const mix = (a: string, b: string, t: number) => {
  const [x, y] = [rgb(a), rgb(b)];
  return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * Math.max(0, Math.min(1, t)))).join(' ')})`;
};

/** A scalloped strip edge: soft bumps along y, closed down to `bottom`. */
function strip(y: number, amp: number, bumps: number, seed: number, bottom: number) {
  const w = PLATE.width;
  const step = w / bumps;
  let d = `M0 ${bottom} L0 ${y}`;
  for (let i = 0; i < bumps; i += 1) {
    const k = Math.sin((i + 1) * 12.9898 * seed) * 43758.5453;
    const r = k - Math.floor(k);
    const x1 = i * step + step / 2;
    const x2 = (i + 1) * step;
    d += ` Q${x1.toFixed(1)} ${(y - amp * (0.55 + r * 0.9)).toFixed(1)} ${x2.toFixed(1)} ${(y + (r - 0.5) * amp * 0.3).toFixed(1)}`;
  }
  return `${d} L${w} ${bottom} Z`;
}

const TONES = ['ink', 'eosin', 'eosin-deep', 'methylene', 'methylene-deep', 'iodine', 'iodine-deep'] as const;

/** Tint + paper-cut shadow for mono silhouettes, one filter per tone (applied per species group). */
export function SilhouetteFilters({ prefix }: { prefix: string }) {
  return (
    <>
      {TONES.map((tone) => (
        <filter key={tone} id={`${prefix}-${tone}`} x="-10%" y="-10%" width="125%" height="130%" colorInterpolationFilters="sRGB">
          <feFlood style={{ floodColor: `var(--${tone})` }} result="c" />
          <feComposite in="c" in2="SourceAlpha" operator="in" result="t" />
          <feDropShadow in="t" dx="1.6" dy="2.2" stdDeviation="0" style={{ floodColor: 'var(--ink)', floodOpacity: 0.16 }} />
        </filter>
      ))}
    </>
  );
}

interface Props {
  scenario: ScenarioText;
  t: number;
  x: number[];
  extinct: boolean[];
  /** Producer bloom (eutrophication) and oxygen crisis tint the water. */
  bloom: number;
  crisis: boolean;
  selected: number | null;
  reduced: boolean;
}

function ScenePlate({ scenario, t, x, extinct, bloom, crisis, selected, reduced }: Props) {
  const view = VIEW[scenario.id];
  const p = useMemo(() => readPalette().hex, []);
  // continuous season phase 0..4 → colour
  const phase = (t - Math.floor(t)) * 4;
  const seasonal = (spring: string, summer: string, autumn: string, winter: string) => {
    const stops = [spring, summer, autumn, winter, spring];
    const i = Math.floor(phase);
    return mix(stops[i], stops[i + 1], phase - i);
  };
  const H = PLATE.height;
  const W = PLATE.width;

  const background =
    view.kind === 'forest' ? (
      <>
        <rect width={W} height={H} fill="url(#eco-sky)" />
        <path d={strip(128, 26, 9, 3.1, 230)} fill={seasonal(p['methylene-100'], p['methylene-100'], p['iodine-100'], p['paper-deep'])} />
        <path d={strip(156, 34, 12, 1.7, 240)} transform="translate(3 4)" fill="var(--ink)" opacity="0.1" />
        <path d={strip(156, 34, 12, 1.7, 240)} fill={seasonal(p['methylene-200'], p.methylene, p['iodine-200'], p['paper-shade'])} />
        <path d={strip(214, 8, 16, 5.3, H)} transform="translate(0 4)" fill="var(--ink)" opacity="0.1" />
        <path d={strip(214, 8, 16, 5.3, H)} fill={p['iodine-100']} />
        <path d={strip(300, 6, 20, 2.2, H)} fill={p['paper-deep']} />
        {Array.from({ length: 34 }, (_, i) => {
          const r = Math.abs(Math.sin(i * 91.7)) ;
          return (
            <ellipse
              key={i}
              cx={(i * 97.3) % W}
              cy={228 + ((i * 37.1) % 140)}
              rx={4 + r * 3}
              ry={2 + r}
              transform={`rotate(${(i * 47) % 180} ${(i * 97.3) % W} ${228 + ((i * 37.1) % 140)})`}
              fill={seasonal(p['iodine-200'], p['methylene-200'], p.iodine, p['paper-shade'])}
              opacity="0.55"
            />
          );
        })}
      </>
    ) : (
      <>
        <rect width={W} height={H} fill="url(#eco-sky)" />
        <path d={strip(128, 14, 10, 2.9, 170)} fill={p['methylene-100']} />
        <rect y="150" width={W} height={H - 150} fill="url(#eco-water)" />
        {bloom > 0 && <rect y="150" width={W} height={H - 150} fill={p['methylene-200']} opacity={Math.min(0.55, bloom * 0.35)} />}
        {crisis && <rect y="150" width={W} height={H - 150} fill={p['iodine-200']} opacity="0.45" />}
        {Array.from({ length: 7 }, (_, i) => (
          <path key={i} d={`M${40 + i * 110} ${190 + (i % 3) * 40} q 18 -5 36 0 t 36 0`} fill="none" stroke="var(--paper-bright)" strokeWidth="1.5" opacity="0.5" />
        ))}
        <path d={strip(350, 8, 18, 4.4, H)} transform="translate(0 -3)" fill="var(--ink)" opacity="0.1" />
        <path d={strip(350, 8, 18, 4.4, H)} fill={p['iodine-200']} />
        {/* reeds on both banks */}
        {Array.from({ length: 26 }, (_, i) => {
          const left = i < 13;
          const x0 = left ? 8 + i * 9 : W - 8 - (i - 13) * 9;
          const h = 70 + ((i * 29) % 45);
          const lean = ((i * 13) % 11) - 5;
          return (
            <path
              key={i}
              d={`M${x0} 160 q ${lean} ${-h / 2} ${lean * 2.2} ${-h}`}
              fill="none"
              stroke={seasonal(p['methylene-deep'], p.methylene, p.iodine, p['iodine-deep'])}
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.85"
            />
          );
        })}
        <path d={`M0 150 H${W}`} stroke="var(--paper-bright)" strokeWidth="2" opacity="0.8" />
      </>
    );

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-hidden="true">
      <defs>
        <linearGradient id="eco-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p['paper-bright']} />
          <stop offset="1" stopColor={p['methylene-50']} />
        </linearGradient>
        <linearGradient id="eco-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p['methylene-100']} />
          <stop offset="1" stopColor={p['methylene-200']} />
        </linearGradient>
        <SilhouetteFilters prefix="eco" />
      </defs>
      {background}
      {scenario.species.map((s, si) => {
        const v = view.species[s.id];
        const n = headcount(v, x[si], extinct[si]);
        const url = getAsset(s.sprite).url;
        return (
          <g key={s.id} filter={`url(#eco-${v.tone})`} opacity={selected === null || selected === si ? 1 : 0.55}>
            <AnimatePresence initial={false}>
              {Array.from({ length: n }, (_, i) => {
                const at = spot(v, si + 1, i);
                return (
                  <motion.g
                    key={i}
                    initial={reduced ? { opacity: 0 } : { scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={reduced ? { opacity: 0 } : { scale: 0, opacity: 0 }}
                    transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 220, damping: 18 }}
                    style={{ originX: `${at.x}px`, originY: `${at.y}px` }}
                  >
                    {/* the flip lives on a wrapper: the idle bob animates the image's own transform */}
                    <g transform={at.flip ? `translate(${at.x * 2} 0) scale(-1 1)` : undefined}>
                      <image
                        href={url}
                        x={at.x - v.size / 2}
                        y={at.y - v.size / 2}
                        width={v.size}
                        height={v.size}
                        className={reduced ? undefined : 'eco-bob'}
                        style={{ animationDelay: `${-at.phase * 4}s` }}
                      />
                    </g>
                  </motion.g>
                );
              })}
            </AnimatePresence>
          </g>
        );
      })}
    </svg>
  );
}

export default memo(ScenePlate);
