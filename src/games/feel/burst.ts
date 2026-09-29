// Themed particle bursts (canvas-confetti) in the stain palette, shaped like the site's blob cells.
// Disabled entirely under reduced motion; the rest of the feedback (sound, text, HUD) stays.
import confetti from 'canvas-confetti';
import { BLOB_PATHS } from '../../components/primitives/Blob';
import { token } from '../../lib/tokens';

export type BurstPreset = 'success' | 'streak';

/** Viewport point in px (e.g. the centre of the element that earned the burst). */
export interface BurstOrigin {
  x: number;
  y: number;
}

let shapes: confetti.Shape[] | null = null;
let fire: confetti.CreateTypes | null = null;

export function prefersReducedMotion(): boolean {
  if (typeof document === 'undefined') return true;
  // data-reduce-motion is set by MotionPreferenceProvider (OS setting or the dev simulation)
  return document.documentElement.hasAttribute('data-reduce-motion');
}

function blobShapes(): confetti.Shape[] {
  if (!shapes) {
    try {
      shapes = Object.values(BLOB_PATHS as Record<string, string>).map((path) => confetti.shapeFromPath({ path }));
    } catch {
      shapes = ['circle'];
    }
  }
  return shapes;
}

function palette(names: string[]): string[] {
  return names.map((n) => token(n)).filter((c: string) => /^#[0-9a-f]{6}$/i.test(c));
}

function instance(): confetti.CreateTypes {
  if (!fire) {
    // Own canvas above the page (the paper grain is z 60, the soft cursor z 80)
    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    Object.assign(canvas.style, { position: 'fixed', inset: '0', width: '100%', height: '100%', pointerEvents: 'none', zIndex: '70' });
    document.body.appendChild(canvas);
    fire = confetti.create(canvas, { resize: true, useWorker: false, disableForReducedMotion: true });
  }
  return fire;
}

/** Fires a burst. `origin` defaults to the centre of the viewport. No-op under reduced motion. */
export function burst(preset: BurstPreset, origin?: BurstOrigin): void {
  if (typeof window === 'undefined' || prefersReducedMotion()) return;
  const o = origin
    ? { x: origin.x / window.innerWidth, y: origin.y / window.innerHeight }
    : { x: 0.5, y: 0.45 };
  const common = { origin: o, shapes: blobShapes(), disableForReducedMotion: true };
  try {
    if (preset === 'streak') {
      void instance()({
        ...common,
        colors: palette(['iodine', 'iodine-200', 'eosin']),
        particleCount: 18,
        spread: 70,
        startVelocity: 22,
        scalar: 0.7,
        ticks: 90,
        gravity: 0.9,
      });
    } else {
      const colors = palette(['eosin', 'methylene', 'iodine', 'eosin-200', 'methylene-200']);
      void instance()({ ...common, colors, particleCount: 60, spread: 80, startVelocity: 34, scalar: 0.9, ticks: 160 });
      void instance()({ ...common, colors, particleCount: 30, spread: 120, startVelocity: 24, scalar: 0.6, ticks: 140, decay: 0.92 });
    }
  } catch {
    // Canvas unavailable: bursts are decoration, never required
  }
}
