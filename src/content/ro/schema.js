// Content model for lessons. Types only (JSDoc); validated by scripts/check-content.mjs.
// Inline glossary markup inside any text field: [[id|shown text]], or [[id]] to show the
// glossary term itself. See ./markup.js.

/**
 * @typedef {Object} Topic
 * @property {string} slug            URL segment, also the file name in ./topics
 * @property {number} unit            Unit id from ./topics/registry.js
 * @property {number} order           Position in the curriculum (nav order)
 * @property {{ number: number, label: string }} fig  Specimen tag, e.g. { number: 1, label: 'Nervos' }
 * @property {string} title
 * @property {string} summary         One or two sentences, also used as meta description
 * @property {string} grade           e.g. 'a XI-a'
 * @property {number} readMinutes     4 to 6
 * @property {string[]} objectives    Exactly 3, each starting with a verb
 * @property {Section[]} sections     4 to 6
 * @property {string[]} glossaryIds   4 to 8 ids this lesson owns; unique across lessons
 * @property {QuizItem[]} quiz        Exactly 5: 2 grila, 2 af, 1 completare
 * @property {{ type: InteractiveType, config: Object }} interactive
 * @property {boolean} reviewed       Set to true only after a subject-matter review
 */

/**
 * @typedef {Object} Section
 * @property {string} id              Unique within the lesson; used as DOM id and in progress
 * @property {string} heading
 * @property {Block[]} blocks
 */

/**
 * @typedef {ParagraphBlock | ListBlock | NoteBlock | FigureBlock | InteractiveBlock} Block
 * @typedef {{ type: 'p', text: string }} ParagraphBlock
 * @typedef {{ type: 'list', ordered?: boolean, items: string[] }} ListBlock
 * @typedef {{ type: 'note', kind: 'retine' | 'stiai', text: string }} NoteBlock
 *   Rendered in the right margin from 1024px, inline below that; attaches to the block before it.
 * @typedef {{ type: 'figure', ref: string }} FigureBlock        ref: id in ./figures.js
 * @typedef {{ type: 'interactive' }} InteractiveBlock           renders topic.interactive
 */

/**
 * @typedef {'punnett' | 'decoder' | 'heart' | 'reflexArc' | 'ventilation'} InteractiveType
 */

/**
 * @typedef {GrilaItem | AfItem | CompletareItem} QuizItem
 * @typedef {Object} GrilaItem
 * @property {'grila'} type
 * @property {string} prompt
 * @property {string[]} options       Exactly 4
 * @property {number} answer          Index of the correct option
 * @property {string} explanation
 *
 * @typedef {Object} AfItem           Adevărat / fals
 * @property {'af'} type
 * @property {string} statement
 * @property {boolean} isTrue
 * @property {string[]} [fixes]       Exactly 3 rewrites, only when isTrue is false
 * @property {number} [correctFix]    Index into fixes, only when isTrue is false
 * @property {string} explanation
 *
 * @typedef {Object} CompletareItem
 * @property {'completare'} type
 * @property {string} sentence        Contains exactly one ___ blank
 * @property {string[]} options
 * @property {number} answer          Index of the option that fills the blank
 * @property {string} explanation
 */

/**
 * @typedef {Object} GlossaryTerm
 * @property {string} id              Lowercase ASCII, hyphenated; referenced as [[id]]
 * @property {string} term            Display form, with diacritics
 * @property {string} definition
 * @property {string[]} [seeAlso]    Related glossary ids, shown as „Vezi și” links
 */

export const BLOCK_TYPES = ['p', 'list', 'note', 'figure', 'interactive'];
export const NOTE_KINDS = ['retine', 'stiai'];
export const QUIZ_TYPES = ['grila', 'af', 'completare'];
export const QUIZ_MIX = { grila: 2, af: 2, completare: 1 };
