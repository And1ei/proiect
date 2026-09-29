import { useCallback, useState } from 'react';

/** Consecutive correct answers in this session. Not persisted; a miss quietly resets it. */
export function useStreak() {
  const [value, setValue] = useState(0);
  const hit = useCallback(() => setValue((v) => v + 1), []);
  const miss = useCallback(() => setValue(0), []);
  return { value, hit, miss };
}
