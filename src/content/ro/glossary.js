// Global glossary. Each id is owned by exactly one lesson (topic.glossaryIds) but may be
// referenced from any lesson with [[id]]. Order here does not matter; pages sort by term.
// Empty until the grade IX lessons are written.

/** @type {import('./schema.js').GlossaryTerm[]} */
const glossary = [];

export const glossaryById = Object.fromEntries(glossary.map((g) => [g.id, g]));

export default glossary;
