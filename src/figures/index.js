// Figure drawings, loaded on demand. Text (caption, labels, alt) lives in content/ro/figures.js.
// Module 3 adds the remaining plates here, one line each.
export const FIGURE_LOADERS = {
  neuron: () => import('./NeuronFigure.jsx'),
};
