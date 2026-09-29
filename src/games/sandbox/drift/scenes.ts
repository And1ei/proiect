// SANDBOX (dev only). Copy this pattern for real Phaser scenes:
//   - extend BaseScene; call this.setupView() first in create(); logical coordinates only;
//   - sprites from the manifest via loadSprites()/addSpecimen() (never drawn shapes for organisms);
//   - colours from this.palette, text via this.addText();
//   - report with this.emit(); never import React, zustand, Howler or the session;
//   - honour this.reducedMotion (no shake, no wobble, fades instead of pops);
//   - Phaser has no springs: use 'Back.Out' / 'Elastic.Out' eases, never linear or the default;
//   - init() must reset every field, because the shell's "Ia-o de la capăt" calls scene.restart().
import * as Phaser from 'phaser';
import { BaseScene } from '../../phaser/BaseScene';
import { multiplierFor } from '../../core/scoring';
import type { ColorToken } from '../../phaser/palette';
import { BAD, BAD_CHANCE, GOOD, HIT_RADIUS, SIZE, SPAWN_MS, TARGET } from './config';

interface Drifter {
  body: Phaser.GameObjects.Container;
  good: boolean;
  vx: number;
  baseY: number;
  phase: number;
  spin: number;
  done: boolean;
}

const RETICLE_SPEED = 560; // design units per second
const RETICLE_RADIUS = 58;

export class DriftScene extends BaseScene {
  private drifters: Drifter[] = [];
  private caught = 0;
  private spawned = 0;
  /** Mirrors the session streak, only to label the in-canvas "+points" text. */
  private streak = 0;
  private finished = false;
  private reticle!: Phaser.GameObjects.Graphics;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() {
    super('drift');
  }

  init() {
    this.drifters = [];
    this.caught = 0;
    this.spawned = 0;
    this.streak = 0;
    this.finished = false;
  }

  preload() {
    this.loadSprites([...GOOD.map((g) => g.id), ...BAD], SIZE * 1.2);
  }

  create() {
    this.setupView();
    this.drawField();

    this.reticle = this.add.graphics().setDepth(10);
    this.reticle.setPosition(this.W / 2, this.H / 2);
    this.drawReticle(false);

    const keyboard = this.input.keyboard;
    if (keyboard) {
      this.cursors = keyboard.createCursorKeys();
      const catchAtReticle = () => this.catchNearest(this.reticle.x, this.reticle.y);
      keyboard.on('keydown-SPACE', catchAtReticle);
      keyboard.on('keydown-ENTER', catchAtReticle);
      // Show the keyboard target only once the player uses the keyboard
      keyboard.on('keydown', () => this.drawReticle(true));
    }

    this.time.addEvent({ delay: SPAWN_MS, loop: true, callback: () => this.spawn() });
    this.spawn();
  }

  update(_time: number, deltaMs: number) {
    const dt = deltaMs / 1000;
    const t = this.time.now / 1000;

    for (const d of this.drifters) {
      if (d.done) continue;
      d.body.x += d.vx * dt;
      if (!this.reducedMotion) {
        d.body.y = d.baseY + Math.sin(t * 1.6 + d.phase) * 18;
        d.body.rotation += d.spin * dt;
      }
      const gone = d.vx > 0 ? d.body.x > this.W + SIZE : d.body.x < -SIZE;
      if (gone) {
        d.done = true;
        d.body.destroy();
        // A good organism that got away breaks the streak (but costs no life)
        if (d.good && !this.finished) {
          this.streak = 0;
          this.emit('miss', {});
        }
      }
    }
    this.drifters = this.drifters.filter((d) => !d.done);

    if (this.cursors) {
      const { left, right, up, down } = this.cursors;
      const dx = (right.isDown ? 1 : 0) - (left.isDown ? 1 : 0);
      const dy = (down.isDown ? 1 : 0) - (up.isDown ? 1 : 0);
      if (dx || dy) {
        this.reticle.x = Phaser.Math.Clamp(this.reticle.x + dx * RETICLE_SPEED * dt, 0, this.W);
        this.reticle.y = Phaser.Math.Clamp(this.reticle.y + dy * RETICLE_SPEED * dt, 0, this.H);
      }
    }
  }

  /** Graph-paper field in palette colours (UI chrome, not organism art). */
  private drawField() {
    const g = this.add.graphics();
    g.lineStyle(1, this.palette.num['methylene-100'], 0.9);
    for (let x = 40; x < this.W; x += 40) g.lineBetween(x, 0, x, this.H);
    for (let y = 40; y < this.H; y += 40) g.lineBetween(0, y, this.W, y);
    // Microscope field-of-view ring
    g.lineStyle(3, this.palette.num['ink-faint'], 0.5);
    g.strokeEllipse(this.W / 2, this.H / 2, this.W - 40, this.H - 40);
  }

  private drawReticle(visible: boolean) {
    const r = this.reticle;
    r.clear();
    if (!visible) return;
    r.lineStyle(3, this.palette.num.ink, 0.9);
    r.strokeCircle(0, 0, RETICLE_RADIUS);
    r.lineStyle(2, this.palette.num.eosin, 1);
    r.strokeCircle(0, 0, RETICLE_RADIUS - 6);
    for (const [x1, y1, x2, y2] of [[-RETICLE_RADIUS - 10, 0, -RETICLE_RADIUS + 12, 0], [RETICLE_RADIUS - 12, 0, RETICLE_RADIUS + 10, 0], [0, -RETICLE_RADIUS - 10, 0, -RETICLE_RADIUS + 12], [0, RETICLE_RADIUS - 12, 0, RETICLE_RADIUS + 10]])
      r.lineBetween(x1, y1, x2, y2);
  }

  private spawn() {
    if (this.finished) return;
    this.spawned += 1;
    // The first two are always catchable, so the opening is friendly
    const good = this.spawned <= 2 || Math.random() > BAD_CHANCE;
    const pick = good ? GOOD[Math.floor(Math.random() * GOOD.length)] : null;
    const id = pick ? pick.id : BAD[Math.floor(Math.random() * BAD.length)];
    const fromLeft = Math.random() < 0.5;
    const x = fromLeft ? -SIZE / 2 : this.W + SIZE / 2;
    const y = Phaser.Math.Between(SIZE, this.H - SIZE);
    const speed = Phaser.Math.Between(95, 150) + this.caught * 5;

    const body = this.addSpecimen(id, x, y, SIZE, pick ? { tone: pick.tone as ColorToken } : {});
    body.setRotation(Phaser.Math.FloatBetween(-0.5, 0.5));
    body.setInteractive(new Phaser.Geom.Circle(SIZE / 2, SIZE / 2, HIT_RADIUS), Phaser.Geom.Circle.Contains);
    body.on('pointerdown', () => this.catchDrifter(drifter));
    if (!this.reducedMotion) {
      body.setScale(0.6);
      this.tweens.add({ targets: body, scale: 1, duration: 420, ease: 'Back.Out' });
    }

    const drifter: Drifter = {
      body,
      good,
      vx: fromLeft ? speed : -speed,
      baseY: y,
      phase: Math.random() * Math.PI * 2,
      spin: Phaser.Math.FloatBetween(-0.4, 0.4),
      done: false,
    };
    this.drifters.push(drifter);
  }

  private catchNearest(x: number, y: number) {
    let best: Drifter | null = null;
    let bestD = RETICLE_RADIUS + SIZE * 0.3;
    for (const d of this.drifters) {
      const dist = Phaser.Math.Distance.Between(x, y, d.body.x, d.body.y);
      if (!d.done && dist < bestD) [best, bestD] = [d, dist];
    }
    if (best) this.catchDrifter(best);
  }

  private catchDrifter(d: Drifter) {
    if (d.done || this.finished) return;
    d.done = true;
    d.body.disableInteractive();
    const at = { x: d.body.x, y: d.body.y };

    if (d.good) {
      this.caught += 1;
      this.streak += 1;
      this.emit('hit', { points: 10, at });
      this.floatText(`+${10 * multiplierFor(this.streak)}`, at.x, at.y, this.palette.hex['methylene-deep']);
      this.tweens.add({
        targets: d.body,
        scale: this.reducedMotion ? 1 : 1.35,
        alpha: 0,
        duration: this.reducedMotion ? 200 : 300,
        ease: 'Back.Out',
        onComplete: () => d.body.destroy(),
      });
      if (this.caught === TARGET - 2) this.emit('near-win', {});
      if (this.caught >= TARGET) {
        this.finished = true;
        this.time.delayedCall(450, () => this.emit('finished', { outcome: 'won' }));
      }
    } else {
      this.streak = 0;
      this.emit('life-lost', { at });
      if (!this.reducedMotion) this.cameras.main.shake(160, 0.005);
      this.floatText('−1', at.x, at.y, this.palette.hex['eosin-deep']);
      this.tweens.add({ targets: d.body, alpha: 0, angle: d.body.angle + 40, duration: 260, ease: 'Back.In', onComplete: () => d.body.destroy() });
    }
  }

  private floatText(text: string, x: number, y: number, color: string) {
    const label = this.addText(x, y - SIZE * 0.4, text, { fontFamily: this.palette.font.mono, fontSize: '30px', color, fontStyle: '500' })
      .setOrigin(0.5)
      .setDepth(20)
      .setStroke(this.palette.hex['paper-bright'], 6);
    this.tweens.add({
      targets: label,
      y: label.y - (this.reducedMotion ? 0 : 46),
      alpha: 0,
      duration: 800,
      ease: 'Back.Out',
      onComplete: () => label.destroy(),
    });
  }
}
