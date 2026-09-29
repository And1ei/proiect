import { useEffect, useRef, useState } from 'react';
import { useMotionValue, useSpring } from 'motion/react';
import { useReducedMotion } from '../../../lib/motionPreference';

const MAX_SAMPLES = 260;

/**
 * Lung volume model. `target` is where the breath is heading (ml); `volume` is a slow spring
 * following it (the chest takes time to move). Samples of the moving volume feed the graph.
 * A cycle counts when the volume goes above the resting level and comes back down to it.
 */
export function useBreathing({ VR, VER, VT, VIR }) {
  const levels = { RV: VR, FRC: VR + VER, EIV: VR + VER + VT, TLC: VR + VER + VT + VIR };
  const reduce = useReducedMotion();
  const [target, setTargetState] = useState(levels.FRC);
  const [cycles, setCycles] = useState(0);
  const [direction, setDirection] = useState(null);
  const [samples, setSamples] = useState(() => [levels.FRC, levels.FRC]);
  const wentAbove = useRef(false);

  const raw = useMotionValue(levels.FRC);
  const volume = useSpring(raw, { stiffness: 22, damping: 12, mass: 1 });

  // Record the moving volume for the graph (a sample roughly every animation frame it changes)
  useEffect(
    () =>
      volume.on('change', (v) => {
        setSamples((s) => (s.length >= MAX_SAMPLES ? [...s.slice(1), v] : [...s, v]));
      }),
    [volume],
  );

  const setTarget = (ml) => {
    const next = Math.min(levels.TLC, Math.max(levels.RV, ml));
    if (next > levels.FRC) wentAbove.current = true;
    if (next <= levels.FRC && wentAbove.current) {
      wentAbove.current = false;
      setCycles((c) => c + 1);
    }
    if (next !== target) setDirection(next > target ? 'in' : 'out');
    setTargetState(next);
    if (reduce) {
      // No slow breath: jump there, but still draw the step on the graph
      volume.jump(next);
      raw.set(next);
      setSamples((s) => [...s, next].slice(-MAX_SAMPLES));
    } else raw.set(next);
  };

  return {
    levels,
    target,
    volume,
    samples,
    cycles,
    setTarget,
    // A resting breath first; pressed again at the resting end point, it becomes forced
    inspire: () => setTarget(target < levels.EIV ? levels.EIV : levels.TLC),
    expire: () => setTarget(target > levels.FRC ? levels.FRC : levels.RV),
    direction,
  };
}
