import { describe, expect, it } from 'vitest';
import {
  OSMOSIS,
  adjustOutside,
  concentrationInside,
  equilibriumVolume,
  stepVolume,
  tonicity,
  volumeRate,
  volumeZone,
} from './osmosisModel';

const c = OSMOSIS;
const volumes = [0.6, 0.7, 0.84, 0.95, 1, 1.1, 1.18, 1.3, 1.42];
const outsides = [0.2, 0.35, 0.6, 0.9, 1, 1.1, 1.5, 2, 2.4];

describe('osmosisModel: direction', () => {
  it('water always moves toward the higher solute concentration', () => {
    for (const v of volumes) {
      for (const cOut of outsides) {
        const cIn = concentrationInside(c, v);
        const rate = volumeRate(c, v, cOut);
        if (cOut > cIn) expect(rate, `V=${v} C_out=${cOut}`).toBeLessThan(0); // hipertonic: water leaves
        else if (cOut < cIn) expect(rate, `V=${v} C_out=${cOut}`).toBeGreaterThan(0); // hipotonic: water enters
        else expect(rate).toBeCloseTo(0, 12);
      }
    }
  });

  it('a step never moves the volume the wrong way', () => {
    for (const v of volumes) {
      for (const cOut of outsides) {
        const next = stepVolume(c, v, cOut, 0.25);
        const cIn = concentrationInside(c, v);
        if (cOut > cIn) expect(next).toBeLessThanOrEqual(v);
        if (cOut < cIn) expect(next).toBeGreaterThanOrEqual(v);
      }
    }
  });

  it('distilled water swells the cell and concentrated salt shrinks it', () => {
    expect(stepVolume(c, 1, 0.3, 2)).toBeGreaterThan(1);
    expect(stepVolume(c, 1, 2, 2)).toBeLessThan(1);
    expect(tonicity(c, 1, 0.3)).toBe('hipotonica');
    expect(tonicity(c, 1, 2)).toBe('hipertonica');
    expect(tonicity(c, 1, 1)).toBe('izotonica');
  });
});

describe('osmosisModel: equilibrium', () => {
  it('there is no flow when C_in = C_out', () => {
    for (const v of [0.8, 1, 1.25]) expect(volumeRate(c, v, c.n / v)).toBeCloseTo(0, 12);
  });

  it('the volume settles where C_in = C_out, without overshooting', () => {
    for (const cOut of [0.8, 1, 1.15]) {
      const target = c.n / cOut;
      let v = cOut < 1 ? 0.9 : 1.1;
      const startSide = Math.sign(v - target);
      for (let i = 0; i < 2000; i += 1) {
        v = stepVolume(c, v, cOut, 0.1);
        expect(Math.sign(v - target) === startSide || v === target).toBe(true);
      }
      expect(v).toBeCloseTo(target, 3);
      expect(concentrationInside(c, v)).toBeCloseTo(cOut, 3);
    }
  });

  it('ser fiziologic (isotonic) keeps a resting cell stable', () => {
    expect(stepVolume(c, 1, 1, 30)).toBe(1);
    expect(equilibriumVolume(c, 1)).toBe(1);
  });
});

describe('osmosisModel: bounds', () => {
  it('never leaves the hard limits, whatever the input', () => {
    for (const cOut of [0.01, 0.2, 5, 100]) {
      for (const dt of [0.016, 1, 10, 1e6]) {
        const v = stepVolume(c, 1, cOut, dt);
        expect(v).toBeGreaterThanOrEqual(c.limits[0]);
        expect(v).toBeLessThanOrEqual(c.limits[1]);
      }
    }
  });

  it('ignores bad time steps', () => {
    expect(stepVolume(c, 1, 2, -1)).toBe(1);
    expect(stepVolume(c, 1, 2, Number.NaN)).toBe(1);
    expect(stepVolume(c, 1, 2, Infinity)).toBe(1);
  });

  it('clamps the outside concentration to the control range', () => {
    expect(adjustOutside(c, 2.3, 1)).toBe(c.cOutRange[1]);
    expect(adjustOutside(c, 0.3, -1)).toBe(c.cOutRange[0]);
  });

  it('reports the zone against the safe band', () => {
    expect(volumeZone(c, 1)).toBe('sigur');
    expect(volumeZone(c, c.safe[0] - 0.01)).toBe('crenare');
    expect(volumeZone(c, c.safe[1] + 0.01)).toBe('liza');
  });

  it('the resting cell starts inside the safe band', () => {
    expect(c.safe[0]).toBeLessThan(1);
    expect(c.safe[1]).toBeGreaterThan(1);
    expect(c.limits[0]).toBeLessThan(c.safe[0]);
    expect(c.limits[1]).toBeGreaterThan(c.safe[1]);
  });
});
