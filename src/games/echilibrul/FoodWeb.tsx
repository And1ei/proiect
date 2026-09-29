// Live food web: nodes sized by population (springs), arrows in the direction the food goes (from
// the eaten to the eater). A species in danger gets a dashed ring and a "risc" tag; an extinct one is
// crossed out with "dispărut", so the state never depends on colour alone.
import { memo } from 'react';
import { motion } from 'motion/react';
import { getAsset } from '../../assets/urls';
import { ECO } from '../../content/ro/games/echilibrul';
import type { ScenarioText } from '../../content/ro/ecosystem-species';
import { DANGER_BELOW, SAFE_BAND } from './ecosystemModel';
import { VIEW } from './view';
import { SilhouetteFilters } from './ScenePlate';

const W = 320;
const H = 280;
const radius = (x: number) => 15 + 11 * Math.sqrt(Math.min(Math.max(x, 0), 3));

interface Props {
  scenario: ScenarioText;
  x: number[];
  extinct: boolean[];
  selected: number | null;
  reduced: boolean;
}

function FoodWeb({ scenario, x, extinct, selected, reduced }: Props) {
  const view = VIEW[scenario.id];
  const pos = (id: string) => ({ x: view.species[id].node.x * W, y: 34 + view.species[id].node.y * (H - 70) });
  const index = (id: string) => scenario.species.findIndex((s) => s.id === id);
  const spring = reduced ? { duration: 0 } : { type: 'spring' as const, stiffness: 140, damping: 16 };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" aria-hidden="true">
      <defs>
        <SilhouetteFilters prefix="web" />
        <marker id="web-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 1 L9 5 L0 9 Z" fill="var(--ink-soft)" />
        </marker>
      </defs>
      {/* edges: prey → predator */}
      {scenario.species.flatMap((pred) =>
        pred.eats.map((preyId) => {
          const a = pos(preyId);
          const b = pos(pred.id);
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const len = Math.hypot(dx, dy) || 1;
          const ra = radius(x[index(preyId)]) + 3;
          const rb = radius(x[index(pred.id)]) + 6;
          const gone = extinct[index(preyId)] || extinct[index(pred.id)];
          return (
            <line
              key={`${preyId}-${pred.id}`}
              x1={a.x + (dx / len) * ra}
              y1={a.y + (dy / len) * ra}
              x2={b.x - (dx / len) * rb}
              y2={b.y - (dy / len) * rb}
              stroke="var(--ink-soft)"
              strokeWidth="1.6"
              strokeDasharray={gone ? '3 4' : undefined}
              opacity={gone ? 0.4 : 0.8}
              markerEnd="url(#web-arrow)"
            />
          );
        }),
      )}
      {scenario.species.map((s, i) => {
        const v = view.species[s.id];
        const c = pos(s.id);
        const r = radius(extinct[i] ? 0.4 : x[i]);
        const danger = !extinct[i] && (x[i] < SAFE_BAND[0] || x[i] > SAFE_BAND[1]);
        const critical = !extinct[i] && x[i] < DANGER_BELOW;
        const icon = r * 1.25;
        return (
          <g key={s.id} opacity={extinct[i] ? 0.55 : 1}>
            <motion.circle
              cx={c.x}
              cy={c.y}
              initial={false}
              animate={{ r }}
              transition={spring}
              fill="var(--paper-bright)"
              stroke={danger ? 'var(--eosin-deep)' : 'var(--ink-soft)'}
              strokeWidth={selected === i ? 3.2 : danger ? 2.4 : 1.4}
              strokeDasharray={danger ? '5 3' : undefined}
            />
            <image href={getAsset(s.sprite).url} x={c.x - icon / 2} y={c.y - icon / 2} width={icon} height={icon} filter={`url(#web-${v.tone})`} />
            {extinct[i] && (
              <path d={`M${c.x - r * 0.7} ${c.y - r * 0.7} L${c.x + r * 0.7} ${c.y + r * 0.7} M${c.x + r * 0.7} ${c.y - r * 0.7} L${c.x - r * 0.7} ${c.y + r * 0.7}`} stroke="var(--eosin-deep)" strokeWidth="2.4" strokeLinecap="round" />
            )}
            {/* top-row labels sit above their node, so the arrows coming up never cross them */}
            <text x={c.x} y={v.node.y < 0.3 ? c.y - r - 6 : c.y + r + 12} textAnchor="middle" className="fill-ink font-body" fontSize="11" fontWeight={selected === i ? 600 : 500}>
              {s.name}
            </text>
            {(critical || extinct[i]) && (
              <text x={c.x} y={c.y + r + 24} textAnchor="middle" className="fill-eosin-deep font-mono" fontSize="9.5" letterSpacing="0.06em">
                {(extinct[i] ? ECO.levels.disparut : ECO.danger).toUpperCase()}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export default memo(FoodWeb);
