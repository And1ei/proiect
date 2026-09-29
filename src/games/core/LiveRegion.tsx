import { useCallback, useRef, useState } from 'react';

/**
 * Screen-reader announcements. `polite` for score/lives/streak, `assertive` for the end of a run.
 * Repeating the same text is still announced (a zero-width space toggles to force a change).
 */
export function useAnnouncer() {
  const [polite, setPolite] = useState('');
  const [assertive, setAssertive] = useState('');
  const flip = useRef(false);
  const announce = useCallback((text: string, urgent = false) => {
    flip.current = !flip.current;
    const value = flip.current ? text : `${text}​`;
    (urgent ? setAssertive : setPolite)(value);
  }, []);
  return { polite, assertive, announce };
}

export default function LiveRegion({ polite, assertive }: { polite: string; assertive: string }) {
  return (
    <>
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {polite}
      </div>
      <div aria-live="assertive" aria-atomic="true" className="sr-only">
        {assertive}
      </div>
    </>
  );
}
