import { motion, useTransform } from 'motion/react';
import Illustration, { Ink } from '../../../components/illustration/Illustration';
import Annotation from '../../../components/illustration/Annotation';

// Chest schematic, 260 × 280 plate, driven by the lung volume. t = 0 at maximal expiration,
// 1 at maximal inspiration: the diaphragm dome flattens and drops, the ribs lift, the lungs grow.

const LUNG_L = 'M122 70 C 96 72 72 104 70 150 C 68 186 80 204 100 206 C 114 207 122 196 124 176 Z';
const LUNG_R = 'M138 70 C 164 72 188 104 190 150 C 192 186 180 204 160 206 C 146 207 138 196 136 176 Z';
const RIBS = [96, 118, 140, 162, 184];

export default function ThoraxFigure({ volume, levels, text }) {
  const t = useTransform(volume, [levels.RV, levels.TLC], [0, 1]);
  const lungScale = useTransform(t, [0, 1], [0.86, 1.12]);
  const ribLift = useTransform(t, [0, 1], [3, -5]);
  // Dome apex drops and flattens as the diaphragm contracts
  const dome = useTransform(t, (v) => {
    const apex = 176 + v * 34;
    const edge = 226 + v * 6;
    return `M50 ${edge} C 70 ${apex - 20}, 110 ${apex}, 130 ${apex} C 150 ${apex}, 190 ${apex - 20}, 210 ${edge}`;
  });

  return (
    <Illustration viewBox="0 0 260 280" title={text.figureTitle} desc={text.figureDesc} className="mx-auto max-w-[17rem]">
      <Ink>
        {/* Trachea and main bronchi */}
        <path d="M130 20 L130 64 M130 64 C 126 70 122 72 116 76 M130 64 C 134 70 138 72 144 76" fill="none" stroke="var(--ink)" strokeWidth="7" />
        <path d="M130 20 L130 64" fill="none" stroke="var(--paper-bright)" strokeWidth="3.5" />
        {/* Ribs rise at inspiration */}
        <motion.g style={{ y: ribLift }} fill="none" strokeWidth="2">
          {RIBS.map((y) => (
            <path key={y} d={`M40 ${y + 14} C 60 ${y - 6}, 110 ${y - 12}, 130 ${y - 12} C 150 ${y - 12}, 200 ${y - 6}, 220 ${y + 14}`} opacity="0.55" />
          ))}
        </motion.g>
        {/* Parietal pleura on the chest wall */}
        <path data-part="pleura" d="M56 214 C 48 150 60 88 108 64 M204 214 C 212 150 200 88 152 64" fill="none" strokeWidth="1.4" strokeDasharray="4 3" />
        {/* Lungs with their visceral pleura (the outline) */}
        <motion.g style={{ scale: lungScale, originX: '130px', originY: '206px' }}>
          <path data-part="plaman" d={LUNG_L} fill="var(--eosin-100)" />
          <path data-part="plaman" d={LUNG_R} fill="var(--eosin-100)" />
        </motion.g>
        <motion.path data-part="diafragma" d={dome} fill="none" stroke="var(--eosin-deep)" strokeWidth="4" />
      </Ink>
      <Annotation part="pleura" lines={text.pleuraLabel} x={10} y={40} tx={66} ty={108} anchor="start" />
      <Annotation part="diafragma" lines={text.diaphragmLabel} x={22} y={262} tx={70} ty={220} anchor="start" />
    </Illustration>
  );
}
