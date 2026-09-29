// The animated "Cum se joacă" on the intro screen (GameDefinition.howTo): three steps, drawn with the
// same Canvas-2D art as the scene (./art.ts), so the player meets the real gates before playing.
// No Phaser here: it loads with the intro. Visuals are decorative (aria-hidden); the steps are text.
import { useEffect, useRef, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { useReducedMotion } from '../../../lib/motionPreference';
import { spring } from '../../../lib/motion';
import { readPalette, type Palette } from '../../phaser/palette';
import Sprite from '../../../components/illustration/Sprite';
import { MEMBRANE } from '../../../content/ro/games/poarta-membranei';
import { moleculeById, type MembraneMode } from '../../../content/ro/membrane-molecules';
import { BILAYER_PAD, CUE, MOLECULE_RADIUS, PROTEIN_GAP, drawBilayer, drawChip, drawCue, drawGate, drawMolecule, gateHeight } from './art';
import { MEMBRANE_HALF, gatesFor } from './config';
import { OSMOSIS } from './osmosisModel';
import { Keycap } from './Chem';

type Draw = (ctx: CanvasRenderingContext2D, p: Palette) => void;

/** A canvas that draws once (after the fonts load) at device resolution. */
function ArtCanvas({ width, height, draw, className }: { width: number; height: number; draw: Draw; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  // The drawing is fixed for a given size: draw once, not on every render
  const drawRef = useRef(draw);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return undefined;
    let cancelled = false;
    const palette = readPalette();
    document.fonts
      .load(`500 20px ${palette.font.mono}`)
      .catch(() => undefined)
      .then(() => {
        if (cancelled) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.ceil(width * dpr);
        canvas.height = Math.ceil(height * dpr);
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.scale(dpr, dpr);
        drawRef.current(ctx, palette);
      });
    return () => {
      cancelled = true;
    };
  }, [width, height]);
  return <canvas ref={ref} className={className} style={{ width: '100%', aspectRatio: `${width} / ${height}` }} />;
}

/** One molecule token as in the game: atoms, formula chip and concentration cue. */
function tokenDraw(id: string): { w: number; h: number; draw: Draw } {
  const m = moleculeById(id)!;
  const r = MOLECULE_RADIUS[m.species];
  const w = 2 * r + CUE.width + 40;
  const h = 2 * r + 44;
  return {
    w,
    h,
    draw: (ctx, p) => {
      ctx.save();
      ctx.translate(r + 12, r + 8);
      drawMolecule(ctx, p, m.species);
      drawChip(ctx, p, m.formula, 20, 0, r + 17);
      ctx.translate(r + 8, -CUE.height / 2 + 2);
      drawCue(ctx, p, m.higher, m.from, m.species === 'O2' ? p.hex['eosin-deep'] : m.species === 'K' ? p.hex.methylene : p.hex.iodine);
      ctx.restore();
    },
  };
}

function Loop({ children, reduced, y = 0, x = 0, delay = 0 }: { children: ReactNode; reduced: boolean; y?: number; x?: number; delay?: number }) {
  if (reduced) return <div>{children}</div>;
  return (
    <motion.div
      initial={{ x: 0, y: 0 }}
      animate={{ x, y }}
      transition={{ type: 'spring', stiffness: 40, damping: 9, repeat: Infinity, repeatType: 'reverse', repeatDelay: 0.9, delay }}
    >
      {children}
    </motion.div>
  );
}

function Step({ n, title, text, children, reduced }: { n: number; title: string; text: string; children: ReactNode; reduced: boolean }) {
  return (
    <motion.li
      className="flex flex-col gap-3 rounded-cell-alt bg-paper p-3 shadow-well"
      initial={reduced ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring, delay: reduced ? 0 : 0.12 * n }}
    >
      <div aria-hidden="true" className="relative h-44 overflow-hidden rounded-well bg-paper-bright">
        {children}
      </div>
      <div className="flex gap-2.5 px-1">
        <span aria-hidden="true" className="font-display text-2 leading-none text-eosin-deep">
          {n}
        </span>
        <p className="flex flex-col gap-0.5 text--1 leading-body">
          <strong className="font-medium text-ink">{title}</strong>
          <span className="text-ink-soft">{text}</span>
        </p>
      </div>
    </motion.li>
  );
}

const bilayerStrip = (width: number, mode: MembraneMode | null): Draw => (ctx, p) => {
  const gaps = mode ? gatesFor(mode).filter((g) => PROTEIN_GAP[g.route]).map((g) => ({ x: g.x, w: PROTEIN_GAP[g.route]! })) : [];
  drawBilayer(ctx, p, width, gaps, 11);
};

function HowTo({ mode }: { mode: MembraneMode }) {
  const reduced = useReducedMotion();
  const steps = MEMBRANE.howTo.steps[mode];
  const gates = gatesFor(mode);
  const token = tokenDraw(mode === 'avansat' ? 'potasiu-intra' : 'oxigen');
  const stripH = 2 * (MEMBRANE_HALF + BILAYER_PAD);
  const gatesH = gateHeight() + 8;
  const target = gates.find((g) => g.route === (mode === 'avansat' ? 'pompa' : 'dublu-strat'))!;

  // Step 2 shows only the stretch of membrane that holds the gates, so they stay large
  const x0 = Math.min(...gates.map((g) => g.x - g.width / 2)) - 8;
  const cropW = Math.max(...gates.map((g) => g.x + g.width / 2)) + 8 - x0;
  const at = (x: number) => `${((x - x0) / cropW) * 100}%`;

  return (
    <ol aria-label={MEMBRANE.howTo.label} className="grid gap-3 md:grid-cols-3">
      <Step n={1} title={steps[0].title} text={steps[0].text} reduced={reduced}>
        <div className="absolute inset-x-0 bottom-0">
          <ArtCanvas width={560} height={stripH} draw={bilayerStrip(560, null)} />
        </div>
        <div className="absolute left-1/2 top-2 w-[34%] -translate-x-1/2">
          <Loop reduced={reduced} y={26}>
            <ArtCanvas width={token.w} height={token.h} draw={token.draw} />
          </Loop>
        </div>
      </Step>

      <Step n={2} title={steps[1].title} text={steps[1].text} reduced={reduced}>
        <div className="absolute inset-x-0 bottom-7">
          <ArtCanvas
            width={cropW}
            height={gatesH}
            draw={(ctx, p) => {
              ctx.translate(-x0, 0);
              ctx.save();
              ctx.translate(0, gatesH / 2 - stripH / 2);
              bilayerStrip(560, mode)(ctx, p);
              ctx.restore();
              for (const g of gates) drawGate(ctx, p, g.route, g.x, gatesH / 2, g.width);
            }}
          />
        </div>
        <div className="absolute inset-x-0 bottom-1.5">
          {gates.map((g) => (
            <span key={g.route} className="absolute bottom-0 -translate-x-1/2" style={{ left: at(g.x) }}>
              <Keycap>{String(g.key)}</Keycap>
            </span>
          ))}
        </div>
        <div className="absolute top-1 w-[26%] -translate-x-1/2" style={{ left: `calc(${at(target.x)} + 12%)` }}>
          <Loop reduced={reduced} x={-18} y={16} delay={0.3}>
            <ArtCanvas width={token.w} height={token.h} draw={token.draw} />
          </Loop>
        </div>
      </Step>

      <Step n={3} title={steps[2].title} text={steps[2].text} reduced={reduced}>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5">
          {reduced ? (
            <Sprite id="eritrocit" size="lg" />
          ) : (
            <motion.div
              initial={{ scale: 0.84 }}
              animate={{ scale: 1.12 }}
              transition={{ type: 'spring', stiffness: 30, damping: 5, repeat: Infinity, repeatType: 'reverse', repeatDelay: 0.5 }}
            >
              <Sprite id="eritrocit" size="lg" />
            </motion.div>
          )}
          <div className="relative h-3 w-3/4 overflow-hidden rounded-full bg-paper-deep shadow-well">
            <span
              className="absolute inset-y-0 bg-methylene-200"
              style={{
                left: `${((OSMOSIS.safe[0] - OSMOSIS.limits[0]) / (OSMOSIS.limits[1] - OSMOSIS.limits[0])) * 100}%`,
                right: `${((OSMOSIS.limits[1] - OSMOSIS.safe[1]) / (OSMOSIS.limits[1] - OSMOSIS.limits[0])) * 100}%`,
              }}
            />
          </div>
          <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text--2 text-ink-soft">
            <span className="flex items-center gap-1">
              {MEMBRANE.osmosis.salt} <Keycap>{MEMBRANE.osmosis.saltKey}</Keycap>
            </span>
            <span className="flex items-center gap-1">
              {MEMBRANE.osmosis.dilute} <Keycap>{MEMBRANE.osmosis.diluteKey}</Keycap>
            </span>
          </div>
        </div>
      </Step>
    </ol>
  );
}

export function BaseHowTo() {
  return <HowTo mode="baza" />;
}

export function AdvancedHowTo() {
  return <HowTo mode="avansat" />;
}
