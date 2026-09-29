// SANDBOX (dev only). Copy this pattern for real Phaser games:
//   1. The React component is tiny: it renders <PhaserGame> with a design size, an accessible
//      label and a *dynamic import* of the scene module. It never imports 'phaser' itself.
//   2. All gameplay lives in the scene (./scenes.ts), which extends BaseScene.
//   3. The scene reports through the bus (hit / miss / life-lost / near-win / finished); the shell
//      turns that into score, streak, sound, particles, announcements and progress.
import PhaserGame from '../../phaser/PhaserGame';
import type { GameProps } from '../../core/types';
import { DRIFT } from '../strings';
import { DESIGN } from './config';

const loadScenes = () => import('./scenes').then((m) => [m.DriftScene]);

export default function DriftGame({ session }: GameProps) {
  return <PhaserGame session={session} design={DESIGN} label={DRIFT.stage} scenes={loadScenes} />;
}
