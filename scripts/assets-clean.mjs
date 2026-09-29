// Rebuilds src/assets/<kind>/ from the untouched originals in assets-src/, following the manifest.
//   SVG:   SVGO (preset-default + extras, all <style> rules inlined), metadata/title stripped,
//          width/height removed, optional artboard background dropped, viewBox cropped to the
//          drawing's real bounds (measured with getBBox() in headless Chromium, when available) and
//          squared with even padding (one scale grid for every sprite), then colours rewritten:
//          'palette' → each colour snapped to the nearest stain-palette colour (CIELAB distance),
//          'mono'    → every colour becomes currentColor (tinted later by <Sprite> or Phaser);
//          with `hue`, palette assets snap into one stain family by lightness (multi-state sprites).
//   Audio: ffmpeg → mono 64 kbps MP3, metadata stripped. Set FFMPEG_PATH if ffmpeg isn't on PATH;
//          without ffmpeg, audio is skipped (existing MP3s are kept) and the script says so.
// Usage: npm run assets:clean [-- <asset-id> ...]
import { readFileSync, writeFileSync, mkdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import os from 'node:os';
import { existsSync } from 'node:fs';
import { optimize } from 'svgo';
import { ASSETS } from '../src/assets/manifest.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const RAW_DIR = join(root, 'assets-src');
const OUT_DIR = join(root, 'src/assets');
const PADDING = 0.04; // of the longest side, on every edge
const MAX_AUDIO_BYTES = 50 * 1024;

// ── Palette from tokens.css (the design tokens stay the single source of truth) ──
const tokens = readFileSync(join(root, 'src/styles/tokens.css'), 'utf8');
const PALETTE_NAMES = [
  'paper', 'paper-bright', 'paper-deep', 'paper-shade', 'ink', 'ink-soft',
  'eosin-50', 'eosin-100', 'eosin-200', 'eosin', 'eosin-deep',
  'methylene-50', 'methylene-100', 'methylene-200', 'methylene', 'methylene-deep',
  'iodine-100', 'iodine-200', 'iodine', 'iodine-deep',
];
const palette = PALETTE_NAMES.map((name) => {
  const m = tokens.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`));
  if (!m) throw new Error(`tokens.css: --${name} not found`);
  return { name, hex: m[1].toUpperCase(), lab: toLab(parseHex(m[1])) };
});

function parseHex(hex) {
  let h = hex.replace('#', '');
  if (h.length === 3) h = [...h].map((c) => c + c).join('');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}

function toLab([r, g, b]) {
  const lin = (c) => ((c /= 255) <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const [R, G, B] = [lin(r), lin(g), lin(b)];
  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const x = f((R * 0.4124 + G * 0.3576 + B * 0.1805) / 0.95047);
  const y = f(R * 0.2126 + G * 0.7152 + B * 0.0722);
  const z = f((R * 0.0193 + G * 0.1192 + B * 0.9505) / 1.08883);
  return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
}

const NAMED = { white: '#ffffff', black: '#000000', red: '#ff0000', green: '#008000', blue: '#0000ff', gray: '#808080', grey: '#808080' };

function toRgb(value) {
  const v = value.trim().toLowerCase();
  if (NAMED[v]) return parseHex(NAMED[v]);
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/.test(v)) return parseHex(v);
  const m = v.match(/^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/);
  return m ? [+m[1], +m[2], +m[3]] : null;
}

function nearest(rgb) {
  const lab = toLab(rgb);
  let best = palette[0];
  let bestD = Infinity;
  for (const p of palette) {
    const d = (p.lab[0] - lab[0]) ** 2 + (p.lab[1] - lab[1]) ** 2 + (p.lab[2] - lab[2]) ** 2;
    if (d < bestD) [best, bestD] = [p, d];
  }
  return best.hex;
}

// 'hue' mode: every chromatic colour becomes the stop of one stain family closest in lightness, and
// near-greys become the closest paper/ink neutral. The states of one object (a normal, a crenated
// and a lysed red cell) then read as the same cell instead of drifting between hues.
const NEUTRALS = ['paper-bright', 'paper', 'paper-deep', 'paper-shade', 'ink-soft', 'ink'];
const GREY_CHROMA = 10;
function nearestInFamily(rgb, family) {
  const lab = toLab(rgb);
  const chroma = Math.hypot(lab[1], lab[2]);
  if (chroma < GREY_CHROMA) {
    const pool = palette.filter((p) => NEUTRALS.includes(p.name));
    return pool.reduce((a, b) => (dist(b.lab, lab) < dist(a.lab, lab) ? b : a)).hex;
  }
  const ramp = palette.filter((p) => p.name === family || p.name.startsWith(`${family}-`));
  if (!ramp.length) throw new Error(`no palette colours for hue "${family}"`);
  return ramp.reduce((a, b) => (Math.abs(b.lab[0] - lab[0]) < Math.abs(a.lab[0] - lab[0]) ? b : a)).hex;
}
const dist = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;

const COLOR_PROPS = ['fill', 'stroke', 'stop-color', 'flood-color', 'lighting-color', 'color'];

// SVGO plugin: drop the first drawn shape (artboard background)
const DRAWN = new Set(['path', 'rect', 'polygon', 'circle', 'ellipse']);
const dropBackground = {
  name: 'soft-educational-drop-background',
  fn: () => {
    let done = false;
    return {
      element: {
        enter(node, parent) {
          if (done || !DRAWN.has(node.name)) return;
          done = true;
          parent.children = parent.children.filter((c) => c !== node);
        },
      },
    };
  },
};

// SVGO plugin: square the viewBox and rewrite colours in attributes and inline styles
const recolor = (mode, bbox, hue) => ({
  name: 'soft-educational-recolor',
  fn: () => {
    const map = (value) => {
      if (!value || /^(none|transparent|currentcolor|inherit|url\()/i.test(value.trim())) return value;
      const rgb = toRgb(value);
      if (!rgb) return value;
      if (mode === 'mono') return 'currentColor';
      return hue ? nearestInFamily(rgb, hue) : nearest(rgb);
    };
    return {
      element: {
        enter(node, parent) {
          if (node.name === 'svg' && parent.type === 'root') squareViewBox(node, bbox);
          for (const prop of COLOR_PROPS) if (prop in node.attributes) node.attributes[prop] = map(node.attributes[prop]);
          if (node.attributes.style) {
            node.attributes.style = node.attributes.style
              .split(';')
              .map((decl) => {
                const [k, ...rest] = decl.split(':');
                if (!k || !rest.length) return decl;
                const key = k.trim().toLowerCase();
                return COLOR_PROPS.includes(key) ? `${key}:${map(rest.join(':'))}` : decl;
              })
              .join(';');
          }
          // A mono silhouette with no explicit fill would render black: make the default tintable too
          if (mode === 'mono' && node.name === 'svg' && parent.type === 'root') node.attributes.fill = 'currentColor';
        },
      },
    };
  },
});

function squareViewBox(svg, bbox) {
  let vb = bbox ? [bbox.x, bbox.y, bbox.width, bbox.height] : svg.attributes.viewBox?.trim().split(/[\s,]+/).map(Number);
  if (!vb || vb.length !== 4 || vb.some(Number.isNaN)) {
    const w = parseFloat(svg.attributes.width);
    const h = parseFloat(svg.attributes.height);
    if (!w || !h) throw new Error('SVG has neither a viewBox nor numeric width/height');
    vb = [0, 0, w, h];
  }
  const [x, y, w, h] = vb;
  const side = Math.max(w, h);
  const pad = side * PADDING;
  const r = (n) => Math.round(n * 100) / 100;
  svg.attributes.viewBox = [x - (side - w) / 2 - pad, y - (side - h) / 2 - pad, side + 2 * pad, side + 2 * pad].map(r).join(' ');
  delete svg.attributes.width;
  delete svg.attributes.height;
}

const BASE_PLUGINS = [
  { name: 'inlineStyles', params: { onlyMatchedOnce: false } },
  'preset-default',
  'convertStyleToAttrs',
  'removeDimensions',
  'removeTitle',
  'removeDesc',
  'removeRasterImages', // sprites are vector only; an embedded bitmap would bypass the palette
];

/** Pass 1: optimise and strip; pass 2 (after measuring): crop, square and recolour. */
function prepareSvg(entry) {
  const input = readFileSync(join(RAW_DIR, entry.raw), 'utf8');
  return optimize(input, { multipass: true, plugins: [...BASE_PLUGINS, ...(entry.dropBackground ? [dropBackground] : [])] }).data;
}

function finishSvg(entry, svg, bbox) {
  return optimize(svg, { plugins: [recolor(entry.color ?? 'palette', bbox, entry.hue)] }).data;
}

// Real drawing bounds via getBBox() in headless Chromium (playwright-core is already a dev
// dependency for the audits). Without Chromium the original viewBox is squared instead.
async function measure(svgs) {
  const executablePath = process.env.CHROMIUM_PATH ?? join(os.homedir(), 'AppData/Local/Chromium/Application/chrome.exe');
  if (!svgs.length) return new Map();
  if (!existsSync(executablePath)) {
    console.warn('note  Chromium not found (set CHROMIUM_PATH): viewBoxes are squared but not cropped to the drawing');
    return new Map();
  }
  const { chromium } = await import('playwright-core');
  const browser = await chromium.launch({ executablePath, headless: true });
  const page = await browser.newPage();
  const out = new Map();
  for (const [id, svg] of svgs) {
    await page.setContent(`<!doctype html><body style="margin:0">${svg}</body>`);
    const b = await page.evaluate(() => {
      const el = document.querySelector('svg');
      const box = el.getBBox();
      return { x: box.x, y: box.y, width: box.width, height: box.height };
    });
    if (b.width > 0 && b.height > 0) out.set(id, b);
  }
  await browser.close();
  return out;
}

function findFfmpeg() {
  for (const bin of [process.env.FFMPEG_PATH, 'ffmpeg'].filter(Boolean)) {
    const r = spawnSync(bin, ['-version'], { encoding: 'utf8' });
    if (r.status === 0) return bin;
  }
  return null;
}

const only = process.argv.slice(2);
const entries = ASSETS.filter((a) => !only.length || only.includes(a.id));
const ffmpeg = entries.some((a) => a.kind === 'sound') ? findFfmpeg() : null;
let failed = 0;

const prepared = new Map();
for (const entry of entries.filter((e) => e.file.endsWith('.svg'))) {
  try {
    prepared.set(entry.id, prepareSvg(entry));
  } catch (e) {
    failed += 1;
    console.error(`FAIL  ${entry.id}: ${e.message}`);
  }
}
const bounds = await measure([...prepared]);

for (const entry of entries) {
  const out = join(OUT_DIR, entry.file);
  mkdirSync(dirname(out), { recursive: true });
  try {
    if (entry.file.endsWith('.svg')) {
      if (!prepared.has(entry.id)) continue;
      writeFileSync(out, finishSvg(entry, prepared.get(entry.id), bounds.get(entry.id)));
    } else if (entry.file.endsWith('.mp3')) {
      if (!ffmpeg) {
        console.warn(`skip  ${entry.id}: ffmpeg not found (set FFMPEG_PATH); keeping the existing MP3`);
        continue;
      }
      const r = spawnSync(
        ffmpeg,
        ['-y', '-loglevel', 'error', '-i', join(RAW_DIR, entry.raw), '-map_metadata', '-1', '-ac', '1', '-ar', '44100', '-codec:a', 'libmp3lame', '-b:a', '64k', out],
        { encoding: 'utf8' },
      );
      if (r.status !== 0) throw new Error(r.stderr || 'ffmpeg failed');
    } else {
      throw new Error(`no cleaning rule for ${entry.file}`);
    }
    const size = statSync(out).size;
    const tooBig = entry.kind === 'sound' && size > MAX_AUDIO_BYTES;
    if (tooBig) failed += 1;
    console.log(`${tooBig ? 'FAIL' : 'ok  '}  ${entry.id.padEnd(24)} ${String(size).padStart(7)} B  ${entry.file}${tooBig ? '  (over 50 KB)' : ''}`);
  } catch (e) {
    failed += 1;
    console.error(`FAIL  ${entry.id}: ${e.message}`);
  }
}

process.exitCode = failed ? 1 : 0;
