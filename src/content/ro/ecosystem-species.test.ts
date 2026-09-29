// Data rules for the species of "Echilibrul". If one fails, the data contradicts the food chain.
import { describe, expect, it } from 'vitest';
import { GUILD_LEVEL, SCENARIOS } from './ecosystem-species';
import { SCENARIO_CONFIG } from '../../games/echilibrul/scenarios';
import { ASSETS } from '../../assets/manifest';

const CEDILLAS = new RegExp(`[${String.fromCharCode(0x15f, 0x163, 0x15e, 0x162)}]`);

for (const scenario of Object.values(SCENARIOS)) {
  describe(scenario.name, () => {
    const byId = new Map(scenario.species.map((s) => [s.id, s]));
    const top = Math.max(...scenario.species.map((s) => GUILD_LEVEL[s.guild]));

    it('ids are unique and every relation points to a species of this scenario', () => {
      expect(byId.size).toBe(scenario.species.length);
      for (const s of scenario.species) for (const id of [...s.eats, ...s.eatenBy]) expect(byId.has(id), `${s.id} → ${id}`).toBe(true);
    });

    it('producers eat nothing', () => {
      for (const s of scenario.species.filter((x) => x.guild === 'producator')) expect(s.eats).toEqual([]);
    });

    it('every consumer eats at least one species of a lower level', () => {
      for (const s of scenario.species.filter((x) => x.guild !== 'producator')) {
        expect(s.eats.some((id) => GUILD_LEVEL[byId.get(id)!.guild] < GUILD_LEVEL[s.guild]), s.id).toBe(true);
      }
    });

    it('every species except the top ones is eaten by at least one', () => {
      for (const s of scenario.species.filter((x) => GUILD_LEVEL[x.guild] < top)) expect(s.eatenBy.length, s.id).toBeGreaterThan(0);
    });

    it('eats and eatenBy agree', () => {
      for (const s of scenario.species) {
        for (const id of s.eats) expect(byId.get(id)!.eatenBy, `${id} should list ${s.id}`).toContain(s.id);
        for (const id of s.eatenBy) expect(byId.get(id)!.eats, `${id} should eat ${s.id}`).toContain(s.id);
      }
    });

    it('Latin names are "Genus species"; groups have a description instead', () => {
      for (const s of scenario.species) {
        if (s.binomial === null) expect(s.group, s.id).toBeTruthy();
        else expect(s.binomial, s.id).toMatch(/^[A-Z][a-z]+ [a-z]+$/);
      }
    });

    it('role and fact are one sentence each, in Romanian with comma-below ș ț', () => {
      for (const s of scenario.species) {
        for (const text of [s.role, s.fact]) {
          expect(text.endsWith('.'), s.id).toBe(true);
          expect(text.slice(0, -1).includes('. '), `${s.id}: one sentence`).toBe(false);
          expect(text).not.toMatch(CEDILLAS);
        }
      }
    });

    it('every event has a headline and a one-sentence mechanism', () => {
      for (const e of scenario.events) {
        expect(e.headline.length).toBeGreaterThan(10);
        expect(e.mechanism.endsWith('.')).toBe(true);
        expect(e.mechanism.slice(0, -1).includes('. '), e.kind).toBe(false);
      }
    });

    it('the model has exactly these species, with links that match the food relations', () => {
      const cfg = SCENARIO_CONFIG[scenario.id];
      expect(cfg.model.species.map((s) => s.id).sort()).toEqual([...byId.keys()].sort());
      const links = cfg.model.links.map((l) => `${l.predator}>${l.prey}`).sort();
      const relations = scenario.species.flatMap((s) => s.eats.map((prey) => `${s.id}>${prey}`)).sort();
      expect(links).toEqual(relations);
      for (const e of cfg.events) expect(scenario.events.map((x) => x.kind), e.kind).toContain(e.kind);
    });

    it('every sprite is a manifest asset', () => {
      for (const s of scenario.species) expect(ASSETS.some((a) => a.id === s.sprite), s.sprite).toBe(true);
    });
  });
}
