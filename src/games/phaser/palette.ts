// Phaser can't read CSS variables, so the design tokens are read once from computed styles when a
// game mounts and handed to scenes as strings (for text) and numbers (for fills and tints).
// Scenes use palette.num.eosin, never a hex literal. Colours stay defined only in tokens.css.

const COLOR_TOKENS = [
  'paper', 'paper-bright', 'paper-deep', 'paper-shade',
  'ink', 'ink-soft', 'ink-faint',
  'eosin-50', 'eosin-100', 'eosin-200', 'eosin', 'eosin-deep',
  'methylene-50', 'methylene-100', 'methylene-200', 'methylene', 'methylene-deep',
  'iodine-100', 'iodine-200', 'iodine', 'iodine-deep',
] as const;

export type ColorToken = (typeof COLOR_TOKENS)[number];

export interface Palette {
  /** '#RRGGBB' strings, for Phaser text styles and CSS. */
  hex: Record<ColorToken, string>;
  /** 0xRRGGBB numbers, for fills, strokes and tints. */
  num: Record<ColorToken, number>;
  font: { display: string; body: string; mono: string };
}

const toNumber = (hex: string) => parseInt(hex.replace('#', '').slice(0, 6), 16);

export function readPalette(from: Element = document.documentElement): Palette {
  const style = getComputedStyle(from);
  const hex = {} as Record<ColorToken, string>;
  const num = {} as Record<ColorToken, number>;
  for (const name of COLOR_TOKENS) {
    const value = style.getPropertyValue(`--${name}`).trim();
    if (!/^#[0-9a-f]{6}$/i.test(value)) throw new Error(`[palette] --${name} is not a #RRGGBB colour in tokens.css ("${value}")`);
    hex[name] = value.toUpperCase();
    num[name] = toNumber(value);
  }
  const font = (v: string) => style.getPropertyValue(v).trim();
  return { hex, num, font: { display: font('--font-display'), body: font('--font-body'), mono: font('--font-mono') } };
}
