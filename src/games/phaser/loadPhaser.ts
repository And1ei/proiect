// The only runtime entry point to Phaser from React code. A dynamic import keeps Phaser (~1 MB) in
// its own chunk (see vite.config.js), downloaded only on Phaser game routes.
export type PhaserModule = typeof import('phaser');

let pending: Promise<PhaserModule> | null = null;

export function loadPhaser(): Promise<PhaserModule> {
  pending ??= import('phaser').catch((e) => {
    pending = null; // allow a retry (e.g. the network came back)
    throw e;
  });
  return pending;
}

/** Start downloading Phaser without waiting (hover / focus on a Phaser game card, intro screen). */
export function preloadPhaser(): void {
  void loadPhaser().catch(() => undefined);
}
