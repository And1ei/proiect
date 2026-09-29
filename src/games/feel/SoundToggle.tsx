import { t } from '../../lib/i18n';
import { useProgress } from '../../lib/useProgress';
import { cx } from '../../lib/cx';
import { play, setMuted } from './sfx';

/**
 * Master mute. Muted by default; the preference lives in the progress store (settings.sound).
 * `compact`: icon only below the sm breakpoint (the label stays for screen readers).
 */
export default function SoundToggle({ className, compact = false }: { className?: string; compact?: boolean }) {
  const { settings } = useProgress();
  const on = settings?.sound === true;

  const toggle = () => {
    setMuted(on);
    // Turning it on plays one sample; this click is also the gesture that unlocks audio
    if (!on) queueMicrotask(() => play('click'));
  };

  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={toggle}
      className={cx('text-label inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-tag px-2 py-1 text-ink-soft hover:text-ink', className)}
    >
      <svg aria-hidden="true" viewBox="0 0 20 16" className="w-4">
        <path d="M2 5.5 L 6 5.5 L 10.5 2 L 10.5 14 L 6 10.5 L 2 10.5 Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        {on ? (
          <path d="M13.5 5 C 15 6.4, 15 9.6, 13.5 11 M15.8 3 C 18.4 5.6, 18.4 10.4, 15.8 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        ) : (
          <path d="M13.5 5.5 L 18 10.5 M18 5.5 L 13.5 10.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        )}
      </svg>
      <span className={compact ? 'sr-only sm:not-sr-only' : undefined}>{t(on ? 'game.soundOn' : 'game.soundOff')}</span>
    </button>
  );
}
