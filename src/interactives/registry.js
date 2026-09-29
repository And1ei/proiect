// Interactive type → lazy loader. A null entry would make <InteractiveSlot> show its placeholder.
// Module 3 build order: punnett, decoder, heart, reflexArc, ventilation.
// Each component receives { config, topic } props.
import { INTERACTIVE_TYPES } from './types.js';

export const INTERACTIVE_LOADERS = {
  punnett: () => import('../features/interactives/punnett/PunnettBuilder.jsx'),
  decoder: () => import('../features/interactives/decoder/DnaDecoder.jsx'),
  heart: () => import('../features/interactives/heart/HeartTracer.jsx'),
  reflexArc: () => import('../features/interactives/reflex/ReflexArc.jsx'),
  ventilation: () => import('../features/interactives/ventilation/VentilationLab.jsx'),
};

export { INTERACTIVE_TYPES };
