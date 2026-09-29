import { useCallback, useRef, useState } from 'react';
import { progressStore } from '../../lib/progress';
import { useProgress } from '../../lib/useProgress';
import { sectionIdsOf } from '../../content/ro/topics';
import { pickFeedback } from './feedbackCopy';
import { useStreak } from './useStreak';
import { SOUNDS } from './sound';

/**
 * One interactive's game-feel state: every judged action goes through report(), which fires the
 * element's flash, updates the streak, picks a reaction line and plays a sound if enabled.
 * Hints mark the eventual completion as "cu ajutor".
 */
export function useGameSession(topic) {
  const streak = useStreak();
  const { topic: progressOf, settings } = useProgress();
  const [message, setMessage] = useState(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [completedNow, setCompletedNow] = useState(null);
  const soundOn = useRef(false);
  soundOn.current = settings?.sound === true;

  const play = useCallback((name) => soundOn.current && SOUNDS[name]?.(), []);

  const report = useCallback(
    (ok, flash, origin) => {
      const kind = ok ? 'correct' : 'incorrect';
      flash?.fire(kind, origin);
      if (ok) streak.hit();
      else streak.miss();
      setMessage({ kind, text: pickFeedback(kind), id: Date.now() });
      play(kind);
      return ok;
    },
    [streak, play],
  );

  const takeHint = useCallback(() => setHintsUsed((h) => h + 1), []);

  const complete = useCallback(() => {
    const assisted = hintsUsed > 0;
    progressStore.saveInteractive(topic.slug, assisted, sectionIdsOf(topic));
    setCompletedNow(assisted ? 'cu-ajutor' : 'completat');
    play('complete');
  }, [hintsUsed, topic, play]);

  const saved = progressOf(topic.slug).interactive;
  return {
    report,
    streak: streak.value,
    message,
    hintsUsed,
    takeHint,
    complete,
    completedNow,
    // What the stamp shows: this session's result, else the stored best
    stamp: completedNow ?? (saved ? (saved.assisted ? 'cu-ajutor' : 'completat') : null),
  };
}
