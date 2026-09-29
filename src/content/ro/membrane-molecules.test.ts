// Data-driven checks on the biology of "Poarta membranei". If one fails, the table in
// membrane-molecules.ts has a fact that contradicts the rules below: fix the data, not the test.
import { describe, expect, it } from 'vitest';
import { MODE_ROUTES, MOLECULES, ROUTES, moleculesFor, withGradient, type MembraneMode } from './membrane-molecules';

const MODES: MembraneMode[] = ['baza', 'avansat'];
const SUBSCRIPTS = /[₀-₉⁺⁻]/;
// s and t with cedilla (the wrong Romanian letters), built from code points so check:ro stays quiet
const CEDILLAS = new RegExp(`[${String.fromCharCode(0x15f, 0x163, 0x15e, 0x162)}]`);

describe('membrane molecules', () => {
  it('ids are unique and lowercase-hyphenated', () => {
    const ids = MOLECULES.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z-]+$/);
  });

  it('every situation belongs to at least one mode', () => {
    for (const m of MOLECULES) expect(Object.keys(m.modes).length, m.id).toBeGreaterThan(0);
  });

  for (const mode of MODES) {
    describe(`mode ${mode}`, () => {
      it('every situation has a route offered in this mode and a one-sentence explanation', () => {
        for (const m of moleculesFor(mode)) {
          const rule = m.modes[mode]!;
          expect(ROUTES).toContain(rule.route);
          expect(MODE_ROUTES[mode], `${m.id}: route ${rule.route} is not a gate in ${mode}`).toContain(rule.route);
          const text = rule.explanation.trim();
          expect(text.length, m.id).toBeGreaterThan(40);
          expect(text.endsWith('.'), `${m.id}: explanation should end with a full stop`).toBe(true);
          // One sentence: no full stop before the end (abbreviations aren't used in these texts)
          expect(text.slice(0, -1).includes('. '), `${m.id}: explanation should be one sentence`).toBe(false);
          expect(text, `${m.id}: use ș ț with comma below`).not.toMatch(CEDILLAS);
        }
      });

      it('uses every gate at least once', () => {
        const used = new Set(moleculesFor(mode).map((m) => m.modes[mode]!.route));
        for (const route of MODE_ROUTES[mode]) expect(used.has(route), `${mode}: no molecule uses ${route}`).toBe(true);
      });
    });
  }

  it('base mode: every molecule moves down its gradient (the player only decides if it crosses freely)', () => {
    for (const m of moleculesFor('baza')) expect(withGradient(m), m.id).toBe(true);
  });

  it('base mode uses exactly O₂, CO₂, glucoză, Na⁺ (intră) and proteină', () => {
    expect(moleculesFor('baza').map((m) => m.id).sort()).toEqual(['dioxid-de-carbon', 'glucoza', 'oxigen', 'proteina', 'sodiu-intra']);
  });

  it('advanced mode uses every row of the table', () => {
    expect(moleculesFor('avansat').length).toBe(MOLECULES.length);
  });

  it('the rules of membrane transport hold for every route', () => {
    for (const m of MOLECULES) {
      for (const mode of MODES) {
        const rule = m.modes[mode];
        if (!rule) continue;
        const where = `${m.id} (${mode})`;
        switch (rule.route) {
          case 'dublu-strat': // difuzie simplă: small, nonpolar, uncharged, down the gradient
            expect(m.size, where).toBe('mica');
            expect(m.polarity, where).toBe('nepolara');
            expect(m.charge, where).toBe(0);
            expect(withGradient(m), where).toBe(true);
            break;
          case 'canal': // difuzie facilitată: polar or charged, down the gradient, no ATP
            expect(m.polarity === 'polara' || m.charge !== 0, where).toBe(true);
            expect(m.size, where).not.toBe('foarte-mare');
            expect(withGradient(m), where).toBe(true);
            expect(rule.explanation, where).not.toMatch(/cu consum de ATP/);
            break;
          case 'pompa': // transport activ: against the gradient, costs ATP
            expect(withGradient(m), where).toBe(false);
            expect(rule.explanation, where).toMatch(/ATP/);
            break;
          case 'blocat': // can't cross the bilayer alone
            expect(m.size === 'foarte-mare' || m.polarity === 'polara' || m.charge !== 0, where).toBe(true);
            break;
        }
      }
    }
  });

  it('never says glucose or ions are useless or never enter: the base explanation points to membrane proteins', () => {
    for (const m of moleculesFor('baza')) {
      const text = m.modes.baza!.explanation;
      expect(text).not.toMatch(/inutil|nu intră niciodată|nu are nevoie/);
      if (m.species === 'glucoza' || m.species === 'Na') expect(text, m.id).toMatch(/protein|canal/);
    }
  });

  it('large molecules mention vesicular transport as out of scope', () => {
    for (const m of MOLECULES.filter((x) => x.size === 'foarte-mare')) {
      for (const rule of Object.values(m.modes)) expect(rule!.explanation).toMatch(/vezicul/);
    }
  });

  it('formulas use real subscripts and superscripts', () => {
    for (const m of MOLECULES.filter((x) => x.species !== 'proteina')) {
      expect(m.formula, m.id).toMatch(SUBSCRIPTS);
      expect(m.formula, m.id).not.toMatch(/[0-9+]/);
    }
    for (const m of MOLECULES.filter((x) => x.charge !== 0)) expect(m.formula, m.id).toMatch(/⁺$/);
  });
});
