import { useState } from 'react';

/** Progress through each circuit: how many steps are traced, which circuits are complete. */
export function useHeartTracer(circuits) {
  const keys = Object.keys(circuits);
  const [active, setActive] = useState(keys[0]);
  const [progress, setProgress] = useState(() => Object.fromEntries(keys.map((k) => [k, 0])));
  const [done, setDone] = useState([]);

  const steps = circuits[active].steps;
  const index = progress[active];

  return {
    keys,
    active,
    setActive,
    steps,
    index,
    done,
    complete: index >= steps.length,
    lit: steps.slice(0, index).map((s) => s.part),
    expected: steps[index]?.part ?? null,

    /** Returns true if `part` is the next structure in the active circuit. */
    activate(part) {
      if (index >= steps.length || part !== steps[index].part) return false;
      const next = index + 1;
      setProgress((p) => ({ ...p, [active]: next }));
      if (next === steps.length) setDone((d) => (d.includes(active) ? d : [...d, active]));
      return true;
    },
  };
}

/** Polyline "d" for the route from step `from` to step `to` (inclusive), joining each step's points. */
export function routePath(steps, from, to) {
  const points = steps.slice(from, to + 1).flatMap((s) => s.route);
  return points.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join(' ');
}
