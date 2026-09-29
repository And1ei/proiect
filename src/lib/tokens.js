// Read design tokens from tokens.css at runtime so JS animations (which can't interpolate
// var() references) stay in sync with the single CSS source of truth.
const cache = new Map();

export function token(name) {
  if (typeof window === 'undefined') return '';
  if (!cache.has(name)) {
    const value = getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim();
    cache.set(name, value);
  }
  return cache.get(name);
}

export const BLOB_SHAPES = ['a', 'b', 'c', 'd'];
