// Tailwind can't see dynamic class names, so every stain's classes are spelled out here.
import type { Stain } from '../content/ro/lessons/index.ts';

export interface StainClasses {
  text: string;
  bg: string;
  /** Deep stain background (paper-coloured text on it passes AA). */
  bgDeep: string;
  bgSoft: string;
  border: string;
  ring: string;
  fill: string;
  /** Underline colour for defined terms. */
  decoration: string;
}

export const STAIN: Record<Stain, StainClasses> = {
  eosin: { text: 'text-eosin-deep', bg: 'bg-eosin', bgDeep: 'bg-eosin-deep', bgSoft: 'bg-eosin-100', border: 'border-eosin-deep', ring: 'ring-eosin-deep', fill: 'var(--eosin)', decoration: 'decoration-eosin' },
  methylene: { text: 'text-methylene-deep', bg: 'bg-methylene', bgDeep: 'bg-methylene-deep', bgSoft: 'bg-methylene-100', border: 'border-methylene-deep', ring: 'ring-methylene-deep', fill: 'var(--methylene)', decoration: 'decoration-methylene' },
  iodine: { text: 'text-iodine-deep', bg: 'bg-iodine', bgDeep: 'bg-iodine-deep', bgSoft: 'bg-iodine-100', border: 'border-iodine-deep', ring: 'ring-iodine-deep', fill: 'var(--iodine)', decoration: 'decoration-iodine' },
  safranin: { text: 'text-safranin-deep', bg: 'bg-safranin', bgDeep: 'bg-safranin-deep', bgSoft: 'bg-safranin-100', border: 'border-safranin-deep', ring: 'ring-safranin-deep', fill: 'var(--safranin)', decoration: 'decoration-safranin' },
  hematoxylin: { text: 'text-hematoxylin-deep', bg: 'bg-hematoxylin', bgDeep: 'bg-hematoxylin-deep', bgSoft: 'bg-hematoxylin-100', border: 'border-hematoxylin-deep', ring: 'ring-hematoxylin-deep', fill: 'var(--hematoxylin)', decoration: 'decoration-hematoxylin' },
};
