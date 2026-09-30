// Lesson rules (run before every build): npm run lessons:check
// Fails on: a section that mentions a game with none placed at or right after it, a quiz that
// isn't 3 questions (5 for a topic without a game), a section over 170 words, fewer than 4 or more than 5 sections, a duplicate section id,
// a key point over 20 words, a game id that isn't registered, a game slot after a missing section,
// a quiz or game-data lessonSection pointing to a missing section, cedilla ș/ț. Warns over 130 words.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { LESSONS, sectionWords, words, readingMinutes, lessonWords } from '../src/content/ro/lessons/index.ts';

const root = new URL('..', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');
const errors = [];
const warnings = [];
const fail = (where, msg) => errors.push(`${where}: ${msg}`);
const warn = (where, msg) => warnings.push(`${where}: ${msg}`);
const CEDILLA = new RegExp(`[${String.fromCharCode(0x15f, 0x163, 0x15e, 0x162)}]`);

// Registered game ids: every defineGame({ id }) in the files the registry imports
const walk = (dir) => readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? walk(join(dir, f)) : [join(dir, f)]));
const definitionFiles = walk(join(root, 'src/games')).filter((f) => /definitions\.ts$/.test(f) && !/sandbox/.test(f));
const gameIds = new Set(definitionFiles.flatMap((f) => [...readFileSync(f, 'utf8').matchAll(/\bid: '([a-z0-9-]+)'/g)].map((m) => m[1])));

const slugs = new Set();
for (const lesson of LESSONS) {
  const where = lesson.slug;
  if (slugs.has(lesson.slug)) fail(where, 'duplicate slug');
  slugs.add(lesson.slug);
  const n = lesson.sections.length;
  if (n < 4 || n > 5) fail(where, `has ${n} sections (4 to 5 allowed)`);
  const ids = new Set();
  for (const s of lesson.sections) {
    const at = `${where}#${s.id}`;
    if (ids.has(s.id)) fail(at, 'duplicate section id');
    ids.add(s.id);
    if (!/^[a-z0-9-]+$/.test(s.id)) fail(at, 'section id must be lowercase-hyphenated');
    const w = sectionWords(s);
    if (w > 170) fail(at, `${w} words (max 170)`);
    else if (w > 130) warn(at, `${w} words (aim for at most 130)`);
    if (w < 60) warn(at, `${w} words (aim for at least 60)`);
    if (s.margin && s.margin.includes('\n')) fail(at, 'margin note must be one line');
  }
  if (lesson.keyPoints.length !== 3) fail(where, 'keyPoints must have exactly 3 items');
  lesson.keyPoints.forEach((k, i) => words(k) > 20 && fail(`${where} keyPoints[${i}]`, `${words(k)} words (max 20)`));
  for (const g of lesson.games) {
    if (!gameIds.has(g.gameId)) fail(where, `game "${g.gameId}" is not in the registry`);
    if (!ids.has(g.afterSection)) fail(where, `game "${g.gameId}" placed after missing section "${g.afterSection}"`);
  }
  // F1: lesson prose never sets up a game that isn't there. A section whose text mentions a game
  // (joc, jocul, joacă…) needs a registered game placed at it or right after it.
  const placed = lesson.games.filter((g) => gameIds.has(g.gameId)).map((g) => lesson.sections.findIndex((s) => s.id === g.afterSection));
  lesson.sections.forEach((s, i) => {
    const text = [...s.body, s.margin ?? '', s.predict?.question ?? '', s.predict?.answer ?? '', s.title].join(' ');
    if (/(?<!\p{L})(joc|jocul|jocuri|jocurile|jocului|joac[ăa]|juca\p{L}*)(?!\p{L})/iu.test(text) &&!placed.some((k) => k === i || k === i + 1))
      fail(`${where}#${s.id}`, 'mentions a game, but no registered game is placed at or right after this section');
  });
  // F1: a topic without a game stands on its own with a richer check (5 questions); others keep 3
  const wanted = placed.length ? 3 : 5;
  if ((lesson.check ?? []).length !== wanted) fail(where, `"Verifică-te" has ${(lesson.check ?? []).length} questions (${wanted} expected: ${placed.length ? 'the topic has a game' : 'no game in this topic'})`);
  for (const [i, q] of (lesson.check ?? []).entries()) {
    if (!ids.has(q.section)) fail(`${where} check[${i}]`, `links to missing section "${q.section}"`);
    if (!(q.answer >= 0 && q.answer < q.options.length)) fail(`${where} check[${i}]`, 'answer index out of range');
  }
  if (CEDILLA.test(JSON.stringify(lesson))) fail(where, 'cedilla ş/ţ: use comma-below ș/ț');
}

// Game data → lesson sections (the "vezi în lecție" links)
const lessonOf = (slug) => LESSONS.find((l) => l.slug === slug);
for (const f of walk(join(root, 'src/content/ro')).filter((f) => /\.(ts|js)$/.test(f) && !/lessons/.test(f))) {
  const text = readFileSync(f, 'utf8');
  for (const m of text.matchAll(/lessonSection: '([a-z0-9-]+)#([a-z0-9-]+)'/g)) {
    const l = lessonOf(m[1]);
    if (!l || !l.sections.some((s) => s.id === m[2])) fail(f.replace(root, ''), `lessonSection "${m[1]}#${m[2]}" does not exist`);
  }
}

for (const w of warnings) console.log(`warn  ${w}`);
for (const e of errors) console.log(`FAIL  ${e}`);
console.log(
  `\nlessons-check: ${LESSONS.length} lessons, ${LESSONS.map((l) => `${l.slug} ${lessonWords(l)}w ~${readingMinutes(l)} min`).join(', ')}; ${errors.length} error(s), ${warnings.length} warning(s)`,
);
process.exitCode = errors.length ? 1 : 0;
