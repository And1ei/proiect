// Phaser draws text to a canvas once: if the web font isn't loaded yet, the fallback font is baked
// in. So <PhaserGame> waits for the self-hosted fonts before creating any scene.

const FACES = ['500 32px "Fraunces Variable"', '400 16px "Instrument Sans"', '500 16px "Instrument Sans"', '400 16px "DM Mono"'];
// Romanian glyphs, so the latin-ext subset (ș ț ă î â) is fetched too, not only basic latin
const SAMPLE = 'Aa ăâîșț ĂÂÎȘȚ 0123';

let ready: Promise<void> | null = null;

/** Resolves when the fonts are usable, or after `timeoutMs` (never blocks a game forever). */
export function waitForFonts(timeoutMs = 3000): Promise<void> {
  if (typeof document === 'undefined' || !document.fonts) return Promise.resolve();
  ready ??= Promise.race([
    Promise.all(FACES.map((f) => document.fonts.load(f, SAMPLE))).then(() => undefined),
    new Promise<void>((resolve) => setTimeout(resolve, timeoutMs)),
  ]).catch(() => undefined);
  return ready;
}
