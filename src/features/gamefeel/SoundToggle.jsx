import { t } from '../../lib/i18n';
import { useProgress } from '../../lib/useProgress';
import { SOUNDS } from './sound';

/** Muted by default. The preference lives in the progress blob (settings.sound). */
export default function SoundToggle() {
  const { settings, setSetting } = useProgress();
  const on = settings?.sound === true;

  const toggle = () => {
    setSetting('sound', !on);
    // Turning it on plays one sample; this click is also the gesture that unlocks audio
    if (!on) SOUNDS.correct();
  };

  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={toggle}
      className="text-label inline-flex items-center gap-2 rounded-tag px-2 py-1 text-ink-soft hover:text-ink"
    >
      <svg aria-hidden="true" viewBox="0 0 20 16" className="w-4">
        <path d="M2 5.5 L 6 5.5 L 10.5 2 L 10.5 14 L 6 10.5 L 2 10.5 Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        {on ? (
          <path d="M13.5 5 C 15 6.4, 15 9.6, 13.5 11 M15.8 3 C 18.4 5.6, 18.4 10.4, 15.8 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        ) : (
          <path d="M13.5 5.5 L 18 10.5 M18 5.5 L 13.5 10.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        )}
      </svg>
      {t(on ? 'game.soundOn' : 'game.soundOff')}
    </button>
  );
}
