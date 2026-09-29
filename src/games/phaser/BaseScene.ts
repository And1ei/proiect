// Base class for every Phaser scene. Import it only from scene modules that <PhaserGame> loads
// lazily (it imports Phaser statically, which is fine there: they live in Phaser-only chunks).
//
// Scene rules (GAME-DEV.md, "Phaser"):
//   - Call this.setupView() first in create().
//   - Use logical coordinates (this.W × this.H); the camera maps them to device pixels.
//   - Colours from this.palette only; text via this.addText(); sprites via loadSprites/addSpecimen.
//   - Talk to React only through this.emit() / this.listen(). No zustand, no React, no Howler.
import * as Phaser from 'phaser';
import { getAsset } from '../../assets/urls';
import { BRIDGE_KEY, type SceneBridge } from './bridge';
import type { AllEvents, SceneEvents, ShellEvents } from './bus';
import type { ColorToken, Palette } from './palette';

export interface SpecimenOptions {
  /** Tint for 'mono' assets (silhouettes). Ignored for palette-coloured assets. */
  tone?: ColorToken;
  /** Ink outline, like <Sprite> in the DOM. Default true. */
  outline?: boolean;
  /** Paper-cut shadow. Default true. */
  shadow?: boolean;
}

export abstract class BaseScene extends Phaser.Scene {
  protected get bridge(): SceneBridge {
    const bridge = this.registry.get(BRIDGE_KEY) as SceneBridge | undefined;
    if (!bridge) throw new Error('[phaser] scene started outside <PhaserGame>: no bridge in the registry');
    return bridge;
  }

  protected get palette(): Palette {
    return this.bridge.palette;
  }

  /** Logical width (design units). */
  protected get W(): number {
    return this.bridge.design.width;
  }

  /** Logical height (design units). */
  protected get H(): number {
    return this.bridge.design.height;
  }

  protected get reducedMotion(): boolean {
    return this.bridge.reducedMotion;
  }

  protected get isWebGL(): boolean {
    return this.game.renderer.type === Phaser.WEBGL;
  }

  /** Maps the logical design size onto the device-pixel canvas; keeps it mapped after resizes. */
  protected setupView(): void {
    const fit = () => {
      const cam = this.cameras.main;
      cam.setZoom(this.scale.gameSize.width / this.W);
      cam.centerOn(this.W / 2, this.H / 2);
    };
    fit();
    this.scale.on(Phaser.Scale.Events.RESIZE, fit);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.scale.off(Phaser.Scale.Events.RESIZE, fit));
  }

  /** Phaser → React. */
  protected emit<K extends keyof SceneEvents>(event: K, payload: SceneEvents[K]): void {
    this.bridge.bus.emit(event, payload as AllEvents[K]);
  }

  /** React → Phaser. Unsubscribes automatically when the scene shuts down. */
  protected listen<K extends keyof ShellEvents>(event: K, handler: (payload: ShellEvents[K]) => void): void {
    const off = this.bridge.bus.on(event, handler);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, off);
    this.events.once(Phaser.Scenes.Events.DESTROY, off);
  }

  /** Text in the site's fonts and ink, rendered at device resolution so it stays crisp. */
  protected addText(x: number, y: number, text: string, style: Phaser.Types.GameObjects.Text.TextStyle = {}) {
    return this.add.text(x, y, text, {
      fontFamily: this.palette.font.body,
      fontSize: '20px',
      color: this.palette.hex.ink,
      resolution: this.bridge.dpr,
      ...style,
    });
  }

  /**
   * Queues manifest sprites for loading (call in preload()). `size` is the largest logical size the
   * sprite will be drawn at; it is rasterised at size × dpr so it stays sharp.
   * Throws for an id that isn't in src/assets/manifest.ts: there is no placeholder art.
   */
  protected loadSprites(ids: string[], size: number): void {
    const px = Math.ceil(size * this.bridge.dpr);
    for (const id of ids) {
      if (this.textures.exists(id)) continue;
      const asset = getAsset(id);
      if (!asset.file.endsWith('.svg')) throw new Error(`[phaser] "${id}" is not an SVG sprite`);
      this.load.svg(id, asset.url, { width: px, height: px });
    }
  }

  /**
   * A manifest sprite with the shared specimen treatment (ink outline + paper-cut shadow, like
   * <Sprite> in the DOM), as a Container centred on (x, y) with logical `size`.
   * Mono silhouettes are tinted with `tone` (default methylene-deep).
   */
  protected addSpecimen(id: string, x: number, y: number, size: number, opts: SpecimenOptions = {}) {
    if (!this.textures.exists(id)) {
      throw new Error(`[phaser] texture "${id}" isn't loaded. Call this.loadSprites(['${id}'], size) in preload(). No placeholder art.`);
    }
    const { tone = 'methylene-deep', outline = true, shadow = true } = opts;
    const mono = getAsset(id).color === 'mono';
    const ink = this.palette.num.ink;
    const parts: Phaser.GameObjects.Image[] = [];
    // Tints need WebGL; the Canvas renderer gets the plain sprite rather than untinted duplicates
    if (this.isWebGL) {
      if (shadow) parts.push(this.add.image(2.5, 3.5, id).setTintFill(ink).setAlpha(0.16));
      if (outline) {
        const o = 1.1;
        for (const [dx, dy] of [[o, 0], [-o, 0], [0, o], [0, -o]]) parts.push(this.add.image(dx, dy, id).setTintFill(ink));
      }
    }
    const main = this.add.image(0, 0, id);
    if (mono && this.isWebGL) main.setTintFill(this.palette.num[tone]);
    parts.push(main);
    for (const p of parts) p.setDisplaySize(size, size);
    const container = this.add.container(x, y, parts);
    container.setSize(size, size);
    return container;
  }
}
