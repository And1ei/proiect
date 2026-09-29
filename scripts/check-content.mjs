// Validates lesson content. Fails on structural problems, warns on editorial ones.
// Usage: npm run check:content
import { readdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { TOPIC_SLUGS, UNITS } from '../src/content/ro/topics/registry.js';
import glossary from '../src/content/ro/glossary.js';
import { FIGURES } from '../src/content/ro/figures.js';
import { INTERACTIVE_TYPES } from '../src/interactives/types.js';
import { BLOCK_TYPES, NOTE_KINDS, QUIZ_MIX } from '../src/content/ro/schema.js';
import { termIdsIn, topicBodyText } from '../src/content/ro/markup.js';

const topicsDir = join(dirname(fileURLToPath(import.meta.url)), '../src/content/ro/topics');
const errors = [];
const warnings = [];
const fail = (where, msg) => errors.push(`${where}: ${msg}`);
const warn = (where, msg) => warnings.push(`${where}: ${msg}`);

const CEDILLA = /[ŞşŢţ]/;
const EM_DASH = /—/;
const isStr = (v) => typeof v === 'string' && v.trim().length > 0;
const isIdx = (v, len) => Number.isInteger(v) && v >= 0 && v < len;
const glossaryById = Object.fromEntries(glossary.map((g) => [g.id, g]));

// Every string anywhere in an object, with its path
function* strings(value, path) {
  if (typeof value === 'string') yield [path, value];
  else if (Array.isArray(value)) for (const [i, v] of value.entries()) yield* strings(v, `${path}[${i}]`);
  else if (value && typeof value === 'object') for (const [k, v] of Object.entries(value)) yield* strings(v, `${path}.${k}`);
}

function checkText(where, obj) {
  for (const [path, s] of strings(obj, where)) {
    if (CEDILLA.test(s)) fail(path, 'cedilla diacritic (use ș ț with comma below)');
    if (EM_DASH.test(s)) fail(path, 'em dash in user-facing text');
    if (s.includes('!')) fail(path, 'exclamation mark');
    if (/"/.test(s)) warn(path, 'straight double quote; use „ ”');
    for (const id of termIdsIn(s)) if (!glossaryById[id]) fail(path, `[[${id}]] is not in the glossary`);
  }
}

// ── Glossary ──
const seen = new Set();
for (const [i, g] of glossary.entries()) {
  const where = `glossary[${i}]`;
  if (!isStr(g.id) || !/^[a-z0-9-]+$/.test(g.id)) fail(where, 'id must be lowercase ASCII with hyphens');
  if (seen.has(g.id)) fail(where, `duplicate id "${g.id}"`);
  seen.add(g.id);
  if (!isStr(g.term)) fail(where, 'missing term');
  if (!isStr(g.definition)) fail(where, 'missing definition');
  for (const ref of g.seeAlso ?? []) if (!glossary.some((o) => o.id === ref)) fail(where, `seeAlso "${ref}" is not in the glossary`);
}
checkText('glossary', glossary);

// ── Lessons ──
const owners = new Map();
const usedIds = new Set();
const unitIds = new Set(UNITS.map((u) => u.id));
const files = readdirSync(topicsDir).filter((f) => f.endsWith('.js') && !['index.js', 'registry.js'].includes(f));
for (const f of files) if (!TOPIC_SLUGS.includes(f.replace(/\.js$/, ''))) warn(f, 'file exists but is not in registry.js');

for (const slug of TOPIC_SLUGS) {
  const where = slug;
  let topic;
  try {
    topic = (await import(pathToFileURL(join(topicsDir, `${slug}.js`)).href)).default;
  } catch (e) {
    fail(where, `cannot load file: ${e.message}`);
    continue;
  }

  for (const key of ['slug', 'title', 'summary', 'grade']) if (!isStr(topic[key])) fail(where, `missing ${key}`);
  if (topic.slug !== slug) fail(where, `slug "${topic.slug}" does not match file name`);
  if (!unitIds.has(topic.unit)) fail(where, `unknown unit ${topic.unit}`);
  if (!Number.isInteger(topic.order)) fail(where, 'missing order');
  if (!Number.isInteger(topic.fig?.number) || !isStr(topic.fig?.label)) fail(where, 'fig needs { number, label }');
  if (!Number.isInteger(topic.readMinutes) || topic.readMinutes < 4 || topic.readMinutes > 6) fail(where, 'readMinutes must be 4 to 6');
  if (!Array.isArray(topic.objectives) || topic.objectives.length !== 3 || !topic.objectives.every(isStr)) fail(where, 'needs exactly 3 objectives');
  if (typeof topic.reviewed !== 'boolean') fail(where, 'reviewed must be true or false');
  else if (!topic.reviewed) warn(where, 'reviewed: false (content not yet checked by a reviewer)');

  // Glossary ownership
  const gids = topic.glossaryIds ?? [];
  if (gids.length < 4 || gids.length > 8) fail(where, `glossaryIds must have 4 to 8 ids (has ${gids.length})`);
  for (const id of gids) {
    if (!glossaryById[id]) fail(where, `glossaryIds: "${id}" is not in the glossary`);
    if (owners.has(id)) fail(where, `glossary id "${id}" already owned by ${owners.get(id)}`);
    owners.set(id, slug);
  }

  // Sections and blocks
  const sections = topic.sections ?? [];
  if (sections.length < 4 || sections.length > 6) fail(where, `needs 4 to 6 sections (has ${sections.length})`);
  const sectionIds = new Set();
  let interactiveBlocks = 0;
  const notes = { retine: 0, stiai: 0 };
  const referenced = new Set();
  for (const [si, s] of sections.entries()) {
    const sw = `${where}.sections[${si}]`;
    if (!isStr(s.id) || !/^[a-z0-9-]+$/.test(s.id)) fail(sw, 'id must be lowercase ASCII with hyphens');
    if (sectionIds.has(s.id)) fail(sw, `duplicate section id "${s.id}"`);
    sectionIds.add(s.id);
    if (!isStr(s.heading)) fail(sw, 'missing heading');
    if (!Array.isArray(s.blocks) || s.blocks.length === 0) fail(sw, 'no blocks');
    for (const [bi, b] of (s.blocks ?? []).entries()) {
      const bw = `${sw}.blocks[${bi}]`;
      if (!BLOCK_TYPES.includes(b.type)) fail(bw, `unknown block type "${b.type}"`);
      if ((b.type === 'p' || b.type === 'note') && !isStr(b.text)) fail(bw, 'missing text');
      if (b.type === 'list' && (!Array.isArray(b.items) || !b.items.length || !b.items.every(isStr))) fail(bw, 'list needs items');
      if (b.type === 'note') {
        if (!NOTE_KINDS.includes(b.kind)) fail(bw, `note kind must be ${NOTE_KINDS.join(' or ')}`);
        else notes[b.kind] += 1;
      }
      if (b.type === 'figure' && !FIGURES[b.ref]) fail(bw, `figure "${b.ref}" is not in figures.js`);
      if (b.type === 'interactive') interactiveBlocks += 1;
      for (const [, text] of strings(b, bw)) termIdsIn(text).forEach((id) => referenced.add(id));
    }
  }
  if (interactiveBlocks !== 1) fail(where, `needs exactly one interactive block (has ${interactiveBlocks})`);
  if (!INTERACTIVE_TYPES.includes(topic.interactive?.type)) fail(where, `interactive.type must be one of ${INTERACTIVE_TYPES.join(', ')}`);
  if (notes.retine < 2 || notes.retine > 3) fail(where, `needs 2 to 3 "retine" notes (has ${notes.retine})`);
  if (notes.stiai > 1) fail(where, `at most one "stiai" note (has ${notes.stiai})`);
  for (const id of gids) if (!referenced.has(id)) warn(where, `owns "${id}" but never marks it with [[${id}]]`);
  referenced.forEach((id) => usedIds.add(id));

  const words = topicBodyText(topic, glossaryById).split(/\s+/).filter(Boolean).length;
  if (words < 500 || words > 800) warn(where, `body text is ${words} words (target 500 to 800)`);

  // Quiz
  const quiz = topic.quiz ?? [];
  if (quiz.length !== 5) fail(where, `quiz needs exactly 5 items (has ${quiz.length})`);
  const mix = { grila: 0, af: 0, completare: 0 };
  for (const [qi, q] of quiz.entries()) {
    const qw = `${where}.quiz[${qi}]`;
    if (!(q.type in mix)) {
      fail(qw, `unknown quiz type "${q.type}"`);
      continue;
    }
    mix[q.type] += 1;
    if (!isStr(q.explanation)) fail(qw, 'missing explanation');
    if (q.type === 'grila') {
      if (!isStr(q.prompt)) fail(qw, 'missing prompt');
      if (!Array.isArray(q.options) || q.options.length !== 4) fail(qw, 'grila needs exactly 4 options');
      if (!isIdx(q.answer, q.options?.length ?? 0)) fail(qw, 'missing or invalid answer');
    }
    if (q.type === 'af') {
      if (!isStr(q.statement)) fail(qw, 'missing statement');
      if (typeof q.isTrue !== 'boolean') fail(qw, 'missing answer (isTrue)');
      if (q.isTrue === false) {
        if (!Array.isArray(q.fixes) || q.fixes.length !== 3) fail(qw, 'false statements need exactly 3 fixes');
        if (!isIdx(q.correctFix, q.fixes?.length ?? 0)) fail(qw, 'missing or invalid correctFix');
      }
      if (q.isTrue === true && (q.fixes || q.correctFix !== undefined)) fail(qw, 'true statements must not have fixes');
    }
    if (q.type === 'completare') {
      if (!isStr(q.sentence) || (q.sentence.match(/___/g) ?? []).length !== 1) fail(qw, 'sentence needs exactly one ___');
      if (!Array.isArray(q.options) || q.options.length < 2) fail(qw, 'needs at least 2 options');
      if (!isIdx(q.answer, q.options?.length ?? 0)) fail(qw, 'missing or invalid answer');
    }
  }
  for (const [type, n] of Object.entries(QUIZ_MIX)) if (mix[type] !== n) fail(where, `quiz needs ${n} ${type} items (has ${mix[type]})`);

  checkText(where, topic);
}

for (const g of glossary) if (!owners.has(g.id)) warn(`glossary.${g.id}`, 'not owned by any lesson');
for (const g of glossary) if (!usedIds.has(g.id)) warn(`glossary.${g.id}`, 'never referenced in lesson text');

for (const w of warnings) console.warn(`warn  ${w}`);
for (const e of errors) console.error(`FAIL  ${e}`);
console.log(`\ncheck-content: ${TOPIC_SLUGS.length} lessons, ${glossary.length} glossary terms, ${errors.length} error(s), ${warnings.length} warning(s)`);
process.exitCode = errors.length ? 1 : 0;
