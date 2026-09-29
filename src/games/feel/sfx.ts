// Sound effects: a thin, fail-safe wrapper over Howler.
// - Muted by default; the master switch is `settings.sound` in the progress store (localStorage).
// - Nothing plays, and no audio is even created, before the first user gesture on the page.
// - Every call is a safe no-op when the sound is missing, fails to load or audio is unavailable.
// - Short one-shot sounds only (each file < 50 KB, see scripts/assets-clean.mjs).
import { Howl, Howler } from 'howler';
import type { SoundEvent } from '../../assets/manifest';
import { soundUrl } from '../../assets/urls';
import { progressStore } from '../../lib/progress';

export type { SoundEvent };

const VOLUME: Partial<Record<SoundEvent, number>> = { click: 0.35, pop: 0.5, whoosh: 0.4, win: 0.7, lose: 0.55 };
const howls = new Map<SoundEvent, Howl>();
const broken = new Set<SoundEvent>();
const warned = new Set<SoundEvent>();
let gestured = false;

if (typeof window !== 'undefined') {
  const unlock = () => {
    gestured = true;
    window.removeEventListener('pointerdown', unlock, true);
    window.removeEventListener('keydown', unlock, true);
  };
  window.addEventListener('pointerdown', unlock, true);
  window.addEventListener('keydown', unlock, true);
}

export const isMuted = (): boolean => progressStore.get().settings.sound !== true;

export function setMuted(muted: boolean): void {
  progressStore.setSetting('sound', !muted);
  try {
    Howler.mute(muted);
  } catch {
    // Audio unavailable: the setting is still saved
  }
}

function howl(event: SoundEvent): Howl | null {
  if (broken.has(event)) return null;
  const existing = howls.get(event);
  if (existing) return existing;
  const src = soundUrl(event);
  if (!src) {
    if (import.meta.env.DEV && !warned.has(event)) {
      warned.add(event);
      console.warn(`[sfx] no sound mapped to "${event}" in src/assets/manifest.ts; playing nothing`);
    }
    return null;
  }
  const h = new Howl({
    src: [src],
    volume: VOLUME[event] ?? 0.6,
    preload: true,
    onloaderror: () => broken.add(event),
    onplayerror: () => broken.add(event),
  });
  howls.set(event, h);
  return h;
}

/** Plays a named sound if sound is on and the page has had a user gesture. Never throws. */
export function play(event: SoundEvent): void {
  if (!gestured || isMuted()) return;
  try {
    if (Howler.noAudio) return;
    howl(event)?.play();
  } catch {
    broken.add(event);
  }
}

/** Creates (and starts loading) the given sounds, so the first play has no delay. Call after a gesture. */
export function preload(events: SoundEvent[] = ['click', 'correct', 'wrong', 'streak', 'win', 'lose']): void {
  if (!gestured || isMuted()) return;
  try {
    if (!Howler.noAudio) events.forEach(howl);
  } catch {
    // Safe no-op
  }
}

export const sfx = { play, preload, isMuted, setMuted };
