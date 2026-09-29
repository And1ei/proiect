// "Safari la microscop": the microscope field. Organisms (manifest silhouettes in stain colours)
// drift across a circular field; the player selects one, reads its card (DOM) and picks a group
// (DOM buttons or keys). The run itself (what spawns next, spaced repetition, slowdown) is the pure
// model in safariModel.ts. Scene rules as in GAME-DEV.md: logical coordinates, palette colours,
// bus events to the shell, the game link for the DOM, init() resets everything.
import * as Phaser from 'phaser';
import { BaseScene } from '../../phaser/BaseScene';
import type { ColorToken } from '../../phaser/palette';
import type { RecapItem } from '../../core/types';
import { CLUES, GROUPS, organismById, organismsFor, type GroupId, type Organism, type SafariMode, type TypeId } from '../../../content/ro/safari-organisms.ts';
import { SAFARI, fill } from '../../../content/ro/games/safari-microscop';
import { BANNER_MS, FIELD, MIN_HIT_R, POINTS, SELECTED_SPEED, SIZE } from './config';
import { createRun, crossSeconds, groupsFor, isLastSlide, nextSpawn, record, slideDone, spawnSeconds, speedAt, startSlide, type SafariRun } from './safariModel';
import type { SafariLink } from './link';

interface Drifter {
  uid: number;
  o: Organism;
  body: Phaser.GameObjects.Container;
  from: Phaser.Math.Vector2;
  to: Phaser.Math.Vector2;
  /** 0..1 along the path. */
  t: number;
  dur: number;
  phase: number;
  size: number;
  state: 'drift' | 'typing' | 'done';
}

export class SafariScene extends BaseScene {
  private readonly mode: SafariMode;
  private readonly link: SafariLink;
  private run!: SafariRun;
  private clock = 0;
  private spawnClock = 0;
  private drifters: Drifter[] = [];
  private uid = 0;
  private selected: Drifter | null = null;
  private typing: Drifter | null = null;
  private playing = false;
  private finished = false;
  private tutorialShown = false;
  private misses: Partial<Record<GroupId, string[]>> = {};
  private nearWinSent = false;
  private layer!: Phaser.GameObjects.Container;
  private ring!: Phaser.GameObjects.Graphics;
  private rng = Math.random;

  constructor(mode: SafariMode, link: SafariLink) {
    super('safari-microscop');
    this.mode = mode;
    this.link = link;
  }

  init() {
    this.run = createRun(this.mode);
    this.clock = 0;
    this.spawnClock = 0;
    this.drifters = [];
    this.selected = null;
    this.typing = null;
    this.playing = false;
    this.finished = false;
    this.tutorialShown = false;
    this.misses = {};
    this.nearWinSent = false;
  }

  preload() {
    this.loadSprites([...new Set(organismsFor(this.mode).map((o) => o.sprite))], SIZE.l * 1.1);
  }

  create() {
    this.setupView();
    this.drawField();
    this.layer = this.add.container(0, 0).setDepth(2);
    // Only what is inside the field is visible, like through an eyepiece
    const shape = this.make.graphics({}, false).fillCircle(FIELD.cx, FIELD.cy, FIELD.r - 2);
    this.layer.setMask(shape.createGeometryMask());
    this.ring = this.add.graphics().setDepth(3);
    this.drawRim();
    this.setupKeys();
    const offs = [
      this.link.on('pick', ({ group }) => this.pickGroup(group)),
      this.link.on('pick-type', ({ type }) => this.pickType(type)),
      this.link.on('hint', () => this.hint()),
    ];
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => offs.forEach((off) => off()));
    this.link.emit('ready', {});
    this.nextSlide();
  }

  // ═════════ Field (UI chrome: a notebook drawing of a microscope view) ═════════
  private drawField() {
    const { num } = this.palette;
    const g = this.add.graphics().setDepth(0);
    g.fillStyle(num['paper-deep'], 1);
    g.fillCircle(FIELD.cx, FIELD.cy, FIELD.r + 10);
    g.fillStyle(num['paper-bright'], 1);
    g.fillCircle(FIELD.cx, FIELD.cy, FIELD.r);
    // faint reticle grid, clipped to the field
    const grid = this.add.graphics().setDepth(1);
    grid.lineStyle(1, num['methylene-100'], 0.9);
    for (let x = FIELD.cx - FIELD.r; x <= FIELD.cx + FIELD.r; x += 32) grid.lineBetween(x, FIELD.cy - FIELD.r, x, FIELD.cy + FIELD.r);
    for (let y = FIELD.cy - FIELD.r; y <= FIELD.cy + FIELD.r; y += 32) grid.lineBetween(FIELD.cx - FIELD.r, y, FIELD.cx + FIELD.r, y);
    grid.lineStyle(1.5, num['ink-faint'], 0.6);
    grid.lineBetween(FIELD.cx - 24, FIELD.cy, FIELD.cx + 24, FIELD.cy);
    grid.lineBetween(FIELD.cx, FIELD.cy - 24, FIELD.cx, FIELD.cy + 24);
    grid.setMask(this.make.graphics({}, false).fillCircle(FIELD.cx, FIELD.cy, FIELD.r).createGeometryMask());
  }

  private drawRim() {
    const { num } = this.palette;
    const g = this.add.graphics().setDepth(4);
    // soft vignette: rings darkening toward the edge
    for (let i = 0; i < 10; i += 1) {
      g.lineStyle(4, num['paper-shade'], 0.05 + i * 0.035);
      g.strokeCircle(FIELD.cx, FIELD.cy, FIELD.r - 38 + i * 4);
    }
    g.lineStyle(2, num.ink, 0.55);
    g.strokeCircle(FIELD.cx, FIELD.cy, FIELD.r);
    g.lineStyle(1, num['ink-faint'], 0.8);
    g.strokeCircle(FIELD.cx, FIELD.cy, FIELD.r + 7);
  }

  // ═════════ Slides ═════════
  private nextSlide() {
    this.playing = false;
    this.run = startSlide(this.run, this.rng);
    this.spawnClock = spawnSeconds(this.run) * 0.8;
    this.link.emit('slide', { index: this.run.slideIndex, total: this.run.slides.length, slideId: this.run.slides[this.run.slideIndex] });
    this.link.emit('phase', { kind: 'banner' });
    this.time.delayedCall(BANNER_MS, () => {
      this.playing = true;
      this.link.emit('phase', { kind: 'play' });
    });
  }

  update(_t: number, deltaMs: number) {
    const dt = Math.min(deltaMs, 100) / 1000;
    this.clock += dt;
    const speed = speedAt(this.run, this.clock);
    if (this.playing && !this.finished) {
      this.spawnClock += dt * speed;
      if (this.spawnClock >= spawnSeconds(this.run)) {
        const n = nextSpawn(this.run, this.live().map((d) => d.o.id));
        this.run = n.run;
        if (n.id) {
          this.spawnClock = 0;
          this.spawn(organismById(n.id)!);
        }
      }
      if (slideDone(this.run, this.live().map((d) => d.o.id)) && !this.typing) {
        if (isLastSlide(this.run)) this.finish();
        else this.nextSlide();
      }
      if (isLastSlide(this.run) && !this.nearWinSent && this.run.queue.length <= 2) {
        this.nearWinSent = true;
        this.emit('near-win', {});
      }
    }
    for (const d of this.drifters) {
      if (d.state !== 'drift') continue;
      const slow = d === this.selected ? SELECTED_SPEED : 1;
      d.t += (dt * speed * slow) / d.dur;
      this.place(d);
      if (d.t >= 1) this.escape(d);
    }
    this.drifters = this.drifters.filter((d) => d.state !== 'done' || d.body.active);
    this.drawRing();
  }

  private live() {
    return this.drifters.filter((d) => d.state !== 'done');
  }

  // ═════════ Organisms ═════════
  private spawn(o: Organism) {
    const size = SIZE[o.size];
    const a = this.rng() * Math.PI * 2;
    const b = a + Math.PI + (this.rng() - 0.5) * 1.1;
    const edge = FIELD.r + size * 0.5;
    const from = new Phaser.Math.Vector2(FIELD.cx + Math.cos(a) * edge, FIELD.cy + Math.sin(a) * edge);
    const to = new Phaser.Math.Vector2(FIELD.cx + Math.cos(b) * edge, FIELD.cy + Math.sin(b) * edge);
    const body = this.addSpecimen(o.sprite, from.x, from.y, size, { tone: o.tone as ColorToken });
    const hit = Math.max(MIN_HIT_R, size * 0.6);
    body.setInteractive(new Phaser.Geom.Circle(size / 2, size / 2, hit), Phaser.Geom.Circle.Contains);
    if (body.input) body.input.cursor = 'pointer';
    const d: Drifter = { uid: ++this.uid, o, body, from, to, t: 0, dur: crossSeconds(this.run) * (this.reducedMotion ? 1.3 : 1), phase: this.rng() * 6.3, size, state: 'drift' };
    body.on('pointerup', () => this.select(d));
    body.setRotation(Math.atan2(to.y - from.y, to.x - from.x) * (o.motion === 'roll' ? 0 : 0.15));
    this.layer.add(body);
    this.drifters.push(d);
    if (!this.reducedMotion) {
      body.setScale(0.6);
      this.tweens.add({ targets: body, scale: 1, duration: 500, ease: 'Back.Out' });
    }
  }

  /** Position along the path plus a little life that matches how it moves (none under reduced motion). */
  private place(d: Drifter) {
    const p = Phaser.Math.Clamp(d.t, 0, 1);
    let x = d.from.x + (d.to.x - d.from.x) * p;
    let y = d.from.y + (d.to.y - d.from.y) * p;
    if (this.reducedMotion) {
      d.body.setPosition(x, y);
      return;
    }
    const k = this.clock + d.phase;
    const nx = -(d.to.y - d.from.y);
    const ny = d.to.x - d.from.x;
    const len = Math.hypot(nx, ny) || 1;
    switch (d.o.motion) {
      case 'flagellum': {
        const w = Math.sin(k * 3.2) * 7;
        x += (nx / len) * w;
        y += (ny / len) * w;
        d.body.rotation = Math.sin(k * 3.2) * 0.12;
        break;
      }
      case 'cilia':
        d.body.rotation = Math.sin(k * 9) * 0.03;
        break;
      case 'amoeboid': {
        const s = Math.sin(k * 1.3) * 0.08;
        d.body.setScale(1 + s, 1 - s);
        break;
      }
      case 'roll':
        d.body.rotation += 0.004;
        break;
      default: {
        const w = Math.sin(k * 0.9) * 5;
        x += (nx / len) * w;
        y += (ny / len) * w;
      }
    }
    d.body.setPosition(x, y);
  }

  private select(d: Drifter | null) {
    if (this.typing) return;
    if (d && d.state !== 'drift') return;
    this.selected = d;
    const tutorial = !!d && this.run.slideIndex === 0 && !this.tutorialShown;
    if (tutorial) {
      this.tutorialShown = true;
      this.link.emit('notice', { key: 'tutorial' });
    }
    this.link.emit('select', { id: d?.o.id ?? null, tutorial });
    if (d && !this.reducedMotion) this.tweens.add({ targets: d.body, scale: { from: 1.12, to: 1 }, duration: 260, ease: 'Back.Out' });
  }

  private drawRing() {
    const r = this.ring;
    r.clear();
    const d = this.typing ?? this.selected;
    if (!d || d.state === 'done') return;
    const { num } = this.palette;
    const R = Math.max(MIN_HIT_R, d.size * 0.6) + 6;
    r.lineStyle(3, num.ink, 0.9);
    r.strokeCircle(d.body.x, d.body.y, R);
    r.lineStyle(2, num.eosin, 1);
    r.strokeCircle(d.body.x, d.body.y, R - 5);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) r.lineBetween(d.body.x + dx * (R + 2), d.body.y + dy * (R + 2), d.body.x + dx * (R + 10), d.body.y + dy * (R + 10));
  }

  private cycle(step: 1 | -1) {
    if (this.typing) return;
    const list = this.live().filter((d) => d.state === 'drift').sort((a, b) => a.body.x - b.body.x);
    if (!list.length) return this.select(null);
    const i = this.selected ? list.indexOf(this.selected) : -1;
    this.select(list[i === -1 ? (step > 0 ? 0 : list.length - 1) : (i + step + list.length) % list.length]);
  }

  private setupKeys() {
    const kb = this.input.keyboard;
    if (!kb) return;
    const K = Phaser.Input.Keyboard.KeyCodes;
    kb.addCapture([K.TAB, K.LEFT, K.RIGHT, K.UP, K.DOWN]);
    kb.on('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Escape') return;
      if (e.key === 'Tab') this.cycle(e.shiftKey ? -1 : 1);
      else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') this.cycle(1);
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') this.cycle(-1);
      else if (e.key === 'Enter') {
        if (!this.selected) this.cycle(1);
      } else if (/^[1-7]$/.test(e.key)) {
        const n = Number(e.key) - 1;
        if (this.typing) {
          const types = GROUPS[this.typing.o.group].types ?? [];
          if (types[n]) this.pickType(types[n]);
        } else {
          const g = groupsFor(this.mode)[n];
          if (g) this.pickGroup(g);
        }
      } else if (e.key.toLowerCase() === 'h') this.hint();
    });
  }

  // ═════════ Judging ═════════
  private pickGroup(group: GroupId) {
    if (this.typing || this.finished) return;
    const d = this.selected;
    if (!d || d.state !== 'drift') {
      this.link.emit('notice', { key: 'pickFirst' });
      return;
    }
    this.selected = null;
    const at = { x: d.body.x, y: d.body.y };
    if (group !== d.o.group) {
      this.countMiss(d.o);
      this.run = this.recordAndHelp(d.o.id, 'wrong');
      this.link.emit('result', { id: d.o.id, outcome: 'wrong', picked: group });
      this.emit('recap', { items: this.recap() });
      this.emit('life-lost', { at });
      if (!this.reducedMotion) this.cameras.main.shake(140, 0.004);
      this.remove(d, 'wrong');
      this.link.emit('select', { id: null, tutorial: false });
      return;
    }
    this.run = record(this.run, d.o.id, 'correct', this.clock).run;
    this.emit('hit', { points: POINTS.group, at });
    this.link.emit('result', { id: d.o.id, outcome: 'correct', picked: group });
    if (this.mode === 'avansat' && GROUPS[group].types && d.o.type) {
      // Second step: the organism waits, the buttons switch to its group's types
      d.state = 'typing';
      this.typing = d;
      this.link.emit('type-step', { id: d.o.id });
      return;
    }
    this.toCarnet(d);
  }

  private pickType(type: TypeId) {
    const d = this.typing;
    if (!d) return;
    this.typing = null;
    const correct = type === d.o.type;
    if (correct) this.emit('score', { points: POINTS.type, at: { x: d.body.x, y: d.body.y } });
    this.link.emit('type-result', { id: d.o.id, correct });
    this.link.emit('type-step', { id: null });
    this.toCarnet(d);
  }

  private toCarnet(d: Drifter) {
    d.state = 'done';
    d.body.disableInteractive();
    this.link.emit('carnet', { id: d.o.id });
    this.link.emit('select', { id: null, tutorial: false });
    if (this.reducedMotion) {
      d.body.destroy();
      return;
    }
    this.tweens.add({
      targets: d.body,
      x: FIELD.cx + FIELD.r * 0.8,
      y: FIELD.cy - FIELD.r * 0.8,
      scale: 0.3,
      alpha: 0,
      duration: 650,
      ease: 'Back.In',
      onComplete: () => d.body.destroy(),
    });
  }

  private escape(d: Drifter) {
    if (this.selected === d) {
      this.selected = null;
      this.link.emit('select', { id: null, tutorial: false });
    }
    this.countMiss(d.o);
    this.run = this.recordAndHelp(d.o.id, 'escaped');
    this.link.emit('result', { id: d.o.id, outcome: 'escaped' });
    this.emit('recap', { items: this.recap() });
    this.emit('miss', {});
    this.remove(d, 'escaped');
  }

  private recordAndHelp(id: string, outcome: 'wrong' | 'escaped') {
    const r = record(this.run, id, outcome, this.clock);
    if (r.slowed) this.link.emit('notice', { key: 'slow' });
    return r.run;
  }

  private remove(d: Drifter, why: 'wrong' | 'escaped') {
    d.state = 'done';
    d.body.disableInteractive();
    this.tweens.add({
      targets: d.body,
      alpha: 0,
      angle: why === 'wrong' && !this.reducedMotion ? d.body.angle + 25 : d.body.angle,
      duration: why === 'wrong' ? 420 : 260,
      ease: 'Cubic.Out',
      onComplete: () => d.body.destroy(),
    });
  }

  private hint() {
    const d = this.typing ?? this.selected;
    if (!d) {
      this.link.emit('notice', { key: 'hintNone' });
      return;
    }
    this.link.emit('hint-used', { id: d.o.id });
  }

  private countMiss(o: Organism) {
    const list = this.misses[o.group] ?? [];
    this.misses[o.group] = [...list, o.id];
  }

  /** Up to 3 "Ce ai învățat" items: the most-missed groups, with the clue that decides them. */
  private recap(): RecapItem[] {
    return (Object.entries(this.misses) as [GroupId, string[]][])
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 3)
      .map(([group, ids]) => {
        const o = organismById(ids[ids.length - 1])!;
        const clue = CLUES[o.diagnostic[0]].text;
        return { title: fill(SAFARI.recapTitle, { group: GROUPS[group].name }), text: `${clue} (${o.name}, ${o.binomial})`, section: GROUPS[group].lessonSection };
      });
  }

  private finish() {
    if (this.finished) return;
    this.finished = true;
    this.link.emit('phase', { kind: 'done' });
    this.time.delayedCall(600, () => this.emit('finished', { outcome: 'won', recap: this.recap() }));
  }
}

/** Binds the scene to a mode and a link, for <PhaserGame scenes={...}>. */
export function safariScenes(mode: SafariMode, link: SafariLink) {
  class SafariMicroscop extends SafariScene {
    constructor() {
      super(mode, link);
    }
  }
  return [SafariMicroscop];
}

