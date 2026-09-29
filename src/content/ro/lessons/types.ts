// The shape of a lesson. One file per topic in this folder; index.ts lists them in programa order.
// Inline markup in body, margin, predict and keyPoints: **bold** (a term defined right there) and
// *italic* (Latin names). Nothing else: no links, no term popovers.

/** Histology stain of a topic (a colour family in tokens.css). */
export type Stain = 'eosin' | 'methylene' | 'iodine' | 'safranin' | 'hematoxylin';

export interface LessonSection {
  /** Anchor: /celula#membrana. Unique within the lesson. */
  id: string;
  /** What the student will understand, phrased as a question or claim, never a bare label. */
  title: string;
  /** Short paragraphs, 60–130 words in total. */
  body: string[];
  /** One line in the margin: a tip or an example. */
  margin?: string;
  /** A "Gândește-te" card: answered in your head, then revealed. */
  predict?: { question: string; answer: string };
  /** Belongs to the specialty curriculum (shown as "Avansat · CS"). */
  cs?: true;
}

export interface QuizQuestion {
  prompt: string;
  options: string[];
  /** Index of the correct option. */
  answer: number;
  /** One sentence shown after answering. */
  explanation: string;
  /** Section that explains it (for the link back). */
  section: string;
}

export interface Lesson {
  slug: string;
  /** Catalog number, 1–5 ("Preparat 01"). */
  number: number;
  title: string;
  stain: Stain;
  /** One concrete question a student would wonder about. */
  hook: string;
  sections: LessonSection[];
  /** "Pe scurt": three points of at most 20 words. */
  keyPoints: [string, string, string];
  /** Where each game is launched from: right after the section that teaches what it needs. */
  games: { gameId: string; afterSection: string }[];
  /** One specific sentence tying the topic to daily life or health. */
  whyItMatters: string;
  /** "Verifică-te": three questions. */
  check: QuizQuestion[];
}
