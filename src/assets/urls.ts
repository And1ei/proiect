// id → bundled URL for every manifest asset. Vite fingerprints each file and emits it next to the
// JS, so it is precached by the service worker and works offline. Never hot-link assets.
import { ASSETS, type AssetEntry, type SoundEvent } from './manifest';

const urls = import.meta.glob<string>('./{icons,organisms,ui,sounds,textures}/**/*', {
  eager: true,
  query: '?url',
  import: 'default',
});

const byId = new Map(ASSETS.map((a) => [a.id, a]));
const byEvent = new Map(ASSETS.filter((a) => a.event).map((a) => [a.event as SoundEvent, a]));

export type ResolvedAsset = AssetEntry & { url: string };

/**
 * The asset with this id, or a thrown error naming what's missing. There is deliberately no
 * fallback shape: "no placeholder art" (GAME-DEV.md). `npm run assets:check` guarantees every
 * manifest file exists, so in practice this only throws for an id typo, and it does so in dev.
 */
export function getAsset(id: string): ResolvedAsset {
  const entry = byId.get(id);
  const url = entry ? urls[`./${entry.file}`] : undefined;
  if (!entry || !url) {
    throw new Error(
      `[assets] "${id}" is not a shipped asset. Add it to src/assets/manifest.ts through the asset ` +
        `pipeline (GAME-DEV.md, "Assets"); never substitute a drawn placeholder.`,
    );
  }
  return { ...entry, url };
}

export const hasAsset = (id: string) => byId.has(id);

/** URL of the sound mapped to a named event, or null (callers treat a missing sound as silence). */
export function soundUrl(event: SoundEvent): string | null {
  const entry = byEvent.get(event);
  return entry ? (urls[`./${entry.file}`] ?? null) : null;
}

export const ALL_ASSETS: readonly ResolvedAsset[] = ASSETS.filter((a) => urls[`./${a.file}`]).map((a) => ({
  ...a,
  url: urls[`./${a.file}`],
}));
