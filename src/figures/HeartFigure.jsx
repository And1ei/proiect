import Illustration, { Ink } from '../components/illustration/Illustration';
import Annotation from '../components/illustration/Annotation';
import { locale } from '../lib/i18n';

// Schematic heart and circuits, 520 × 560 plate. Right heart (viewer's left) is methylene, blood low in
// oxygen; left heart is eosin, blood rich in oxygen. Every structure carries data-part.

const DEOXY = 'var(--methylene-200)';
const OXY = 'var(--eosin-200)';

/** Ink stroke under a narrower colour stroke: reads as a vessel. */
const Tube = ({ d, fill }) => (
  <>
    <path className="tube" d={d} fill="none" stroke="var(--ink)" strokeWidth="12.5" />
    <path d={d} fill="none" stroke={fill} strokeWidth="9" />
  </>
);
/** Wide invisible stroke so thin vessels are easy to click. */
const Hit = ({ d }) => <path d={d} fill="none" stroke="transparent" strokeWidth="22" />;

const PARTS = {
  'capilare-pulmonare': (
    <>
      <path className="shape" d="M242 108 C 200 116 150 104 148 70 C 146 40 176 22 210 26 C 234 30 244 50 242 108 Z" fill="var(--paper-shade)" />
      <path className="shape" d="M258 108 C 256 50 268 28 296 24 C 336 20 372 42 370 74 C 368 104 318 116 258 108 Z" fill="var(--paper-shade)" />
      <path d="M170 80 C 180 70 190 90 200 78 S 220 88 230 76 M276 80 C 290 68 300 92 312 78 S 336 90 350 76" fill="none" stroke="var(--methylene)" strokeWidth="1.4" />
    </>
  ),
  'atriu-drept': <path className="shape" d="M142 188 C 150 178 226 176 236 186 C 242 206 240 248 234 262 C 210 268 162 268 146 262 C 138 240 136 206 142 188 Z" fill="var(--methylene-100)" />,
  'atriu-stang': <path className="shape" d="M378 188 C 370 178 294 176 284 186 C 278 206 280 248 286 262 C 310 268 358 268 374 262 C 382 240 384 206 378 188 Z" fill="var(--eosin-100)" />,
  'ventricul-drept': <path className="shape" d="M146 274 C 180 270 230 270 250 276 C 254 320 246 360 226 386 C 206 402 180 398 164 380 C 146 356 140 312 146 274 Z" fill="var(--methylene-100)" />,
  'ventricul-stang': (
    <>
      <path className="shape" d="M270 276 C 300 270 350 270 376 274 C 382 316 378 360 358 386 C 336 408 300 404 284 386 C 268 360 264 320 270 276 Z" fill="var(--eosin-200)" />
      {/* Inner outline: the thick muscular wall of the left ventricle */}
      <path d="M284 290 C 306 286 344 286 362 289 C 366 320 362 352 346 372 C 330 388 306 386 295 373 C 284 354 280 320 284 290 Z" fill="var(--eosin-100)" strokeWidth="1" />
    </>
  ),
  'valva-tricuspida': (
    <>
      <path className="shape" d="M168 266 L177 283 L186 266 Z M186 266 L195 283 L204 266 Z M204 266 L213 283 L222 266 Z" fill="var(--iodine-100)" strokeWidth="1.3" />
      <circle cx="195" cy="272" r="18" fill="transparent" stroke="none" />
    </>
  ),
  'valva-mitrala': (
    <>
      <path className="shape" d="M298 266 L310 285 L322 266 Z M322 266 L334 285 L346 266 Z" fill="var(--iodine-100)" strokeWidth="1.3" />
      <circle cx="322" cy="273" r="18" fill="transparent" stroke="none" />
    </>
  ),
  'valva-pulmonara': (
    <>
      <path className="shape" d="M243 282 q 2.3 6 4.6 0 q 2.3 6 4.6 0 q 2.3 6 4.6 0" fill="var(--iodine-100)" strokeWidth="1.2" />
      <circle cx="250" cy="283" r="13" fill="transparent" stroke="none" />
    </>
  ),
  'valva-aortica': (
    <>
      <path className="shape" d="M382 323 q 6 2.3 0 4.6 q 6 2.3 0 4.6 q 6 2.3 0 4.6" fill="var(--iodine-100)" strokeWidth="1.2" />
      <circle cx="384" cy="330" r="13" fill="transparent" stroke="none" />
    </>
  ),
  'artere-pulmonare': (
    <>
      <Tube d="M250 276 L250 134 M250 140 C 236 130 224 120 214 108 M250 140 C 266 130 280 120 292 108" fill={DEOXY} />
      <Hit d="M250 270 L250 134" />
    </>
  ),
  'vene-pulmonare': (
    <>
      <Tube d="M335 104 L335 182" fill={OXY} />
      <Hit d="M335 104 L335 182" />
    </>
  ),
  aorta: (
    <>
      <Tube d="M388 330 L430 330 L430 478 L382 478" fill={OXY} />
      <Hit d="M392 330 L430 330 L430 478 L386 478" />
    </>
  ),
  'vene-cave': (
    <>
      <Tube d="M148 482 L90 482 L90 221 L142 221" fill={DEOXY} />
      <Hit d="M146 482 L90 482 L90 221 L140 221" />
    </>
  ),
  'capilare-sistemice': (
    <>
      <path className="shape" d="M150 452 C 200 444 330 444 380 452 C 386 472 386 492 380 508 C 330 516 200 516 150 508 C 144 492 144 472 150 452 Z" fill="var(--paper-shade)" />
      <path d="M170 470 C 190 460 200 486 222 472 S 260 486 280 470 S 330 484 360 470" fill="none" stroke="var(--eosin)" strokeWidth="1.4" />
      <path d="M170 492 C 190 482 200 506 222 494 S 260 506 280 492 S 330 504 360 492" fill="none" stroke="var(--methylene)" strokeWidth="1.4" />
    </>
  ),
};

// Names written inside the larger shapes
const INSIDE = {
  'capilare-pulmonare': [314, 62],
  'capilare-sistemice': [265, 482],
  'atriu-drept': [189, 216],
  'atriu-stang': [331, 216],
  'ventricul-drept': [196, 332],
  'ventricul-stang': [322, 332],
};
// Outside labels with leaders: [x, y, targetX, targetY, anchor]
const OUTSIDE = {
  'artere-pulmonare': [232, 150, 250, 166, 'end'],
  'vene-pulmonare': [346, 142, 336, 146, 'start'],
  'valva-tricuspida': [80, 258, 180, 273, 'end'],
  'valva-pulmonara': [80, 318, 247, 284, 'end'],
  'valva-mitrala': [392, 258, 334, 276, 'start'],
  'valva-aortica': [444, 300, 384, 328, 'start'],
  aorta: [440, 402, 430, 402, 'start'],
  'vene-cave': [80, 398, 90, 398, 'end'],
};

function InsideLabel({ lines, x, y }) {
  const rows = (Array.isArray(lines) ? lines : [lines]).map((l) => l.toLocaleUpperCase(locale));
  return (
    <text x={x} y={y - ((rows.length - 1) * 14) / 2} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="11" letterSpacing="0.08em" fill="var(--ink)" pointerEvents="none" aria-hidden="true">
      {rows.map((r, i) => (
        <tspan key={r} x={x} dy={i === 0 ? 0 : 14}>
          {r}
        </tspan>
      ))}
    </text>
  );
}

/**
 * The heart plate. Static by default; with `interactive`, every structure is a focusable button
 * that calls onActivate(part, element). `lit` parts are outlined; `children` draw above (routes).
 */
export default function HeartFigure({ meta, interactive = false, lit = [], onActivate, children }) {
  const labelText = (id) => [].concat(meta.labels[id]).join(' ');
  const activate = (id) => (e) => {
    if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    onActivate?.(id, e.currentTarget);
  };

  return (
    <Illustration viewBox="0 0 520 560" title={meta.title} desc={meta.desc} role={interactive ? 'group' : 'img'} className="mx-auto max-w-[34rem]">
      <Ink>
        {Object.entries(PARTS).map(([id, shape]) => (
          <g
            key={id}
            data-part={id}
            data-lit={lit.includes(id) || undefined}
            {...(interactive && {
              role: 'button',
              tabIndex: 0,
              'aria-label': labelText(id),
              'aria-pressed': lit.includes(id),
              onClick: activate(id),
              onKeyDown: activate(id),
              className: 'heart-part cursor-pointer',
            })}
          >
            {shape}
          </g>
        ))}
      </Ink>
      {Object.entries(INSIDE).map(([id, [x, y]]) => (
        <InsideLabel key={id} lines={meta.labels[id]} x={x} y={y} />
      ))}
      {Object.entries(OUTSIDE).map(([id, [x, y, tx, ty, anchor]]) => (
        <Annotation key={id} part={id} lines={meta.labels[id]} x={x} y={y} tx={tx} ty={ty} anchor={anchor} />
      ))}
      <g pointerEvents="none">{children}</g>
    </Illustration>
  );
}
