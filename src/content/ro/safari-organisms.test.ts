// Roster rules and the fairness test: every organism can be solved from its own card.
import { describe, expect, it } from 'vitest';
import { CLUES, GROUPS, MODE_GROUPS, ORGANISMS, SLIDES, TYPE_NAMES, organismsFor } from './safari-organisms';
import { LESSONS } from './lessons/index.ts';
import { ASSETS } from '../../assets/manifest';

const sectionExists = (ref: string) => {
  const [slug, id] = ref.split('#');
  return LESSONS.find((l) => l.slug === slug)?.sections.some((s) => s.id === id) ?? false;
};
const CEDILLA = new RegExp(`[${String.fromCharCode(0x15f, 0x163, 0x15e, 0x162)}]`);

describe('safari roster', () => {
  it('ids are unique; every organism has a valid group, slide, 2–3 known clues, a sentence and a section', () => {
    expect(new Set(ORGANISMS.map((o) => o.id)).size).toBe(ORGANISMS.length);
    for (const o of ORGANISMS) {
      expect(GROUPS[o.group], o.id).toBeTruthy();
      expect(SLIDES.some((s) => s.id === o.slide), o.id).toBe(true);
      expect(o.clues.length, o.id).toBeGreaterThanOrEqual(2);
      expect(o.clues.length, o.id).toBeLessThanOrEqual(3);
      for (const c of o.clues) expect(CLUES[c], `${o.id}: clue ${c}`).toBeTruthy();
      expect(o.explanation.trim().endsWith('.'), o.id).toBe(true);
      expect(o.explanation.slice(0, -1).includes('. '), `${o.id}: one sentence`).toBe(false);
      expect(sectionExists(o.lessonSection), `${o.id}: ${o.lessonSection}`).toBe(true);
      expect(o.binomial, o.id).toMatch(/^[A-Z][a-z]+ ([a-z]+|sp\.)$/);
      expect(ASSETS.some((a) => a.id === o.sprite), `${o.id}: sprite ${o.sprite}`).toBe(true);
      expect(JSON.stringify(o)).not.toMatch(CEDILLA);
    }
  });

  it('fairness: each organism has a diagnostic clue for its own group, and no clue pointing elsewhere', () => {
    for (const o of ORGANISMS) {
      expect(o.diagnostic.length, o.id).toBeGreaterThan(0);
      for (const d of o.diagnostic) {
        expect(o.clues, `${o.id}: diagnostic ${d} is not on its card`).toContain(d);
        expect(CLUES[d].points, `${o.id}: ${d}`).toBe(o.group);
      }
      for (const c of o.clues) {
        const p = CLUES[c].points;
        expect(p === null || p === o.group, `${o.id}: clue ${c} points to ${p}`).toBe(true);
      }
    }
  });

  it('fairness in the advanced second step: the type is decided by a clue on the card', () => {
    for (const o of ORGANISMS.filter((x) => GROUPS[x.group].types)) {
      expect(o.type, o.id).toBeTruthy();
      expect(GROUPS[o.group].types, o.id).toContain(o.type);
      expect(o.clues.some((c) => CLUES[c].type === o.type), `${o.id}: no clue decides ${o.type}`).toBe(true);
      expect(o.clues.some((c) => CLUES[c].type && CLUES[c].type !== o.type), `${o.id}: a clue points to another type`).toBe(false);
    }
    for (const g of Object.values(GROUPS)) for (const t of g.types ?? []) expect(TYPE_NAMES[t]).toBeTruthy();
  });

  it('every group shown in a mode has organisms in that mode (base: at least 2 each)', () => {
    for (const mode of ['baza', 'avansat'] as const) {
      for (const g of MODE_GROUPS[mode]) {
        const n = organismsFor(mode).filter((o) => o.group === g).length;
        expect(n, `${mode}: ${g}`).toBeGreaterThanOrEqual(mode === 'baza' ? 2 : 1);
      }
    }
  });

  it('every group links to an existing lesson section', () => {
    for (const g of Object.values(GROUPS)) expect(sectionExists(g.lessonSection), g.id).toBe(true);
  });
});
