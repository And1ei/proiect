// Inline markup shared by the renderer and scripts/check-content.mjs.
// [[id|shown text]] links a glossary term; [[id]] shows the glossary term itself.

export const TERM_PATTERN = /\[\[([a-z0-9-]+)(?:\|([^\]]+))?\]\]/g;

/** Splits text into plain strings and { termId, label } parts (label null for [[id]]). */
export function parseInline(text) {
  const parts = [];
  let last = 0;
  for (const m of text.matchAll(TERM_PATTERN)) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push({ termId: m[1], label: m[2] ?? null });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

/** Every glossary id referenced in a piece of text. */
export const termIdsIn = (text) => [...text.matchAll(TERM_PATTERN)].map((m) => m[1]);

/** Plain text with markup removed (for word counts and search). */
export const stripMarkup = (text, glossaryById = {}) =>
  text.replace(TERM_PATTERN, (m, id, label) => label ?? glossaryById[id]?.term ?? id);

/** All readable text of a topic's sections, in order (for word counts). */
export function topicBodyText(topic, glossaryById) {
  const out = [];
  for (const section of topic.sections) {
    for (const block of section.blocks) {
      if (block.type === 'p' || block.type === 'note') out.push(block.text);
      if (block.type === 'list') out.push(...block.items);
    }
  }
  return out.map((s) => stripMarkup(s, glossaryById)).join(' ');
}
