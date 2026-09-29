import Illustration, { Ink } from '../components/illustration/Illustration';
import Annotation from '../components/illustration/Annotation';

// Schematic neuron, vertical so labels stay legible on phones. 480 × 660 plate.
// Every labelled part carries data-part (Module 3 hotspots target these ids).

const DENDRITES = [
  'M204 146 C 176 118 150 96 118 84',
  'M152 100 C 142 76 136 60 124 44',
  'M226 124 C 220 94 212 64 198 34',
  'M216 84 C 234 64 248 52 264 38',
  'M258 126 C 278 96 300 76 332 64',
  'M302 80 C 322 74 342 80 364 76',
  'M318 70 C 322 52 330 40 342 28',
  'M294 164 C 322 156 350 158 380 150',
  'M196 164 C 166 156 138 148 106 152',
  'M136 150 C 124 134 110 124 94 122',
];

const TERMINALS = [
  'M240 560 C 230 578 212 592 190 602',
  'M240 560 C 236 584 230 604 224 620',
  'M240 560 C 244 584 250 604 256 620',
  'M240 560 C 250 578 268 592 290 602',
];
const BOUTONS = [
  [188, 604],
  [223, 624],
  [257, 624],
  [292, 604],
];

// Myelin segments along the axon; the gaps between them are the Ranvier nodes
const MYELIN = [
  [284, 340],
  [352, 408],
  [420, 476],
  [488, 540],
];

/** Draws a tube: an ink stroke with a narrower fill stroke on top. */
function Tube({ d, width = 7.5, fill = 'var(--eosin-200)' }) {
  return (
    <>
      <path d={d} fill="none" stroke="var(--ink)" strokeWidth={width + 3.5} />
      <path d={d} fill="none" stroke={fill} strokeWidth={width} />
    </>
  );
}

export default function NeuronFigure({ meta }) {
  const L = meta.labels;
  return (
    <Illustration viewBox="0 0 480 660" title={meta.title} desc={meta.desc} className="mx-auto max-w-[26rem]">
      <Ink>
        <g data-part="dendrite">
          {DENDRITES.map((d) => (
            <Tube key={d} d={d} width={6.5} />
          ))}
        </g>

        <g data-part="axon">
          <Tube d="M240 262 L 240 560" width={8} />
          <g data-part="butoni-terminali">
            {TERMINALS.map((d) => (
              <Tube key={d} d={d} width={5} />
            ))}
            {BOUTONS.map(([cx, cy]) => (
              <circle key={cx} cx={cx} cy={cy} r="8" fill="var(--eosin)" />
            ))}
          </g>
        </g>

        <path
          data-part="con-emergenta"
          d="M222 216 C 230 234 234 250 235 266 L 245 266 C 246 250 250 234 258 216 Z"
          fill="var(--eosin-200)"
        />

        <path
          data-part="corp-celular"
          d="M240 114 C 274 112 300 140 298 172 C 296 204 272 228 242 228 C 208 230 182 204 182 172 C 180 138 206 116 240 114 Z"
          fill="var(--eosin-200)"
        />
        <g data-part="nucleu">
          <circle cx="240" cy="170" r="21" fill="var(--methylene)" />
          <circle cx="247" cy="164" r="5.5" fill="var(--ink)" stroke="none" />
        </g>

        <g data-part="teaca-mielina">
          {MYELIN.map(([y1, y2]) => (
            <rect key={y1} x="227" y={y1} width="26" height={y2 - y1} rx="12" fill="var(--iodine-100)" />
          ))}
        </g>
        {/* Nodes of Ranvier: the bare axon between two segments; transparent hit areas for hotspots */}
        <g data-part="strangulatie-ranvier" fill="transparent" stroke="none">
          {MYELIN.slice(0, -1).map(([, y2], i) => (
            <rect key={y2} x="224" y={y2 - 2} width="32" height={MYELIN[i + 1][0] - y2 + 4} />
          ))}
        </g>

        <g data-part="sens-impuls" fill="none" strokeWidth="2">
          <path d="M318 430 C 314 460 316 492 314 522" />
          <path d="M304 508 C 308 514 312 520 314 526 C 318 518 322 512 326 506" />
        </g>
      </Ink>

      {/* Left labels end at x=168 (anchor end), right labels start at x=320, so leaders never cross text */}
      <Annotation part="dendrite" lines={L.dendrite} x={112} y={22} tx={126} ty={48} anchor="end" />
      <Annotation part="nucleu" lines={L.nucleu} x={168} y={206} tx={230} ty={178} anchor="end" />
      <Annotation part="con-emergenta" lines={L['con-emergenta']} x={168} y={246} tx={234} ty={250} anchor="end" />
      <Annotation part="strangulatie-ranvier" lines={L['strangulatie-ranvier']} x={168} y={404} tx={236} ty={414} anchor="end" />
      <Annotation part="butoni-terminali" lines={L['butoni-terminali']} x={160} y={600} tx={181} ty={606} anchor="end" />

      <Annotation part="corp-celular" lines={L['corp-celular']} x={320} y={208} tx={290} ty={198} />
      <Annotation part="axon" lines={L.axon} x={320} y={278} tx={244} ty={274} />
      <Annotation part="teaca-mielina" lines={L['teaca-mielina']} x={320} y={322} tx={253} ty={316} />
      <Annotation part="sens-impuls" lines={L['sens-impuls']} x={340} y={470} tx={320} ty={474} />
    </Illustration>
  );
}
