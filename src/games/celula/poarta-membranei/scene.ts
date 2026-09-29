// "Poarta membranei" gameplay. One scene runs the whole game: molecule waves at the membrane, and the
// osmosis events between them (the membrane view fades out, the red cell fades in).
//
// Scene rules (GAME-DEV.md): logical coordinates only (DESIGN), palette colours only, bus events to
// the shell (hit / miss / life-lost / score / near-win / recap / finished), the game-specific link
// for the DOM strip. init() resets everything: the shell's restart reuses this instance.
import * as Phaser from 'phaser';
import { BaseScene } from '../../phaser/BaseScene';
import { multiplierFor } from '../../core/scoring';
import type { RecapItem } from '../../core/types';
import { moleculesFor, type MembraneMode, type ModeRule, type MoleculeSituation } from '../../../content/ro/membrane-molecules';
import {
  ATP,
  BREAK_MS,
  DESIGN,
  FAILS_BEFORE_HELP,
  GATE_REACH,
  HELP_MS,
  HELP_SLOWDOWN,
  MEMBRANE_HALF,
  MEMBRANE_Y,
  MIN_HIT,
  OSMOSIS_DAMAGE_S,
  OSMOSIS_EVENTS,
  OSMOSIS_LAYOUT,
  OSMOSIS_POINTS_PER_S,
  OSMOSIS_STEP,
  POINTS,
  SCHEDULE,
  gatesFor,
  type GateLayout,
  type OsmosisEvent,
  type WaveConfig,
} from './config';
import {
  BILAYER_PAD,
  CUE,
  GATE_PROTRUDE,
  MOLECULE_RADIUS,
  PROTEIN_GAP,
  drawBilayer,
  drawChip,
  drawCue,
  drawGate,
  drawMolecule,
  gateHeight,
  measureChip,
} from './art';
import { OSMOSIS, adjustOutside, stepVolume, tonicity, volumeRate, volumeZone } from './osmosisModel';
import type { MembraneLink, PhaseInfo } from './link';

type TokenState = 'drift' | 'drag' | 'routing' | 'done';

interface Token {
  uid: number;
  m: MoleculeSituation;
  rule: ModeRule;
  box: Phaser.GameObjects.Container;
  mol: Phaser.GameObjects.Image;
  /** The molecule image's resting scale; every squash tween returns to it. */
  base: number;
  radius: number;
  /** +1 drifts down (from the exterior), −1 drifts up (from the cytoplasm). */
  dir: 1 | -1;
  laneX: number;
  speed: number;
  phase: number;
  state: TokenState;
}

interface Ripple {
  x: number;
  t0: number;
  amp: number;
}

const SLICE = 20;
const CHIP_PX = 22;
const FLOAT_FONT = '28px';
const GATE_CY = gateHeight() / 2 + 4;

/** The scene class is bound to a mode and a link by MembraneGame (see membraneScenes()). */
export class MembraneScene extends BaseScene {
  private readonly mode: MembraneMode;
  private readonly link: MembraneLink;
  private gates: GateLayout[] = [];
  private pool: MoleculeSituation[] = [];
  /** Logical size of each baked formula chip (textures outlive a restart; sizes are re-measured). */
  private chipSizes = new Map<string, { w: number; h: number }>();

  // ── per-run state (reset in init) ──
  private clock = 0;
  private phaseIndex = -1;
  private phaseKind: 'wave' | 'osmosis' | 'break' | 'done' = 'break';
  private wave: WaveConfig | null = null;
  private bag: MoleculeSituation[] = [];
  private spawned = 0;
  private spawnClock = 0;
  private tokens: Token[] = [];
  private uid = 0;
  private selected: Token | null = null;
  private keyboardUsed = false;
  private fails = 0;
  private slowUntil = 0;
  private tutorialToken: Token | null = null;
  private tutorialDone = false;
  private streak = 0;
  private misses = new Map<string, number>();
  private nearWinSent = false;
  private finished = false;
  private atp = ATP.start;
  private atpClock = 0;
  private ripples: Ripple[] = [];
  // osmosis
  private osm: { event: OsmosisEvent; t: number; step: number; volume: number; cOut: number; inBand: number; outside: number; lastInfo: number } | null = null;
  private cellScale = 1;
  private cellVel = 0;
  private waterClock = 0;

  // ── display objects (rebuilt in create) ──
  private slices: Phaser.GameObjects.Image[] = [];
  private gateImages: Phaser.GameObjects.Image[] = [];
  private membraneLayer!: Phaser.GameObjects.Container;
  private tokenLayer!: Phaser.GameObjects.Container;
  private fxLayer!: Phaser.GameObjects.Container;
  private osmosisLayer!: Phaser.GameObjects.Container;
  private selRing!: Phaser.GameObjects.Graphics;
  private hoverGlow!: Phaser.GameObjects.Graphics;
  private hintGlow!: Phaser.GameObjects.Graphics;
  private hintGate: GateLayout | null = null;
  private hintUntil = 0;
  private atpIcon: Phaser.GameObjects.Container | null = null;
  private atpPips: Phaser.GameObjects.Graphics | null = null;
  private mito: Phaser.GameObjects.Container | null = null;
  private cells: { normal: Phaser.GameObjects.Container; crenat: Phaser.GameObjects.Container; liza: Phaser.GameObjects.Container } | null = null;
  private gauge!: Phaser.GameObjects.Graphics;
  private solute: Phaser.GameObjects.Arc[] = [];
  private water: { img: Phaser.GameObjects.Image; angle: number; r: number; alive: boolean }[] = [];

  constructor(mode: MembraneMode, link: MembraneLink) {
    super('poarta-membranei');
    this.mode = mode;
    this.link = link;
  }

  init() {
    this.gates = gatesFor(this.mode);
    this.pool = moleculesFor(this.mode);
    this.clock = 0;
    this.phaseIndex = -1;
    this.phaseKind = 'break';
    this.wave = null;
    this.bag = [];
    this.spawned = 0;
    this.spawnClock = 0;
    this.tokens = [];
    this.selected = null;
    this.keyboardUsed = false;
    this.fails = 0;
    this.slowUntil = 0;
    this.tutorialToken = null;
    this.tutorialDone = false;
    this.streak = 0;
    this.misses = new Map();
    this.nearWinSent = false;
    this.finished = false;
    this.atp = ATP.start;
    this.atpClock = 0;
    this.ripples = [];
    this.osm = null;
    this.cellScale = 1;
    this.cellVel = 0;
    this.waterClock = 0;
    this.slices = [];
    this.gateImages = [];
    this.hintGate = null;
    this.hintUntil = 0;
    this.atpIcon = null;
    this.atpPips = null;
    this.mito = null;
    this.cells = null;
    this.solute = [];
    this.water = [];
  }

  preload() {
    this.loadSprites(['eritrocit', 'eritrocit-crenat', 'eritrocit-liza'], 240);
    if (this.mode === 'avansat') this.loadSprites(['mitocondrie', 'atp'], 100);
  }

  create() {
    this.setupView();
    this.input.dragDistanceThreshold = 8;
    this.bakeTextures();
    this.drawBackground();

    this.membraneLayer = this.add.container(0, 0).setDepth(1);
    this.buildMembrane();
    this.tokenLayer = this.add.container(0, 0).setDepth(5);
    this.fxLayer = this.add.container(0, 0).setDepth(8);
    this.osmosisLayer = this.add.container(0, 0).setDepth(3).setAlpha(0).setVisible(false);
    this.buildOsmosis();
    if (this.mode === 'avansat') this.buildAtp();

    this.selRing = this.add.graphics().setDepth(6);
    this.hoverGlow = this.add.graphics().setDepth(1.4);
    this.hintGlow = this.add.graphics().setDepth(1.5);

    this.setupInput();
    const offs = [
      this.link.on('hint', () => this.showHint()),
      this.link.on('adjust', ({ dir }) => this.adjust(dir)),
    ];
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => offs.forEach((off) => off()));

    this.link.emit('ready', {});
    this.emitAtp();
    this.nextPhase();
  }

  // ═══════════════════════════ Textures ═══════════════════════════

  /** Bakes a Canvas-2D drawing into a texture at device resolution, once per game. */
  private bake(key: string, w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void) {
    if (this.textures.exists(key)) return key;
    const dpr = this.bridge.dpr;
    const tex = this.textures.createCanvas(key, Math.ceil(w * dpr), Math.ceil(h * dpr));
    if (!tex) throw new Error(`[membrane] could not create texture ${key}`);
    const ctx = tex.getContext();
    ctx.scale(dpr, dpr);
    draw(ctx);
    tex.refresh();
    return key;
  }

  private img(x: number, y: number, key: string, w: number, h: number, frame?: string) {
    return this.add.image(x, y, key, frame).setDisplaySize(w, h);
  }

  private bakeTextures() {
    const p = this.palette;
    const bh = 2 * (MEMBRANE_HALF + BILAYER_PAD);
    const gaps = this.gates.filter((g) => PROTEIN_GAP[g.route]).map((g) => ({ x: g.x, w: PROTEIN_GAP[g.route]! }));
    const bilayerKey = `pm-bilayer-${this.mode}`;
    this.bake(bilayerKey, DESIGN.width, bh, (ctx) => drawBilayer(ctx, p, DESIGN.width, gaps));
    const tex = this.textures.get(bilayerKey);
    const dpr = tex.source[0].width / DESIGN.width;
    for (let i = 0; i * SLICE < DESIGN.width; i += 1) {
      const name = `s${i}`;
      if (!tex.has(name)) tex.add(name, 0, Math.floor(i * SLICE * dpr), 0, Math.ceil(SLICE * dpr), tex.source[0].height);
    }
    for (const g of this.gates) {
      this.bake(`pm-gate-${g.route}-${g.width}`, g.width + 20, gateHeight() + 8, (ctx) => drawGate(ctx, p, g.route, (g.width + 20) / 2, GATE_CY, g.width));
    }
    const measure = document.createElement('canvas').getContext('2d')!;
    for (const m of this.pool) {
      const r = MOLECULE_RADIUS[m.species];
      const s = 2 * r + 18;
      this.bake(`pm-mol-${m.species}`, s, s, (ctx) => {
        ctx.translate(s / 2, s / 2);
        drawMolecule(ctx, p, m.species);
      });
      const size = measureChip(measure, p, m.formula, CHIP_PX);
      this.chipSizes.set(m.formula, { w: size.width + 4, h: size.height + 4 });
      this.bake(`pm-chip-${m.formula}`, size.width + 4, size.height + 4, (ctx) => drawChip(ctx, p, m.formula, CHIP_PX, (size.width + 4) / 2, (size.height + 4) / 2));
      this.bake(`pm-cue-${m.higher}-${m.from}-${m.species}`, CUE.width, CUE.height, (ctx) => drawCue(ctx, p, m.higher, m.from, this.dotColor(m)));
    }
    const w = 2 * MOLECULE_RADIUS.H2O + 14;
    this.bake('pm-mol-H2O', w, w, (ctx) => {
      ctx.translate(w / 2, w / 2);
      drawMolecule(ctx, p, 'H2O');
    });
  }

  private dotColor(m: MoleculeSituation) {
    const h = this.palette.hex;
    return { O2: h['eosin-deep'], CO2: h.ink, glucoza: h['ink-soft'], Na: h.iodine, K: h.methylene, proteina: h.eosin }[m.species];
  }

  // ═══════════════════════════ Static scenery ═══════════════════════════

  private drawBackground() {
    const { num } = this.palette;
    const g = this.add.graphics().setDepth(0);
    // cytoplasm: a warm wash below the membrane; extracellular fluid stays paper
    g.fillStyle(num['iodine-100'], 0.42);
    g.fillRect(0, MEMBRANE_Y, DESIGN.width, DESIGN.height - MEMBRANE_Y);
    g.fillStyle(num['methylene-50'], 0.55);
    g.fillRect(0, 0, DESIGN.width, MEMBRANE_Y);
    // notebook grid
    g.lineStyle(1, num['methylene-100'], 0.7);
    for (let x = 28; x < DESIGN.width; x += 28) g.lineBetween(x, 0, x, DESIGN.height);
    for (let y = 28; y < DESIGN.height; y += 28) g.lineBetween(0, y, DESIGN.width, y);
  }

  private buildMembrane() {
    const bh = 2 * (MEMBRANE_HALF + BILAYER_PAD);
    const key = `pm-bilayer-${this.mode}`;
    for (let i = 0; i * SLICE < DESIGN.width; i += 1) {
      const s = this.img(i * SLICE + SLICE / 2, MEMBRANE_Y, key, SLICE + 0.6, bh, `s${i}`);
      this.slices.push(s);
      this.membraneLayer.add(s);
    }
    for (const g of this.gates) {
      const image = this.img(g.x, MEMBRANE_Y, `pm-gate-${g.route}-${g.width}`, g.width + 20, gateHeight() + 8);
      image.y = MEMBRANE_Y + (gateHeight() + 8) / 2 - GATE_CY;
      this.gateImages.push(image);
      this.membraneLayer.add(image);
      // tap target: the gate's slot on the membrane, generously tall
      const zone = this.add.zone(g.x, MEMBRANE_Y, Math.max(g.width, MIN_HIT), GATE_REACH * 2).setInteractive({ useHandCursor: true });
      zone.on('pointerup', () => {
        if (this.selected && this.selected.state === 'drift') this.route(this.selected, g);
      });
      zone.on('pointerover', () => this.drawGlow(this.hoverGlow, g, 'hover'));
      zone.on('pointerout', () => this.hoverGlow.clear());
    }
  }

  // ═══════════════════════════ Input ═══════════════════════════

  private setupInput() {
    const kb = this.input.keyboard;
    if (kb) {
      const K = Phaser.Input.Keyboard.KeyCodes;
      kb.addCapture([K.TAB, K.LEFT, K.RIGHT, K.UP, K.DOWN]);
      kb.on('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Escape') return; // the shell pauses
        this.keyboardUsed = true;
        const k = e.key.toLowerCase();
        if (e.key === 'Tab') this.cycle(e.shiftKey ? -1 : 1);
        else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') this.cycle(1);
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') this.cycle(-1);
        else if (/^[1-4]$/.test(e.key)) {
          const gate = this.gates.find((g) => g.key === Number(e.key));
          if (gate) {
            if (!this.selected || this.selected.state !== 'drift') this.select(this.mostUrgent());
            if (this.selected && this.selected.state === 'drift') this.route(this.selected, gate);
          }
        } else if (k === 'h') this.showHint();
        else if (k === 's') this.adjust(1);
        else if (k === 'd') this.adjust(-1);
      });
    }
    this.input.on('dragstart', (_p: Phaser.Input.Pointer, obj: Phaser.GameObjects.Container) => {
      const t = this.tokenOf(obj);
      if (!t || t.state !== 'drift') return;
      t.state = 'drag';
      this.select(t);
      t.box.setDepth(10);
      this.tokenLayer.bringToTop(t.box);
      this.squash(t, 1.14, 0.88, 110);
    });
    this.input.on('drag', (_p: Phaser.Input.Pointer, obj: Phaser.GameObjects.Container, x: number, y: number) => {
      const t = this.tokenOf(obj);
      if (!t || t.state !== 'drag') return;
      t.box.setPosition(x, y);
      const g = this.gateAt(x, y);
      if (g) this.drawGlow(this.hoverGlow, g, 'hover');
      else this.hoverGlow.clear();
    });
    this.input.on('dragend', (pointer: Phaser.Input.Pointer, obj: Phaser.GameObjects.Container) => {
      const t = this.tokenOf(obj);
      this.hoverGlow.clear();
      if (!t || t.state !== 'drag') return;
      const g = this.gateAt(pointer.worldX, pointer.worldY) ?? this.gateAt(t.box.x, t.box.y);
      t.state = 'drift';
      if (g) {
        this.route(t, g);
        return;
      }
      // Dropped elsewhere: back on its own side, and it keeps drifting from there
      t.laneX = Phaser.Math.Clamp(t.box.x, 40, DESIGN.width - 70);
      const limit = MEMBRANE_Y - t.dir * (MEMBRANE_HALF + t.radius + 60);
      const y = t.dir > 0 ? Math.min(t.box.y, limit) : Math.max(t.box.y, limit);
      this.tweens.add({ targets: t.box, y, duration: 320, ease: 'Back.Out' });
    });
  }

  private tokenOf(obj: Phaser.GameObjects.GameObject) {
    return this.tokens.find((t) => t.box === obj) ?? null;
  }

  private gateAt(x: number, y: number) {
    if (Math.abs(y - MEMBRANE_Y) > GATE_REACH) return null;
    return this.gates.find((g) => Math.abs(x - g.x) <= Math.max(g.width, MIN_HIT) / 2) ?? null;
  }

  private live() {
    return this.tokens.filter((t) => t.state === 'drift' || t.state === 'drag');
  }

  /** The drifting molecule closest to the membrane. */
  private mostUrgent(): Token | null {
    let best: Token | null = null;
    for (const t of this.live()) {
      if (!best || this.distanceToMembrane(t) < this.distanceToMembrane(best)) best = t;
    }
    return best;
  }

  private distanceToMembrane(t: Token) {
    return Math.abs(t.box.y - MEMBRANE_Y) - MEMBRANE_HALF - t.radius;
  }

  private cycle(step: 1 | -1) {
    const list = this.live().sort((a, b) => a.box.x - b.box.x);
    if (!list.length) return this.select(null);
    const i = this.selected ? list.indexOf(this.selected) : -1;
    const next = i === -1 ? (step > 0 ? this.mostUrgent() : list[list.length - 1]) : list[(i + step + list.length) % list.length];
    this.select(next);
  }

  private select(t: Token | null) {
    if (this.selected === t) return;
    this.selected = t;
    this.link.emit('select', { id: t?.m.id ?? null, uid: t?.uid ?? null });
    if (t) this.squash(t, 1.12, 1.12, 120);
  }

  // ═══════════════════════════ Phases ═══════════════════════════

  private phaseInfo(): PhaseInfo {
    const schedule = SCHEDULE[this.mode];
    const waves = schedule.filter((p) => p.kind === 'wave').length;
    const waveNumber = schedule.slice(0, this.phaseIndex + 1).filter((p) => p.kind === 'wave').length;
    const phase = schedule[this.phaseIndex];
    if (this.phaseKind === 'done') return { kind: 'done' };
    if (this.phaseKind === 'break') {
      const next = schedule[this.phaseIndex + 1];
      return { kind: 'break', next: next ? next.kind : 'end', waveNumber: waveNumber + (next?.kind === 'wave' ? 1 : 0), waves };
    }
    if (phase.kind === 'osmosis') return { kind: 'osmosis', index: this.phaseIndex, total: schedule.length };
    return { kind: 'wave', index: this.phaseIndex, total: schedule.length, waveNumber, waves };
  }

  private nextPhase() {
    if (this.finished) return;
    const schedule = SCHEDULE[this.mode];
    this.phaseKind = 'break';
    this.link.emit('phase', this.phaseInfo());
    this.time.delayedCall(this.phaseIndex < 0 ? 900 : BREAK_MS, () => {
      this.phaseIndex += 1;
      const phase = schedule[this.phaseIndex];
      if (!phase) return this.finish();
      if (phase.kind === 'wave') this.startWave(phase.wave);
      else this.startOsmosis(OSMOSIS_EVENTS[phase.event]);
      this.link.emit('phase', this.phaseInfo());
    });
  }

  private startWave(wave: WaveConfig) {
    this.phaseKind = 'wave';
    this.wave = wave;
    this.spawned = 0;
    this.spawnClock = wave.spawnMs * 0.75;
    // Even mix: every situation of the mode, reshuffled, until the count is reached
    const bag: MoleculeSituation[] = [];
    while (bag.length < wave.count) bag.push(...Phaser.Utils.Array.Shuffle([...this.pool]));
    this.bag = bag.slice(0, wave.count);
    if (wave.tutorial) {
      const first = this.bag.findIndex((m) => m.id === 'oxigen');
      if (first > 0) [this.bag[0], this.bag[first]] = [this.bag[first], this.bag[0]];
    }
  }

  private waveOver() {
    return this.phaseKind === 'wave' && this.wave !== null && this.spawned >= this.wave.count && this.tokens.every((t) => t.state === 'done');
  }

  private finish() {
    if (this.finished) return;
    this.finished = true;
    this.phaseKind = 'done';
    this.link.emit('phase', { kind: 'done' });
    this.time.delayedCall(700, () => this.emit('finished', { outcome: 'won', recap: this.recap() }));
  }

  // ═══════════════════════════ Update ═══════════════════════════

  update(_time: number, deltaMs: number) {
    const dt = Math.min(deltaMs, 100) / 1000;
    this.clock += dt;
    this.updateMembrane();

    if (this.phaseKind === 'wave' && this.wave) this.updateWave(dt, this.wave);
    if (this.phaseKind === 'osmosis' && this.osm) this.updateOsmosis(dt);
    if (this.mode === 'avansat') this.updateAtp(dt);
    this.updateRing();
    this.updateHint();
  }

  private slow() {
    return this.clock < this.slowUntil ? HELP_SLOWDOWN : 1;
  }

  private updateWave(dt: number, wave: WaveConfig) {
    const slow = this.slow();
    this.spawnClock += dt * 1000 * slow;
    const alive = this.live().length;
    const tutorialHold = wave.tutorial && this.tutorialToken && this.tutorialToken.state !== 'done';
    if (this.spawned < wave.count && alive < wave.maxAlive && !tutorialHold && this.spawnClock >= wave.spawnMs) {
      this.spawnClock = 0;
      this.spawn(this.bag[this.spawned], wave);
    }
    for (const t of this.tokens) {
      if (t.state !== 'drift') continue;
      t.box.y += t.dir * t.speed * slow * dt;
      if (!this.reducedMotion) {
        t.box.x = t.laneX + Math.sin(this.clock * 0.8 + t.phase) * 6;
        t.mol.rotation = Math.sin(this.clock * 0.6 + t.phase) * 0.12;
      }
      if (this.distanceToMembrane(t) <= 2) this.late(t);
    }
    this.tokens = this.tokens.filter((t) => t.state !== 'done' || t.box.active);
    if (this.waveOver()) {
      this.wave = null;
      this.nextPhase();
    }
    const lastWave = !SCHEDULE[this.mode].slice(this.phaseIndex + 1).some((p) => p.kind === 'wave');
    if (lastWave && !this.nearWinSent && this.spawned >= wave.count * 0.7) {
      this.nearWinSent = true;
      this.emit('near-win', {});
    }
  }

  // ═══════════════════════════ Tokens ═══════════════════════════

  private spawn(m: MoleculeSituation, wave: WaveConfig) {
    this.spawned += 1;
    const rule = m.modes[this.mode]!;
    const r = MOLECULE_RADIUS[m.species];
    const dir: 1 | -1 = m.from === 'exterior' ? 1 : -1;
    const y = dir > 0 ? -r - 34 : DESIGN.height + r + 10;
    // A lane away from other molecules on the same side
    let x = 0;
    for (let tries = 0; tries < 8; tries += 1) {
      x = Phaser.Math.Between(56, DESIGN.width - 56 - CUE.width);
      if (this.live().every((t) => t.dir !== dir || Math.abs(t.laneX - x) > 110 || Math.abs(t.box.y - y) > 150)) break;
    }

    const box = this.add.container(x, y);
    const molKey = `pm-mol-${m.species}`;
    const molSize = 2 * r + 18;
    const mol = this.img(0, 0, molKey, molSize, molSize);
    const { w: chipW, h: chipH } = this.chipSizes.get(m.formula)!;
    const chip = this.img(0, r + chipH / 2 + 4, `pm-chip-${m.formula}`, chipW, chipH);
    const cue = this.img(Math.max(r, chipW / 2) + 6 + CUE.width / 2, 2, `pm-cue-${m.higher}-${m.from}-${m.species}`, CUE.width, CUE.height);
    box.add([mol, chip, cue]);

    // Hit area: molecule, chip and cue, never smaller than MIN_HIT (≥ 44 CSS px on a phone)
    const left = -Math.max(r, chipW / 2) - 8;
    const right = cue.x + CUE.width / 2 + 6;
    const top = -r - 8;
    const bottom = r + chipH + 10;
    const w = Math.max(MIN_HIT, right - left);
    const h = Math.max(MIN_HIT, bottom - top);
    const S = 2 * Math.max(w, h);
    box.setSize(S, S);
    const cx = (left + right) / 2;
    const cy = (top + bottom) / 2;
    box.setInteractive(new Phaser.Geom.Rectangle(S / 2 + cx - w / 2, S / 2 + cy - h / 2, w, h), Phaser.Geom.Rectangle.Contains);
    this.input.setDraggable(box);
    if (this.input.manager.canvas) box.input!.cursor = 'grab';

    const token: Token = {
      uid: ++this.uid,
      m,
      rule,
      box,
      mol,
      base: mol.scaleX,
      radius: r,
      dir,
      laneX: x,
      speed: Phaser.Math.FloatBetween(...wave.speed),
      phase: Math.random() * Math.PI * 2,
      state: 'drift',
    };
    box.on('pointerup', () => {
      if (token.state === 'drift') this.select(token);
    });
    this.tokens.push(token);
    this.tokenLayer.add(box);
    if (!this.reducedMotion) {
      box.setScale(0.7);
      this.tweens.add({ targets: box, scale: 1, duration: 480, ease: 'Back.Out' });
    }
    if (wave.tutorial && !this.tutorialDone && !this.tutorialToken) {
      this.tutorialToken = token;
      this.link.emit('notice', { key: 'tutorial' });
    }
    if (!this.selected && this.keyboardUsed) this.select(this.mostUrgent());
  }

  /** Spring-like squash and back to the resting scale (nothing under reduced motion). */
  private squash(t: Token, sx: number, sy: number, ms: number) {
    if (this.reducedMotion) return;
    this.tweens.killTweensOf(t.mol);
    t.mol.setScale(t.base);
    this.tweens.add({
      targets: t.mol,
      scaleX: t.base * sx,
      scaleY: t.base * sy,
      duration: ms,
      yoyo: true,
      ease: 'Back.Out',
      onComplete: () => t.mol.setScale(t.base),
    });
  }

  private resolve(t: Token) {
    t.state = 'routing';
    t.box.disableInteractive();
    if (this.selected === t) this.select(null);
    if (this.tutorialToken === t) {
      this.tutorialToken = null;
      this.tutorialDone = true;
    }
  }

  private afterResolve() {
    // Keyboard players flow on to the next molecule
    if (this.keyboardUsed && !this.selected) this.select(this.mostUrgent());
  }

  private remove(t: Token, delay = 0) {
    this.tweens.add({
      targets: t.box,
      alpha: 0,
      delay,
      duration: 420,
      ease: 'Cubic.Out',
      onComplete: () => {
        t.state = 'done';
        t.box.destroy();
      },
    });
  }

  private entryY(t: Token) {
    return MEMBRANE_Y - t.dir * (MEMBRANE_HALF + t.radius + 8);
  }

  private route(t: Token, gate: GateLayout) {
    if (t.state !== 'drift' || this.finished) return;
    this.resolve(t);
    this.tweens.add({
      targets: t.box,
      x: gate.x,
      y: this.entryY(t),
      duration: this.reducedMotion ? 160 : 300,
      ease: 'Back.Out',
      onComplete: () => this.judge(t, gate),
    });
    this.afterResolve();
  }

  private judge(t: Token, gate: GateLayout) {
    const correct = gate.route === t.rule.route;
    const at = { x: gate.x, y: MEMBRANE_Y - t.dir * MEMBRANE_HALF };
    if (correct && gate.route === 'pompa') {
      if (this.atp < ATP.cost) return this.failure(t, gate, 'no-atp');
      this.atp -= ATP.cost;
      this.emitAtp();
      this.spendAtpFx(gate);
    }
    if (!correct) return this.failure(t, gate, 'wrong');

    this.fails = 0;
    this.streak += 1;
    this.emit('hit', { points: POINTS, at });
    this.link.emit('correct', { id: t.m.id });
    this.floatText(`+${POINTS * multiplierFor(this.streak)}`, at.x, at.y - t.dir * 30, this.palette.hex['methylene-deep']);

    if (gate.route === 'blocat') {
      // Turned back: a small bump against the closed stretch, then away
      this.ripple(gate.x, 3);
      this.tweens.add({ targets: t.box, y: t.box.y - t.dir * 70, duration: 520, ease: 'Back.Out' });
      this.remove(t, 260);
      return;
    }
    // Across: squeeze between the lipids, or through the pore / pump
    const exitY = MEMBRANE_Y + t.dir * (MEMBRANE_HALF + t.radius + 46);
    this.ripple(gate.x, gate.route === 'dublu-strat' ? 5 : 3.5);
    this.sparkle(gate.x, MEMBRANE_Y, t.dir);
    if (gate.route === 'dublu-strat') this.squash(t, 0.72, 1.16, 260);
    if (gate.route === 'pompa' && !this.reducedMotion) {
      const img = this.gateImages[this.gates.indexOf(gate)];
      this.tweens.add({ targets: img, scaleY: img.scaleY * 1.05, duration: 140, yoyo: true, ease: 'Back.Out' });
    }
    this.tweens.add({ targets: t.box, y: exitY, duration: this.reducedMotion ? 300 : 760, ease: 'Back.Out' });
    this.remove(t, 520);
  }

  private failure(t: Token, gate: GateLayout, kind: 'wrong' | 'no-atp') {
    this.streak = 0;
    this.fails += 1;
    if (kind === 'wrong') this.countMiss(t.m);
    const at = { x: gate.x, y: MEMBRANE_Y };
    this.link.emit('explain', { id: t.m.id, kind });
    // The recap goes first: losing the last life ends the run inside life-lost
    this.emit('recap', { items: this.recap() });
    this.emit('life-lost', { at });
    this.damageFx(gate.x);
    this.floatText('−1', at.x, at.y - t.dir * 34, this.palette.hex['eosin-deep']);
    this.tweens.add({ targets: t.box, y: t.box.y - t.dir * 60, angle: this.reducedMotion ? 0 : 18 * t.dir, duration: 480, ease: 'Back.Out' });
    this.remove(t, 300);
    this.adaptiveHelp();
  }

  /** Reached the membrane before the player routed it: a miss (streak), no damage. */
  private late(t: Token) {
    this.resolve(t);
    this.streak = 0;
    this.fails += 1;
    this.countMiss(t.m);
    this.link.emit('explain', { id: t.m.id, kind: 'late' });
    this.emit('recap', { items: this.recap() });
    this.emit('miss', { at: { x: t.box.x, y: t.box.y } });
    this.ripple(t.box.x, 2);
    this.tweens.add({ targets: t.box, y: t.box.y - t.dir * 36, duration: 420, ease: 'Back.Out' });
    this.remove(t, 200);
    this.adaptiveHelp();
    this.afterResolve();
  }

  private adaptiveHelp() {
    if (this.fails < FAILS_BEFORE_HELP) return;
    this.fails = 0;
    this.slowUntil = this.clock + HELP_MS / 1000;
    this.link.emit('notice', { key: 'slow' });
  }

  private countMiss(m: MoleculeSituation) {
    this.misses.set(m.id, (this.misses.get(m.id) ?? 0) + 1);
  }

  /** Up to 3 "Ce ai învățat" items: the most-missed situations, with their explanation. */
  private recap(): RecapItem[] {
    return [...this.misses.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id]) => {
        const m = this.pool.find((x) => x.id === id)!;
        return { title: `${m.name}, ${m.situation}`, text: m.modes[this.mode]!.explanation };
      });
  }

  // ═══════════════════════════ Hint and highlights ═══════════════════════════

  private showHint() {
    if (this.phaseKind !== 'wave') return;
    const t = this.selected && this.selected.state === 'drift' ? this.selected : this.mostUrgent();
    if (!t) {
      this.link.emit('notice', { key: 'hint-none' });
      return;
    }
    this.select(t);
    this.hintGate = this.gates.find((g) => g.route === t.rule.route) ?? null;
    this.hintUntil = this.clock + 3;
    this.link.emit('hint-used', {});
  }

  private updateHint() {
    const tutorial = this.tutorialToken && this.tutorialToken.state !== 'done' ? this.tutorialToken : null;
    const gate = tutorial ? this.gates.find((g) => g.route === tutorial.rule.route) ?? null : this.clock < this.hintUntil ? this.hintGate : null;
    this.hintGlow.clear();
    if (!gate) return;
    const pulse = this.reducedMotion ? 1 : 0.65 + 0.35 * Math.sin(this.clock * 5);
    this.drawGlow(this.hintGlow, gate, 'hint', pulse);
  }

  private drawGlow(g: Phaser.GameObjects.Graphics, gate: GateLayout, kind: 'hover' | 'hint', strength = 1) {
    const { num } = this.palette;
    const w = gate.width - 2;
    const h = 2 * (MEMBRANE_HALF + GATE_PROTRUDE) + 14;
    g.clear();
    if (kind === 'hover') {
      g.fillStyle(num['paper-bright'], 0.3);
      g.fillRoundedRect(gate.x - w / 2, MEMBRANE_Y - h / 2, w, h, 18);
      g.lineStyle(2, num.ink, 0.35);
      g.strokeRoundedRect(gate.x - w / 2, MEMBRANE_Y - h / 2, w, h, 18);
      return;
    }
    g.fillStyle(num['methylene-100'], 0.35 * strength);
    g.fillRoundedRect(gate.x - w / 2, MEMBRANE_Y - h / 2, w, h, 18);
    g.lineStyle(3, num['methylene-deep'], strength);
    g.strokeRoundedRect(gate.x - w / 2, MEMBRANE_Y - h / 2, w, h, 18);
  }

  private updateRing() {
    const r = this.selRing;
    r.clear();
    const t = this.selected;
    if (!t || (t.state !== 'drift' && t.state !== 'drag')) return;
    const { num } = this.palette;
    const R = t.radius + 13;
    r.setPosition(t.box.x, t.box.y);
    r.lineStyle(3, num.ink, 0.9);
    r.strokeCircle(0, 0, R);
    r.lineStyle(2, num.eosin, 1);
    r.strokeCircle(0, 0, R - 5);
    for (const [x1, y1, x2, y2] of [[-R - 9, 0, -R + 8, 0], [0, -R - 9, 0, -R + 8]]) r.lineBetween(x1, y1, x2, y2);
  }

  // ═══════════════════════════ Membrane motion and effects ═══════════════════════════

  private ripple(x: number, amp: number) {
    if (this.reducedMotion) return;
    this.ripples.push({ x, t0: this.clock, amp });
    if (this.ripples.length > 6) this.ripples.shift();
  }

  private offsetAt(x: number) {
    if (this.reducedMotion) return 0;
    let y = 1.4 * Math.sin(this.clock * 0.9 + x * 0.017) + 0.8 * Math.sin(this.clock * 0.55 - x * 0.009);
    for (const r of this.ripples) {
      const age = this.clock - r.t0;
      const d = Math.abs(x - r.x);
      // damped spring wave spreading from the crossing point
      y += r.amp * Math.exp(-age * 1.8) * Math.exp(-d / 150) * Math.sin(d * 0.085 - age * 10);
    }
    return y;
  }

  private updateMembrane() {
    this.ripples = this.ripples.filter((r) => this.clock - r.t0 < 2.6);
    for (const s of this.slices) s.y = MEMBRANE_Y + this.offsetAt(s.x);
    this.gateImages.forEach((img, i) => {
      img.y = MEMBRANE_Y + (gateHeight() + 8) / 2 - GATE_CY + this.offsetAt(this.gates[i].x);
    });
  }

  private sparkle(x: number, y: number, dir: 1 | -1) {
    if (this.reducedMotion) return;
    const colors = [this.palette.num.methylene, this.palette.num['methylene-200'], this.palette.num.iodine];
    for (let i = 0; i < 6; i += 1) {
      const a = (dir > 0 ? Math.PI / 2 : -Math.PI / 2) + (i - 2.5) * 0.42;
      const dot = this.add.circle(x, y + dir * (MEMBRANE_HALF + 6), Phaser.Math.Between(3, 5), colors[i % 3]).setDepth(8);
      this.fxLayer.add(dot);
      this.tweens.add({
        targets: dot,
        x: x + Math.cos(a) * Phaser.Math.Between(30, 48),
        y: dot.y + Math.sin(a) * Phaser.Math.Between(22, 40),
        alpha: 0,
        scale: 0.4,
        duration: 520,
        ease: 'Cubic.Out',
        onComplete: () => dot.destroy(),
      });
    }
  }

  private damageFx(x: number) {
    const { num } = this.palette;
    const g = this.add.graphics().setDepth(4);
    this.fxLayer.add(g);
    g.lineStyle(2.4, num['eosin-deep'], 0.9);
    const y0 = MEMBRANE_Y + this.offsetAt(x);
    for (const s of [-1, 1]) {
      g.beginPath();
      g.moveTo(x + s * 4, y0 - MEMBRANE_HALF + 2);
      g.lineTo(x + s * 12, y0 - 12);
      g.lineTo(x + s * 5, y0 + 2);
      g.lineTo(x + s * 14, y0 + 16);
      g.lineTo(x + s * 8, y0 + MEMBRANE_HALF - 2);
      g.strokePath();
    }
    this.tweens.add({ targets: g, alpha: 0, delay: 900, duration: 900, ease: 'Cubic.Out', onComplete: () => g.destroy() });
    if (!this.reducedMotion) this.cameras.main.shake(150, 0.004);
  }

  private floatText(text: string, x: number, y: number, color: string) {
    const label = this.addText(x, y, text, { fontFamily: this.palette.font.mono, fontSize: FLOAT_FONT, color, fontStyle: '500' })
      .setOrigin(0.5)
      .setDepth(20)
      .setStroke(this.palette.hex['paper-bright'], 6);
    this.tweens.add({
      targets: label,
      y: label.y - (this.reducedMotion ? 0 : 40),
      alpha: 0,
      duration: 900,
      ease: 'Back.Out',
      onComplete: () => label.destroy(),
    });
  }

  // ═══════════════════════════ ATP (advanced) ═══════════════════════════

  /** Mitochondrion, one ATP molecule and a pip per unit: large enough to read on a phone. */
  private buildAtp() {
    const y = DESIGN.height - 40;
    this.mito = this.addSpecimen('mitocondrie', 42, y, 56).setDepth(2);
    this.atpIcon = this.addSpecimen('atp', 128, y - 6, 96, { shadow: false }).setDepth(2);
    this.atpPips = this.add.graphics().setDepth(2);
    // part of the membrane view: fades out with it during the osmosis events
    this.membraneLayer.add([this.mito, this.atpIcon, this.atpPips]);
    this.refreshAtpIcons(false);
  }

  private refreshAtpIcons(pop: boolean) {
    const g = this.atpPips;
    const icon = this.atpIcon;
    if (!g || !icon) return;
    const { num } = this.palette;
    g.clear();
    for (let i = 0; i < ATP.max; i += 1) {
      const x = 104 + i * 24;
      const y = DESIGN.height - 16;
      if (i < this.atp) {
        g.fillStyle(num.iodine, 1);
        g.fillCircle(x, y, 7.5);
      }
      g.lineStyle(2, num['iodine-deep'], 1);
      g.strokeCircle(x, y, 7.5);
    }
    icon.setAlpha(this.atp > 0 ? 1 : 0.3);
    if (pop && !this.reducedMotion) this.tweens.add({ targets: icon, scale: { from: 1.18, to: 1 }, duration: 420, ease: 'Back.Out' });
  }

  private updateAtp(dt: number) {
    if (this.atp >= ATP.max) {
      this.atpClock = 0;
      return;
    }
    this.atpClock += dt * 1000;
    if (this.atpClock >= ATP.refillMs) {
      this.atpClock = 0;
      this.atp += 1;
      this.refreshAtpIcons(true);
      this.emitAtp();
      if (this.mito && !this.reducedMotion) this.tweens.add({ targets: this.mito, scale: { from: 1.12, to: 1 }, duration: 380, ease: 'Back.Out' });
    }
  }

  private emitAtp() {
    if (this.mode === 'avansat') this.link.emit('atp', { value: this.atp, max: ATP.max });
    this.refreshAtpIcons(false);
  }

  private spendAtpFx(gate: GateLayout) {
    const from = this.atpIcon;
    if (!from || this.reducedMotion) return;
    const ghost = this.addSpecimen('atp', from.x, from.y, 44, { shadow: false }).setDepth(9);
    this.tweens.add({
      targets: ghost,
      x: gate.x + 16,
      y: MEMBRANE_Y + MEMBRANE_HALF + 34,
      scale: 0.6,
      duration: 380,
      ease: 'Back.Out',
      onComplete: () => this.tweens.add({ targets: ghost, alpha: 0, duration: 260, ease: 'Cubic.Out', onComplete: () => ghost.destroy() }),
    });
  }

  // ═══════════════════════════ Osmosis ═══════════════════════════

  private readonly cellX = OSMOSIS_LAYOUT.cellX;
  private readonly cellY = OSMOSIS_LAYOUT.cellY;
  private readonly cellSize = OSMOSIS_LAYOUT.cellSize;
  private readonly gaugeY = OSMOSIS_LAYOUT.gaugeY;
  private readonly gaugeX0 = OSMOSIS_LAYOUT.gaugeX0;
  private readonly gaugeX1 = OSMOSIS_LAYOUT.gaugeX1;

  private buildOsmosis() {
    const L = this.osmosisLayer;
    const { num } = this.palette;
    // an even wash so the red cell reads on its own "slide"
    const wash = this.add.graphics();
    wash.fillStyle(num['paper-bright'], 0.96);
    wash.fillRoundedRect(18, 18, DESIGN.width - 36, DESIGN.height - 36, 28);
    wash.lineStyle(2, num['ink-faint'], 0.6);
    wash.strokeRoundedRect(18, 18, DESIGN.width - 36, DESIGN.height - 36, 28);
    L.add(wash);
    // solute particles of the outside solution (how many are visible shows C_out)
    const rnd = new Phaser.Math.RandomDataGenerator(['solute']);
    for (let i = 0; i < 44; i += 1) {
      let x = 0;
      let y = 0;
      do {
        x = rnd.between(40, DESIGN.width - 40);
        y = rnd.between(40, this.gaugeY - 60);
      } while (Phaser.Math.Distance.Between(x, y, this.cellX, this.cellY) < this.cellSize * 0.66);
      const dot = this.add.circle(x, y, 3.2, num.iodine, 0.85).setVisible(false);
      this.solute.push(dot);
      L.add(dot);
    }
    const normal = this.addSpecimen('eritrocit', this.cellX, this.cellY, this.cellSize);
    const crenat = this.addSpecimen('eritrocit-crenat', this.cellX, this.cellY, this.cellSize * 0.9).setAlpha(0);
    const liza = this.addSpecimen('eritrocit-liza', this.cellX, this.cellY - 10, this.cellSize * 1.05).setAlpha(0);
    L.add([normal, crenat, liza]);
    this.cells = { normal, crenat, liza };
    for (let i = 0; i < 12; i += 1) {
      const img = this.img(0, 0, 'pm-mol-H2O', 2 * MOLECULE_RADIUS.H2O + 14, 2 * MOLECULE_RADIUS.H2O + 14).setVisible(false);
      this.water.push({ img, angle: 0, r: 0, alive: false });
      L.add(img);
    }
    this.gauge = this.add.graphics();
    L.add(this.gauge);
  }

  private startOsmosis(event: OsmosisEvent) {
    this.phaseKind = 'osmosis';
    this.select(null);
    this.osm = { event, t: 0, step: 0, volume: 1, cOut: 1, inBand: 0, outside: 0, lastInfo: -1 };
    this.cellScale = this.scaleFor(1);
    this.cellVel = 0;
    this.applyStep();
    this.osmosisLayer.setVisible(true);
    this.tweens.add({ targets: this.osmosisLayer, alpha: 1, duration: 420, ease: 'Cubic.Out' });
    this.tweens.add({ targets: this.membraneLayer, alpha: 0.12, duration: 420, ease: 'Cubic.Out' });
  }

  private endOsmosis() {
    const o = this.osm!;
    const points = Math.round(o.inBand * OSMOSIS_POINTS_PER_S);
    if (points > 0) this.emit('score', { points, at: { x: this.cellX, y: this.cellY - 90 } });
    this.link.emit('takeaway', { key: o.event.takeaway });
    this.osm = null;
    this.water.forEach((w) => {
      w.alive = false;
      w.img.setVisible(false);
    });
    this.tweens.add({
      targets: this.osmosisLayer,
      alpha: 0,
      duration: 420,
      ease: 'Cubic.Out',
      onComplete: () => this.osmosisLayer.setVisible(false),
    });
    this.tweens.add({ targets: this.membraneLayer, alpha: 1, duration: 420, ease: 'Cubic.Out' });
    this.nextPhase();
  }

  private applyStep() {
    const o = this.osm!;
    const step = o.event.steps[o.step];
    o.cOut = step.cOut;
    this.link.emit('osmosis-change', { say: step.say });
    this.refreshSolute(true);
  }

  private adjust(dir: 1 | -1) {
    if (this.phaseKind !== 'osmosis' || !this.osm) return;
    this.osm.cOut = adjustOutside(OSMOSIS, this.osm.cOut, dir * OSMOSIS_STEP);
    this.refreshSolute(false);
    this.emit('sfx', { name: dir > 0 ? 'pop' : 'whoosh' });
    this.sendOsmosisInfo(true);
  }

  private refreshSolute(flash: boolean) {
    const o = this.osm;
    if (!o) return;
    const n = Math.round((o.cOut / OSMOSIS.cOutRange[1]) * this.solute.length);
    this.solute.forEach((dot, i) => {
      const show = i < n;
      if (show && !dot.visible && flash && !this.reducedMotion) {
        dot.setScale(0);
        this.tweens.add({ targets: dot, scale: 1, duration: 360, delay: i * 8, ease: 'Back.Out' });
      }
      dot.setVisible(show);
    });
  }

  private scaleFor(volume: number) {
    return 0.62 + 0.42 * volume;
  }

  private updateOsmosis(dt: number) {
    const o = this.osm!;
    o.t += dt;
    const next = o.event.steps[o.step + 1];
    if (next && o.t >= next.at) {
      o.step += 1;
      this.applyStep();
    }
    o.volume = stepVolume(OSMOSIS, o.volume, o.cOut, dt);
    const zone = volumeZone(OSMOSIS, o.volume);
    if (zone === 'sigur') o.inBand += dt;
    else {
      o.outside += dt;
      if (o.outside >= OSMOSIS_DAMAGE_S) {
        o.outside = 0;
        this.emit('life-lost', { at: { x: this.cellX, y: this.cellY } });
        if (!this.reducedMotion) this.cameras.main.shake(140, 0.003);
      }
    }

    // spring the cell toward its volume (Phaser has no springs: a small damped oscillator)
    const target = this.scaleFor(o.volume);
    if (this.reducedMotion) this.cellScale = target;
    else {
      this.cellVel += ((target - this.cellScale) * 120 - this.cellVel * 13) * dt;
      this.cellScale += this.cellVel * dt;
    }
    const c = this.cells!;
    const wobble = this.reducedMotion ? 0 : this.cellVel * 0.06;
    for (const img of [c.normal, c.crenat, c.liza]) img.setScale(this.cellScale * (1 + wobble), this.cellScale * (1 - wobble));
    const cren = Phaser.Math.Clamp((0.9 - o.volume) / 0.14, 0, 1);
    const lysis = Phaser.Math.Clamp((o.volume - 1.2) / 0.16, 0, 1);
    c.crenat.setAlpha(cren);
    c.liza.setAlpha(lysis);
    c.normal.setAlpha(1 - Math.max(cren, lysis));

    this.updateWater(dt, volumeRate(OSMOSIS, o.volume, o.cOut));
    this.drawGauge(o.volume);
    this.sendOsmosisInfo(false);
    if (o.t >= o.event.durationS) this.endOsmosis();
  }

  /** Water molecules drift into the cell (hipotonic) or out of it (hipertonic), as many as the flow. */
  private updateWater(dt: number, rate: number) {
    const inward = rate > 0;
    const flow = Math.min(1, Math.abs(rate) / 0.08);
    this.waterClock += dt * flow * 7;
    const inner = this.cellSize * 0.42 * this.cellScale;
    const outer = this.cellSize * 0.95;
    if (this.waterClock >= 1 && flow > 0.05) {
      this.waterClock = 0;
      const w = this.water.find((x) => !x.alive);
      if (w) {
        w.alive = true;
        w.angle = Math.random() * Math.PI * 2;
        w.r = inward ? outer : inner;
        w.img.setVisible(true).setAlpha(0);
      }
    }
    for (const w of this.water) {
      if (!w.alive) continue;
      const speed = this.reducedMotion ? 60 : 90;
      w.r += (inward ? -1 : 1) * speed * dt;
      const done = inward ? w.r <= inner : w.r >= outer;
      const edge = Math.min(Math.abs(w.r - inner), Math.abs(outer - w.r)) / 30;
      w.img.setPosition(this.cellX + Math.cos(w.angle) * w.r, this.cellY + Math.sin(w.angle) * w.r * 0.8).setAlpha(Math.min(1, edge));
      if (done) {
        w.alive = false;
        w.img.setVisible(false);
      }
    }
  }

  private gaugeXOf(volume: number) {
    const [lo, hi] = OSMOSIS.limits;
    return this.gaugeX0 + ((volume - lo) / (hi - lo)) * (this.gaugeX1 - this.gaugeX0);
  }

  private drawGauge(volume: number) {
    const g = this.gauge;
    const { num } = this.palette;
    const y = this.gaugeY;
    const h = 18;
    g.clear();
    g.fillStyle(num['paper-deep'], 1);
    g.fillRoundedRect(this.gaugeX0, y - h / 2, this.gaugeX1 - this.gaugeX0, h, h / 2);
    const s0 = this.gaugeXOf(OSMOSIS.safe[0]);
    const s1 = this.gaugeXOf(OSMOSIS.safe[1]);
    g.fillStyle(num['methylene-200'], 1);
    g.fillRect(s0, y - h / 2, s1 - s0, h);
    g.lineStyle(2, num['methylene-deep'], 1);
    g.lineBetween(s0, y - h / 2 - 4, s0, y + h / 2 + 4);
    g.lineBetween(s1, y - h / 2 - 4, s1, y + h / 2 + 4);
    g.lineStyle(1.5, num.ink, 0.5);
    g.strokeRoundedRect(this.gaugeX0, y - h / 2, this.gaugeX1 - this.gaugeX0, h, h / 2);
    // marker: a needle with a round head
    const x = this.gaugeXOf(volume);
    const inBand = volumeZone(OSMOSIS, volume) === 'sigur';
    g.lineStyle(3, num.ink, 1);
    g.lineBetween(x, y - h / 2 - 10, x, y + h / 2 + 4);
    g.fillStyle(inBand ? num.ink : num['eosin-deep'], 1);
    g.fillCircle(x, y - h / 2 - 12, 7);
  }

  private sendOsmosisInfo(force: boolean) {
    const o = this.osm;
    if (!o) return;
    if (!force && this.clock - o.lastInfo < 0.12) return;
    o.lastInfo = this.clock;
    this.link.emit('osmosis', {
      volume: o.volume,
      cOut: o.cOut,
      zone: volumeZone(OSMOSIS, o.volume),
      tonicity: tonicity(OSMOSIS, o.volume, o.cOut),
      left: Math.max(0, Math.ceil(o.event.durationS - o.t)),
    });
  }
}

/** Binds the scene to a mode and a link, for <PhaserGame scenes={...}>. */
export function membraneScenes(mode: MembraneMode, link: MembraneLink) {
  class PoartaMembranei extends MembraneScene {
    constructor() {
      super(mode, link);
    }
  }
  return [PoartaMembranei];
}
