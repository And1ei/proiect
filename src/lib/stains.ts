// Tailwind can't see dynamic class names, so every stain's classes are spelled out here.
import type { Stain } from '../content/ro/lessons/index.ts';

export interface StainClasses {
  text: string;
  bg: string;
  bgSoft: string;
  border: string;
  ring: string;
  fill: string;
  /** Underline colour for defined terms. */
  decoration: string;
}

export const STAIN: Record<Stain, StainClasses> = {
  eosin: { text: 'text-eosin-deep', bg: 'bg-eosin', bgSoft: 'bg-eosin-100', border: 'border-eosin-deep', ring: 'ring-eosin-deep', fill: 'var(--eosin)', decoration: 'decoration-eosin' },
  methylene: { text: 'text-methylene-deep', bg: 'bg-methylene', bgSoft: 'bg-methylene-100', border: 'border-methylene-deep', ring: 'ring-methylene-deep', fill: 'var(--methylene)', decoration: 'decoration-methylene' },
  iodine: { text: 'text-iodine-deep', bg: 'bg-iodine', bgSoft: 'bg-iodine-100', border: 'border-iodine-deep', ring: 'ring-iodine-deep', fill: 'var(--iodine)', decoration: 'decoration-iodine' },
  safranin: { text: 'text-safranin-deep', bg: 'bg-safranin', bgSoft: 'bg-safranin-100', border: 'border-safranin-deep', ring: 'ring-safranin-deep', fill: 'var(--safranin)', decoration: 'decoration-safranin' },
  hematoxylin: { text: 'text-hematoxylin-deep', bg: 'bg-hematoxylin', bgSoft: 'bg-hematoxylin-100', border: 'border-hematoxylin-deep', ring: 'ring-hematoxylin-deep', fill: 'var(--hematoxylin)', decoration: 'decoration-hematoxylin' },
};
