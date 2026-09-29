import { useSyncExternalStore } from 'react';
import { EMPTY_TOPIC, progressStore } from './progress';

/**
 * Progress for all lessons (and games), re-rendering on every change (also from other tabs).
 * Actions are stable functions and safe to call from effects.
 */
export function useProgress() {
  const data = useSyncExternalStore(progressStore.subscribe, progressStore.get, progressStore.getServerSnapshot);
  return {
    data,
    blocked: progressStore.isBlocked(),
    topic: (slug) => data.topics[slug] ?? EMPTY_TOPIC,
    markSectionRead: progressStore.markSectionRead,
    saveQuiz: progressStore.saveQuiz,
    settings: data.settings,
    setSetting: progressStore.setSetting,
    reset: progressStore.reset,
  };
}
