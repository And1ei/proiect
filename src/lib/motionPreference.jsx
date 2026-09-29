import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { MotionConfig } from 'motion/react';
import { useMediaQuery } from './useMediaQuery';

const STORAGE_KEY = 'se:simulate-reduced-motion';

const MotionPreference = createContext({ reduced: false, fromSystem: false, simulated: false, setSimulated: () => {} });

function readSimulated() {
  if (!import.meta.env.DEV) return false;
  try {
    return sessionStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

/**
 * Single source of truth for reduced motion: the OS setting OR the dev-only simulation.
 * Drives Motion (via MotionConfig), CSS (via html[data-reduce-motion]) and our own loops.
 */
export function MotionPreferenceProvider({ children }) {
  const fromSystem = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [simulated, setSimulatedState] = useState(readSimulated);
  const reduced = fromSystem || simulated;

  useEffect(() => {
    document.documentElement.toggleAttribute('data-reduce-motion', reduced);
  }, [reduced]);

  const value = useMemo(
    () => ({
      reduced,
      fromSystem,
      simulated,
      setSimulated: (on) => {
        setSimulatedState(on);
        try {
          sessionStorage.setItem(STORAGE_KEY, on ? '1' : '0');
        } catch {
          // Storage can be blocked; the toggle still works for this page view
        }
      },
    }),
    [reduced, fromSystem, simulated],
  );

  return (
    <MotionPreference.Provider value={value}>
      {/* "always"/"never" rather than "user": Motion's own OS check can't see the simulation */}
      <MotionConfig reducedMotion={reduced ? 'always' : 'never'}>{children}</MotionConfig>
    </MotionPreference.Provider>
  );
}

export const useMotionPreference = () => useContext(MotionPreference);

/** Use this instead of Motion's useReducedMotion everywhere in the app. */
export const useReducedMotion = () => useContext(MotionPreference).reduced;
