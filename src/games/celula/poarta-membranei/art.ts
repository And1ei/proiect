// Procedural art for "Poarta membranei", drawn with the plain Canvas 2D API so the same drawings serve
// the Phaser scene (baked once into canvas textures) and the DOM intro (<ArtCanvas>). No Phaser here.
//
// What is drawn here: molecules (stylised atom clusters), the phospholipid bilayer, the membrane
// proteins used as gates (channel, pump), UI chrome (gate frames, the concentration cue, formula
// chips). No cells or organisms: the erythrocyte, the mitochondrion and ATP come from the asset
// manifest. Colours come only from the palette (design tokens), never from literals.
import type { Palette } from '../../phaser/palette';
import type { Route, Side, Species } from '../../../content/ro/membrane-molecules';
import { ATOM_R, MEMBRANE_HALF } from './config';
import { formulaRuns } from './formula';

type Ctx = CanvasRenderingContext2D;

// ── Colour helpers (mixing palette colours only) ─────────────────────
const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
export const mix = (a: string, b: string, t: number) => {
  const [x, y] = [rgb(a), rgb(b)];
  return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * t)).join(' ')})`;
};
export const alpha = (hex: string, a: number) => `rgb(${rgb(hex).join(' ')} / ${a})`;

interface Tone {
  light: string;
  base: string;
  rim: string;
}

type Element = 'O' | 'C' | 'H' | 'Na' | 'K';

function tones(p: Palette): Record<Element | 'beadA' | 'beadB', Tone> {
  const h = p.hex;
  return {
    O: { light: h.eosin, base: h['eosin-deep'], rim: mix(h['eosin-deep'], h.ink, 0.35) },
    C: { light: mix(h['ink-soft'], h['paper-bright'], 0.25), base: h.ink, rim: h.ink },
    H: { light: h['paper-bright'], base: h['paper-deep'], rim: h['paper-shade'] },
    Na: { light: h['iodine-100'], base: h.iodine, rim: h['iodine-deep'] },
    K: { light: h['methylene-200'], base: h.methylene, rim: h['methylene-deep'] },
    beadA: { light: h['eosin-100'], base: h['eosin-200'], rim: h.eosin },
    beadB: { light: h['iodine-100'], base: h['iodine-200'], rim: h.iodine },
  };
}

/** A shaded sphere: soft paper-cut shadow, radial body, thin ink rim and a small highlight. */
function sphere(ctx: Ctx, p: Palette, x: number, y: number, r: number, t: Tone, shadow = true) {
  if (shadow) {
    ctx.fillStyle = alpha(p.hex.ink, 0.14);
    ctx.beginPath();
    ctx.arc(x + r * 0.14, y + r * 0.2, r, 0, Math.PI * 2);
    ctx.fill();
  }
  const g = ctx.createRadialGradient(x - r * 0.38, y - r * 0.42, r * 0.08, x, y, r);
  g.addColorStop(0, t.light);
  g.addColorStop(0.6, t.base);
  g.addColorStop(1, t.rim);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = Math.max(0.9, r * 0.075);
  ctx.strokeStyle = alpha(p.hex.ink, 0.5);
  ctx.stroke();
  ctx.fillStyle = alpha(p.hex['paper-bright'], 0.55);
  ctx.beginPath();
  ctx.ellipse(x - r * 0.36, y - r * 0.42, r * 0.24, r * 0.16, -0.6, 0, Math.PI * 2);
  ctx.fill();
}

function bond(ctx: Ctx, p: Palette, x1: number, y1: number, x2: number, y2: number, double = false) {
  ctx.strokeStyle = alpha(p.hex['ink-soft'], 0.85);
  ctx.lineCap = 'round';
  ctx.lineWidth = 2.6;
  if (!double) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    return;
  }
  const [dx, dy] = [x2 - x1, y2 - y1];
  const len = Math.hypot(dx, dy) || 1;
  const [nx, ny] = [(-dy / len) * 3.2, (dx / len) * 3.2];
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(x1 + nx * s, y1 + ny * s);
    ctx.lineTo(x2 + nx * s, y2 + ny * s);
    ctx.stroke();
  }
}

function charge(ctx: Ctx, p: Palette, x: number, y: number, r: number) {
  ctx.strokeStyle = p.hex['paper-bright'];
  ctx.lineWidth = Math.max(2.4, r * 0.2);
  ctx.lineCap = 'round';
  const s = r * 0.42;
  ctx.beginPath();
  ctx.moveTo(x - s, y);
  ctx.lineTo(x + s, y);
  ctx.moveTo(x, y - s);
  ctx.lineTo(x, y + s);
  ctx.stroke();
}

// A folded chain for the protein: fixed points, so every protein token looks the same
const PROTEIN_PATH: [number, number][] = [
  [-25, -17], [-13, -26], [1, -25], [11, -16], [2, -7], [-11, -9], [-23, -1], [-27, 12], [-16, 19],
  [-4, 11], [9, 5], [21, -5], [28, 7], [20, 19], [7, 24], [-7, 29],
];

/** Visual radius of each species (for layout and hit areas). */
export const MOLECULE_RADIUS: Record<Species | 'H2O', number> = {
  O2: 22,
  CO2: 35,
  glucoza: 34,
  Na: ATOM_R.Na,
  K: ATOM_R.K,
  proteina: 36,
  H2O: 15,
};

/** Draws a molecule centred on (0, 0). Water is only used by the osmosis event. */
export function drawMolecule(ctx: Ctx, p: Palette, species: Species | 'H2O') {
  const T = tones(p);
  ctx.save();
  switch (species) {
    case 'O2': {
      const r = ATOM_R.O - 1;
      bond(ctx, p, -11, 0, 11, 0, true);
      sphere(ctx, p, -11, 0, r, T.O);
      sphere(ctx, p, 11, 0, r, T.O);
      break;
    }
    case 'CO2': {
      bond(ctx, p, -24, 0, 0, 0, true);
      bond(ctx, p, 0, 0, 24, 0, true);
      sphere(ctx, p, -24, 0, ATOM_R.O - 1.5, T.O);
      sphere(ctx, p, 24, 0, ATOM_R.O - 1.5, T.O);
      sphere(ctx, p, 0, 0, ATOM_R.C - 1.5, T.C);
      break;
    }
    case 'glucoza': {
      // Pyranose ring (5 C + 1 O) with three OH groups: stylised, not every atom
      const ring = Array.from({ length: 6 }, (_, i) => {
        const a = -Math.PI / 2 + (i * Math.PI) / 3 + Math.PI / 6;
        return [Math.cos(a) * 18, Math.sin(a) * 18] as [number, number];
      });
      const oh = [0, 2, 4].map((i) => {
        const [x, y] = ring[i];
        const k = 1.62;
        return { at: [x, y], o: [x * k, y * k], h: [x * k + (x > 0 ? 7 : -7), y * k + (y > 0 ? 4 : -5)] };
      });
      for (const g of oh) {
        bond(ctx, p, g.at[0], g.at[1], g.o[0], g.o[1]);
        bond(ctx, p, g.o[0], g.o[1], g.h[0], g.h[1]);
      }
      for (let i = 0; i < 6; i += 1) bond(ctx, p, ...ring[i], ...ring[(i + 1) % 6]);
      for (const g of oh) {
        sphere(ctx, p, g.h[0], g.h[1], 4.6, T.H, false);
        sphere(ctx, p, g.o[0], g.o[1], 7.2, T.O);
      }
      ring.forEach(([x, y], i) => sphere(ctx, p, x, y, 7.8, i === 5 ? T.O : T.C));
      break;
    }
    case 'Na':
    case 'K': {
      const r = ATOM_R[species];
      sphere(ctx, p, 0, 0, r, T[species]);
      charge(ctx, p, 1, 1, r);
      break;
    }
    case 'proteina': {
      ctx.strokeStyle = alpha(p.hex['ink-soft'], 0.7);
      ctx.lineWidth = 3;
      ctx.lineJoin = 'round';
      ctx.beginPath();
      PROTEIN_PATH.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.stroke();
      PROTEIN_PATH.forEach(([x, y], i) => sphere(ctx, p, x, y, ATOM_R.bead, i % 3 === 1 ? T.beadB : T.beadA, i % 2 === 0));
      break;
    }
    case 'H2O': {
      const a = (104.5 / 2) * (Math.PI / 180);
      const hx = Math.sin(a) * 12;
      const hy = Math.cos(a) * 12;
      bond(ctx, p, 0, -3, -hx, -3 + hy);
      bond(ctx, p, 0, -3, hx, -3 + hy);
      sphere(ctx, p, -hx, -3 + hy, 5.6, T.H, false);
      sphere(ctx, p, hx, -3 + hy, 5.6, T.H, false);
      sphere(ctx, p, 0, -3, 8.6, T.O);
      break;
    }
  }
  ctx.restore();
}

// ── Formula chip ──────────────────────────────────────────────────────
const CHIP_PAD_X = 8;
const CHIP_H = 1.3;

function fonts(p: Palette, px: number) {
  return { base: `500 ${px}px ${p.font.mono}`, small: `500 ${Math.round(px * 0.66)}px ${p.font.mono}` };
}

/** Width and height of a formula chip at font size `px`. */
export function measureChip(ctx: Ctx, p: Palette, formula: string, px: number) {
  const f = fonts(p, px);
  let w = 0;
  for (const run of formulaRuns(formula)) {
    ctx.font = run.kind === 'base' ? f.base : f.small;
    w += ctx.measureText(run.text).width;
  }
  return { width: Math.ceil(w + CHIP_PAD_X * 2), height: Math.ceil(px * CHIP_H + 6) };
}

/** A paper pill with the formula in DM Mono; subscripts smaller and lower, charges higher. */
export function drawChip(ctx: Ctx, p: Palette, formula: string, px: number, x: number, y: number) {
  const { width, height } = measureChip(ctx, p, formula, px);
  const f = fonts(p, px);
  ctx.save();
  roundRect(ctx, x - width / 2, y - height / 2, width, height, height / 2);
  ctx.fillStyle = p.hex['paper-bright'];
  ctx.fill();
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = alpha(p.hex.ink, 0.38);
  ctx.stroke();
  ctx.fillStyle = p.hex.ink;
  ctx.textBaseline = 'alphabetic';
  let cx = x - width / 2 + CHIP_PAD_X;
  const baseline = y + px * 0.34;
  for (const run of formulaRuns(formula)) {
    ctx.font = run.kind === 'base' ? f.base : f.small;
    const dy = run.kind === 'sub' ? px * 0.24 : run.kind === 'sup' ? -px * 0.4 : 0;
    ctx.fillText(run.text, cx, baseline + dy);
    cx += ctx.measureText(run.text).width;
  }
  ctx.restore();
  return { width, height };
}

// ── Concentration cue ─────────────────────────────────────────────────
export const CUE = { width: 34, height: 58 };

// Dot positions inside one half of the cue (x, y in 0..1), dense first
const DOTS: [number, number][] = [
  [0.3, 0.3], [0.7, 0.62], [0.32, 0.78], [0.72, 0.22], [0.5, 0.5], [0.26, 0.55], [0.7, 0.86],
];

/**
 * The concentration cue next to each token: a tiny two-sided well (exterior above the line,
 * cytoplasm below) crowded on the side where the substance is more concentrated, and an arrow for
 * the way the molecule has to go. Drawn in a CUE.width × CUE.height box from (0, 0).
 */
export function drawCue(ctx: Ctx, p: Palette, higher: Side, from: Side, dot: string) {
  const w = 18;
  const h = CUE.height;
  ctx.save();
  roundRect(ctx, 1, 1, w - 2, h - 2, 7);
  ctx.fillStyle = p.hex['paper-bright'];
  ctx.fill();
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = alpha(p.hex.ink, 0.35);
  ctx.stroke();
  // membrane line
  ctx.strokeStyle = p.hex['ink-soft'];
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(2, h / 2);
  ctx.lineTo(w - 2, h / 2);
  ctx.stroke();
  const half = (top: boolean, n: number) => {
    ctx.fillStyle = dot;
    for (const [dx, dy] of DOTS.slice(0, n)) {
      ctx.beginPath();
      ctx.arc(3 + dx * (w - 6), (top ? 3 : h / 2 + 2) + dy * (h / 2 - 6), 2.1, 0, Math.PI * 2);
      ctx.fill();
    }
  };
  half(true, higher === 'exterior' ? 7 : 2);
  half(false, higher === 'interior' ? 7 : 2);
  // arrow: the way the molecule goes (down = into the cell)
  const down = from === 'exterior';
  const ax = w + 8;
  const [y1, y2] = down ? [8, h - 8] : [h - 8, 8];
  ctx.strokeStyle = p.hex.ink;
  ctx.fillStyle = p.hex.ink;
  ctx.lineWidth = 2.6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(ax, y1);
  ctx.lineTo(ax, y2 + (down ? -6 : 6));
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(ax, y2);
  ctx.lineTo(ax - 6, y2 + (down ? -9 : 9));
  ctx.lineTo(ax + 6, y2 + (down ? -9 : 9));
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// ── Bilayer ───────────────────────────────────────────────────────────
export const HEAD_R = 6.2;
const HEAD_STEP = 13.4;
export const BILAYER_PAD = 6;

/** Deterministic noise so the bilayer is irregular but identical every time it is baked. */
function rand(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

/**
 * The phospholipid bilayer, `width` long, centred vertically in a (2·MEMBRANE_HALF + 2·pad) strip:
 * two leaflets of shaded heads with pairs of wavy fatty-acid tails meeting in the middle.
 * `gaps` leave room for protein gates (channel, pump) so their pores show the fluid behind.
 */
export function drawBilayer(ctx: Ctx, p: Palette, width: number, gaps: { x: number; w: number }[] = [], seed = 7) {
  const r = rand(seed);
  const cy = MEMBRANE_HALF + BILAYER_PAD;
  const inGap = (x: number) => gaps.some((g) => Math.abs(x - g.x) < g.w / 2);
  const head: Tone = { light: p.hex['methylene-50'], base: p.hex['methylene-200'], rim: p.hex.methylene };
  const heads: { x: number; y: number; top: boolean }[] = [];
  for (let x = HEAD_STEP / 2; x < width; x += HEAD_STEP) {
    for (const top of [true, false]) {
      const hx = x + (r() - 0.5) * 1.6 + (top ? 0 : HEAD_STEP / 2);
      if (hx > width - 2 || inGap(hx)) continue;
      heads.push({ x: hx, y: top ? cy - MEMBRANE_HALF + HEAD_R : cy + MEMBRANE_HALF - HEAD_R, top });
    }
  }
  // tails first, under the heads
  ctx.save();
  ctx.lineCap = 'round';
  for (const h of heads) {
    const dir = h.top ? 1 : -1;
    for (const side of [-1, 1]) {
      const x0 = h.x + side * 2.2;
      const len = MEMBRANE_HALF - HEAD_R - 3 - r() * 3;
      const wig = 1.5 + r() * 1.2;
      ctx.strokeStyle = alpha(side < 0 ? p.hex.iodine : p.hex['iodine-deep'], side < 0 ? 0.55 : 0.4);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x0, h.y + dir * HEAD_R * 0.7);
      const steps = 4;
      for (let i = 1; i <= steps; i += 1) {
        const y = h.y + dir * (HEAD_R * 0.7 + (len * i) / steps);
        const x = x0 + (i % 2 ? wig : -wig) * (i === steps ? 0.4 : 1);
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }
  for (const h of heads) sphere(ctx, p, h.x, h.y, HEAD_R, head, false);
  ctx.restore();
}

// ── Gates ─────────────────────────────────────────────────────────────
/** Gate texture box: the bilayer plus room for proteins to stick out on both sides. */
export const GATE_PROTRUDE = 26;
export const gateHeight = () => 2 * (MEMBRANE_HALF + GATE_PROTRUDE);
/** Width of the bilayer gap under a protein gate (so its pore is open). */
export const PROTEIN_GAP: Partial<Record<Route, number>> = { canal: 66, pompa: 86 };

function roundRect(ctx: Ctx, x: number, y: number, w: number, h: number, r: number | number[]) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

/**
 * One transmembrane α-helix seen from the side: a shaded cylinder with faint helical turns.
 * Membrane proteins are drawn as bundles of these, the way textbook plates show them.
 */
function helix(ctx: Ctx, p: Palette, x: number, top: number, w: number, h: number, t: Tone) {
  ctx.save();
  ctx.fillStyle = alpha(p.hex.ink, 0.12);
  roundRect(ctx, x + 1.5, top + 2.5, w, h, w / 2);
  ctx.fill();
  const g = ctx.createLinearGradient(x, 0, x + w, 0);
  g.addColorStop(0, t.light);
  g.addColorStop(0.42, t.base);
  g.addColorStop(1, t.rim);
  ctx.fillStyle = g;
  roundRect(ctx, x, top, w, h, w / 2);
  ctx.fill();
  ctx.save();
  ctx.clip();
  ctx.strokeStyle = alpha(p.hex['paper-bright'], 0.38);
  ctx.lineWidth = 1.2;
  for (let y = top + 9; y < top + h - 6; y += 11) {
    ctx.beginPath();
    ctx.moveTo(x + 1, y + 3);
    ctx.quadraticCurveTo(x + w / 2, y - 3, x + w - 1, y + 3);
    ctx.stroke();
  }
  ctx.restore();
  ctx.lineWidth = 1.1;
  ctx.strokeStyle = alpha(p.hex.ink, 0.45);
  roundRect(ctx, x, top, w, h, w / 2);
  ctx.stroke();
  ctx.restore();
}

/** Helices side by side; each spec is [x offset, top offset, height] from the bundle's origin. */
function bundle(ctx: Ctx, p: Palette, ox: number, oy: number, w: number, specs: [number, number, number][], t: Tone) {
  // back row slightly darker, drawn first, so the bundle has depth
  specs.forEach(([dx, dy, hh], i) => {
    if (i % 2) helix(ctx, p, ox + dx, oy + dy, w, hh, { ...t, light: t.base });
  });
  specs.forEach(([dx, dy, hh], i) => {
    if (!(i % 2)) helix(ctx, p, ox + dx, oy + dy, w, hh, t);
  });
}

/** Draws a gate centred at (cx, cy) of a canvas; `width` is the gate's slot on the membrane. */
export function drawGate(ctx: Ctx, p: Palette, route: Route, cx: number, cy: number, width: number) {
  const h = p.hex;
  const bilayerH = MEMBRANE_HALF * 2;
  ctx.save();
  switch (route) {
    case 'dublu-strat': {
      // A framed window of plain bilayer: molecules slip between the lipids
      ctx.setLineDash([7, 5]);
      ctx.lineWidth = 2;
      ctx.strokeStyle = alpha(h.ink, 0.62);
      roundRect(ctx, cx - width / 2 + 6, cy - bilayerH / 2 - 9, width - 12, bilayerH + 18, 16);
      ctx.stroke();
      ctx.setLineDash([]);
      // two soft wave marks, the lipid-tail motif, in the frame's top corners
      ctx.strokeStyle = alpha(h['iodine-deep'], 0.7);
      ctx.lineWidth = 2;
      for (const s of [-1, 1]) {
        const x0 = cx + s * (width / 2 - 22);
        ctx.beginPath();
        ctx.moveTo(x0 - 7, cy - bilayerH / 2 - 17);
        ctx.quadraticCurveTo(x0 - 3.5, cy - bilayerH / 2 - 22, x0, cy - bilayerH / 2 - 17);
        ctx.quadraticCurveTo(x0 + 3.5, cy - bilayerH / 2 - 12, x0 + 7, cy - bilayerH / 2 - 17);
        ctx.stroke();
      }
      break;
    }
    case 'canal': {
      // A channel / carrier protein: two helix bundles lining an open, water-filled pore
      const hw = 12;
      const pore = 20;
      const top = cy - bilayerH / 2 - GATE_PROTRUDE + 8;
      const tall = bilayerH + 2 * (GATE_PROTRUDE - 8);
      const tone: Tone = { light: h['eosin-100'], base: h['eosin-200'], rim: h.eosin };
      bundle(ctx, p, cx - pore / 2 - 2 * hw + 2, top, hw, [[0, 4, tall - 6], [-8, 10, tall - 18], [hw - 2, 0, tall]], tone);
      bundle(ctx, p, cx + pore / 2 - 2, top, hw, [[0, 0, tall], [hw + 6, 10, tall - 18], [hw - 2, 5, tall - 8]], tone);
      break;
    }
    case 'pompa': {
      // A bulky pump: a wide helix bundle across the bilayer, and a round cytoplasmic domain with the
      // ATP-binding pocket (the energy comes in from the cytoplasm side)
      const hw = 13;
      const top = cy - bilayerH / 2 - GATE_PROTRUDE + 6;
      const tall = bilayerH + GATE_PROTRUDE;
      const tone: Tone = { light: h['iodine-100'], base: h['iodine-200'], rim: h.iodine };
      const domainY = cy + bilayerH / 2 + GATE_PROTRUDE * 0.55;
      // cytoplasmic domain behind the helices
      ctx.fillStyle = alpha(h.ink, 0.12);
      ctx.beginPath();
      ctx.ellipse(cx + 2, domainY + 3, 38, 17, 0, 0, Math.PI * 2);
      ctx.fill();
      const g = ctx.createRadialGradient(cx - 12, domainY - 8, 3, cx, domainY, 40);
      g.addColorStop(0, h['iodine-100']);
      g.addColorStop(0.6, h['iodine-200']);
      g.addColorStop(1, h.iodine);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(cx, domainY, 38, 17, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = alpha(h.ink, 0.45);
      ctx.stroke();
      bundle(
        ctx,
        p,
        cx - 3 * hw,
        top,
        hw,
        [[0, 8, tall - 14], [hw - 3, 2, tall - 4], [2 * hw - 4, 0, tall], [3 * hw - 2, 3, tall - 6], [4 * hw - 5, 1, tall - 2], [5 * hw - 6, 9, tall - 16]],
        tone,
      );
      // ATP pocket in the domain
      ctx.fillStyle = h['paper-bright'];
      ctx.strokeStyle = alpha(h['iodine-deep'], 0.85);
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(cx + 16, domainY + 17, 8, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }
    case 'blocat': {
      // A closed, hatched stretch: the bilayer that won't let these through on their own
      const w = width - 16;
      const top = cy - bilayerH / 2 - 8;
      const tall = bilayerH + 16;
      const chamfer = 14;
      ctx.beginPath();
      ctx.moveTo(cx - w / 2 + chamfer, top);
      ctx.lineTo(cx + w / 2 - chamfer, top);
      ctx.lineTo(cx + w / 2, top + chamfer);
      ctx.lineTo(cx + w / 2, top + tall - chamfer);
      ctx.lineTo(cx + w / 2 - chamfer, top + tall);
      ctx.lineTo(cx - w / 2 + chamfer, top + tall);
      ctx.lineTo(cx - w / 2, top + tall - chamfer);
      ctx.lineTo(cx - w / 2, top + chamfer);
      ctx.closePath();
      ctx.fillStyle = alpha(h['paper-deep'], 0.94);
      ctx.fill();
      ctx.save();
      ctx.clip();
      ctx.strokeStyle = alpha(h['ink-soft'], 0.3);
      ctx.lineWidth = 1.4;
      for (let x = cx - w; x < cx + w; x += 9) {
        ctx.beginPath();
        ctx.moveTo(x, top + tall);
        ctx.lineTo(x + tall, top);
        ctx.stroke();
      }
      ctx.restore();
      ctx.lineWidth = 2.2;
      ctx.strokeStyle = alpha(h.ink, 0.7);
      ctx.stroke();
      // the "no entry" sign: a ring with a slash, on a paper disc
      ctx.fillStyle = h['paper-bright'];
      ctx.beginPath();
      ctx.arc(cx, cy, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = h['ink-soft'];
      ctx.lineWidth = 3.4;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - 9.5, cy + 9.5);
      ctx.lineTo(cx + 9.5, cy - 9.5);
      ctx.stroke();
      break;
    }
  }
  ctx.restore();
}
