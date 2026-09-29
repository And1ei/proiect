// Feeds old, broken and hostile localStorage payloads through the progress sanitiser.
// None may throw; each must come out as a valid v2 object. Usage: npm run check:progress
import { __test } from '../src/lib/progress.js';

const { sanitize, VERSION } = __test;
const V1_SAMPLE = {
  v: 1,
  topics: {
    'neuron-arc-reflex': { sectionsRead: ['a', 'b'], quizBest: { score: 4, total: 5 }, completed: true, interactive: { completed: true, assisted: false } },
    mendel: { sectionsRead: 'nope', quizBest: { score: 'x' } },
  },
  settings: { sound: true },
};

const cases = [
  ['v1 with old slugs', V1_SAMPLE],
  ['null', null],
  ['number', 42],
  ['array', [1, 2]],
  ['string', 'hello'],
  ['unknown future version', { v: 99, topics: {} }],
  ['v2 with unknown slug', { v: 2, topics: { nope: {}, celula: { sectionsRead: ['x', 'x', 3] } }, games: {}, settings: {} }],
  ['v2 broken games', { v: 2, topics: {}, games: { a: null, b: { bestScore: -5, stars: 9, plays: 1.7, usedHelp: 'yes' } } }],
  ['v2 topics as array', { v: 2, topics: [1], games: 'x' }],
  ['v1 without topics', { v: 1 }],
];

let failures = 0;
const expect = (name, ok, detail) => {
  if (!ok) failures += 1;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  ${detail}` : ''}`);
};

for (const [name, input] of cases) {
  let out;
  try {
    out = sanitize(input);
  } catch (e) {
    expect(name, false, `threw: ${e.message}`);
    continue;
  }
  const valid =
    out.v === VERSION &&
    out.topics && typeof out.topics === 'object' &&
    out.games && typeof out.games === 'object' &&
    typeof out.settings?.sound === 'boolean';
  expect(name, valid, JSON.stringify(out));
}

const v1 = sanitize(V1_SAMPLE);
expect('v1: old topic slugs dropped', Object.keys(v1.topics).length === 0);
expect('v1: sound setting kept', v1.settings.sound === true);
const v2 = sanitize(cases[6][1]);
expect('v2: unknown slug dropped, known slug kept', !('nope' in v2.topics) && 'celula' in v2.topics);
expect('v2: section ids deduped and filtered', JSON.stringify(v2.topics.celula.sectionsRead) === '["x"]');
const g = sanitize(cases[7][1]).games.b;
expect('v2: game fields clamped', g.bestScore === 0 && g.stars === 3 && g.plays === 1 && g.usedHelp === false);

console.log(`\ncheck-progress: ${failures} failure(s)`);
process.exitCode = failures ? 1 : 0;
