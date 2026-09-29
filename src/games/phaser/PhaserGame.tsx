// Mounts a Phaser 3 game inside React. The only place React and Phaser meet:
//   - Phaser is dynamic-imported (own chunk), and the scene module is too, so nothing Phaser-related
//     is in the main bundle.
//   - StrictMode-safe: each effect run has its own `cancelled` flag; a game is created at most once
//     per mount and destroyed with destroy(true) on unmount. A data attribute guards duplicates.
//   - Scale.FIT over a fixed logical design size, rendered at design × min(devicePixelRatio, 2);
//     BaseScene.setupView() zooms the camera so scene code only ever sees logical coordinates.
//     A ResizeObserver refits the canvas whenever the container changes size.
//   - Waits for the self-hosted fonts before creating scenes (Phaser bakes text into textures).
//   - Translates bus events ↔ session actions, and pauses/resumes/restarts scenes with the shell.
import { useEffect, useRef, useState } from 'react';
import type * as PhaserNS from 'phaser';
import { t } from '../../lib/i18n';
import { progressStore } from '../../lib/progress';
import { useReducedMotion } from '../../lib/motionPreference';
import { cx } from '../../lib/cx';
import type { GameSession } from '../core/session';
import { play } from '../feel/sfx';
import { BRIDGE_KEY, type SceneBridge } from './bridge';
import { createGameBus, type ScenePoint } from './bus';
import { waitForFonts } from './fonts';
import { loadPhaser } from './loadPhaser';
import { readPalette } from './palette';

type SceneClass = new (...args: never[]) => PhaserNS.Scene;

interface Props {
  session: GameSession;
  /** Dynamic import of the scene classes, e.g. () => import('./scenes').then((m) => [m.MainScene]). */
  scenes: () => Promise<SceneClass[]>;
  /** Logical design size. Choose the aspect ratio for the game; the canvas letterboxes on paper. */
  design: { width: number; height: number };
  /** Accessible name of the game area. */
  label: string;
  /** Tallest the canvas may get, as a CSS length (default 72dvh). */
  maxHeight?: string;
  className?: string;
}

const MAX_DPR = 2;
const currentDpr = () => Math.min(window.devicePixelRatio || 1, MAX_DPR);

export default function PhaserGame({ session, scenes, design, label, maxHeight = '72dvh', className }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);
  // Read once per game; changing these mid-game would need a restart anyway
  const initial = useRef({ reducedMotion, scenes, design });

  useEffect(() => {
    const container = host.current;
    if (!container) return undefined;
    let cancelled = false;
    let game: PhaserNS.Game | null = null;
    const cleanups: (() => void)[] = [];

    (async () => {
      const [Phaser, sceneClasses] = await Promise.all([loadPhaser(), initial.current.scenes(), waitForFonts()]);
      if (cancelled || container.dataset.phaserGame) return;
      container.dataset.phaserGame = 'mounted';

      const { design: size } = initial.current;
      const bus = createGameBus();
      let dpr = currentDpr();
      const bridge: SceneBridge = {
        bus,
        palette: readPalette(),
        design: size,
        dpr,
        reducedMotion: initial.current.reducedMotion,
        muted: progressStore.get().settings.sound !== true,
      };

      game = new Phaser.Game({
        type: Phaser.AUTO,
        parent: container,
        width: size.width * dpr,
        height: size.height * dpr,
        backgroundColor: bridge.palette.hex['paper-bright'],
        scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
        render: { antialias: true },
        // Keys only while the game area has focus, so Space on a HUD button never reaches the scene
        input: { keyboard: { target: container }, activePointers: 3 },
        audio: { noAudio: true }, // all sound goes through sfx (Howler), triggered from React
        banner: false,
        disableContextMenu: true,
        callbacks: { preBoot: (g) => g.registry.set(BRIDGE_KEY, bridge) },
        scene: sceneClasses,
      });
      const g = game;
      // Dev only: lets audit scripts and the console inspect scenes (window.__phaserGame.scene…)
      if (import.meta.env.DEV) (window as unknown as { __phaserGame?: PhaserNS.Game }).__phaserGame = g;
      g.events.once(Phaser.Core.Events.READY, () => {
        if (cancelled) return;
        g.canvas.style.touchAction = 'none';
        g.canvas.setAttribute('aria-hidden', 'true');
        setState('ready');
      });

      // ── Phaser → React ──
      const toViewport = (p?: ScenePoint) => {
        if (!p) return undefined;
        const r = g.canvas.getBoundingClientRect();
        return { x: r.left + (p.x / size.width) * r.width, y: r.top + (p.y / size.height) * r.height };
      };
      cleanups.push(
        bus.on('hit', ({ points, at }) => session.hit(points ?? 10, toViewport(at))),
        bus.on('score', ({ points, at }) => session.addScore(points, toViewport(at))),
        bus.on('miss', ({ at }) => session.miss(toViewport(at))),
        bus.on('life-lost', ({ at }) => session.loseLife(toViewport(at))),
        bus.on('near-win', () => session.nearWin()),
        bus.on('finished', ({ outcome }) => session.finish(outcome)),
        bus.on('sfx', ({ name }) => play(name)),
      );

      // ── React → Phaser ──
      const scenesOf = () => g.scene.getScenes(false);
      const applyStatus = (status: string) => {
        if (status === 'paused') {
          scenesOf().forEach((s) => s.sys.isActive() && s.scene.pause());
          bus.emit('pause', {});
        } else if (status === 'playing') {
          scenesOf().forEach((s) => s.sys.isPaused() && s.scene.resume());
          bus.emit('resume', {});
        }
      };
      cleanups.push(
        session.store.subscribe((s, prev) => {
          if (s.run !== prev.run && s.status === 'playing') {
            scenesOf().forEach((sc) => (sc.sys.isActive() || sc.sys.isPaused()) && sc.scene.restart());
            bus.emit('restart', {});
          } else if (s.status !== prev.status) applyStatus(s.status);
        }),
        progressStore.subscribe(() => {
          const muted = progressStore.get().settings.sound !== true;
          if (muted !== bridge.muted) {
            bridge.muted = muted;
            bus.emit('mute', { muted });
          }
        }),
      );
      // Scenes boot after this tick; start them paused if the shell already is
      g.events.once(Phaser.Core.Events.READY, () => applyStatus(session.get().status));

      // ── Size ──
      const observer = new ResizeObserver(() => {
        const next = currentDpr();
        if (next !== dpr) {
          dpr = next;
          bridge.dpr = next;
          g.scale.resize(size.width * next, size.height * next);
        }
        g.scale.refresh();
      });
      observer.observe(container);
      cleanups.push(() => observer.disconnect(), () => bus.clear());
    })().catch((e) => {
      console.error('[PhaserGame] could not start', e);
      if (!cancelled) setState('error');
    });

    return () => {
      cancelled = true;
      cleanups.forEach((fn) => fn());
      if (import.meta.env.DEV) {
        const w = window as unknown as { __phaserGame?: PhaserNS.Game };
        if (w.__phaserGame === game) delete w.__phaserGame;
      }
      game?.destroy(true);
      game = null;
      delete container.dataset.phaserGame;
    };
  }, [session, attempt]);

  const ratio = design.width / design.height;
  return (
    <div className={cx('relative mx-auto', className)} style={{ width: `min(100%, calc(${maxHeight} * ${ratio}))` }}>
      <div
        ref={host}
        role="group"
        aria-label={label}
        tabIndex={0}
        data-game-stage
        className="relative w-full overflow-hidden rounded-well bg-paper-bright shadow-well [&_canvas]:touch-none"
        style={{ aspectRatio: `${design.width} / ${design.height}` }}
      />
      {state !== 'ready' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-well bg-paper-bright p-6 text-center">
          {state === 'loading' ? (
            <p role="status" className="text-label text-ink-soft">
              {t('games.shell.loading')}
            </p>
          ) : (
            <>
              <p role="alert" className="prose-body">
                {t('games.shell.loadError')}
              </p>
              <button
                type="button"
                onClick={() => {
                  setState('loading');
                  setAttempt((a) => a + 1);
                }}
                className="text-label min-h-11 rounded-btn-b bg-paper-deep px-4 shadow-well"
              >
                {t('games.shell.retry')}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
