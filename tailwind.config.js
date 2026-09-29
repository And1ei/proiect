/** @type {import('tailwindcss').Config} */

// Every value resolves to a CSS variable in src/styles/tokens.css.
// `colors` is replaced (not extended) so default Tailwind palettes are unavailable.
const v = (name) => `var(--${name})`;

export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      paper: {
        DEFAULT: v('paper'),
        bright: v('paper-bright'),
        deep: v('paper-deep'),
        shade: v('paper-shade'),
      },
      ink: {
        DEFAULT: v('ink'),
        soft: v('ink-soft'),
        faint: v('ink-faint'),
      },
      eosin: {
        50: v('eosin-50'),
        100: v('eosin-100'),
        200: v('eosin-200'),
        DEFAULT: v('eosin'),
        deep: v('eosin-deep'),
      },
      methylene: {
        50: v('methylene-50'),
        100: v('methylene-100'),
        200: v('methylene-200'),
        DEFAULT: v('methylene'),
        deep: v('methylene-deep'),
      },
      iodine: {
        100: v('iodine-100'),
        200: v('iodine-200'),
        DEFAULT: v('iodine'),
        deep: v('iodine-deep'),
      },
      safranin: {
        50: v('safranin-50'),
        100: v('safranin-100'),
        200: v('safranin-200'),
        DEFAULT: v('safranin'),
        deep: v('safranin-deep'),
      },
      hematoxylin: {
        50: v('hematoxylin-50'),
        100: v('hematoxylin-100'),
        200: v('hematoxylin-200'),
        DEFAULT: v('hematoxylin'),
        deep: v('hematoxylin-deep'),
      },
    },
    fontFamily: {
      display: v('font-display'),
      sans: v('font-body'),
      mono: v('font-mono'),
    },
    fontSize: {
      '-2': v('step--2'),
      '-1': v('step--1'),
      0: v('step-0'),
      1: v('step-1'),
      2: v('step-2'),
      3: v('step-3'),
      4: v('step-4'),
      5: v('step-5'),
      6: v('step-6'),
    },
    extend: {
      lineHeight: {
        display: v('leading-display'),
        heading: v('leading-heading'),
        body: v('leading-body'),
      },
      letterSpacing: {
        display: v('tracking-display'),
        label: v('tracking-label'),
      },
      borderRadius: {
        'blob-a': v('blob-a'),
        'blob-b': v('blob-b'),
        'blob-c': v('blob-c'),
        'blob-d': v('blob-d'),
        'btn-a': v('btn-a'),
        'btn-b': v('btn-b'),
        'btn-c': v('btn-c'),
        'btn-d': v('btn-d'),
        cell: v('radius-cell'),
        'cell-alt': v('radius-cell-alt'),
        tag: v('radius-tag'),
        well: v('radius-well'),
      },
      boxShadow: {
        rest: v('shadow-rest'),
        pressed: v('shadow-pressed'),
        card: v('shadow-card'),
        well: v('shadow-well'),
      },
      spacing: {
        gutter: v('gutter'),
        section: v('section-gap'),
      },
      maxWidth: {
        measure: v('measure'),
        container: v('container'),
        narrow: v('container-narrow'),
        wide: v('container-wide'),
      },
      transitionTimingFunction: {
        spring: v('ease-spring'),
      },
      transitionDuration: {
        spring: v('dur-spring'),
      },
    },
  },
  plugins: [],
};
