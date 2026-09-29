import { useEffect, useState } from 'react';
import { cx } from '../../lib/cx';
import { t } from '../../lib/i18n';

// Every family × weight × style combination the site actually uses
const CASES = [
  { family: 'Fraunces Variable', weight: 400, display: true },
  { family: 'Fraunces Variable', weight: 450, display: true },
  { family: 'Fraunces Variable', weight: 500 },
  { family: 'Fraunces Variable', weight: 400, italic: true, display: true },
  { family: 'Fraunces Variable', weight: 500, italic: true },
  { family: 'Instrument Sans', weight: 400 },
  { family: 'Instrument Sans', weight: 500 },
  { family: 'DM Mono', weight: 400 },
  { family: 'DM Mono', weight: 400, uppercase: true },
];

const LATIN_EXT_PROBES = [0x102, 0x218, 0x21a]; // Ă Ș Ț

const covers = (range, cp) =>
  range.split(',').some((part) => {
    const [a, b] = part.trim().replace(/^U\+/i, '').split('-');
    const lo = parseInt(a.replace(/\?/g, '0'), 16);
    const hi = b ? parseInt(b, 16) : parseInt(a.replace(/\?/g, 'F'), 16);
    return cp >= lo && cp <= hi;
  });

/**
 * Glyph is native if its width is identical with two very different fallbacks behind it;
 * any fallback use shows up as a width difference.
 */
async function testCase(c, text) {
  const spec = `${c.italic ? 'italic ' : ''}${c.weight} 48px "${c.family}"`;
  await document.fonts.load(spec, text);
  const ctx = document.createElement('canvas').getContext('2d');
  const glyphs = [...text.replace(/[\s,]/g, '')];
  const fallback = glyphs.filter((g) => {
    ctx.font = `${spec}, monospace`;
    const a = ctx.measureText(g).width;
    ctx.font = `${spec}, serif`;
    const b = ctx.measureText(g).width;
    return Math.abs(a - b) > 0.01;
  });
  const faces = [...document.fonts].filter((f) => f.family.replace(/["']/g, '') === c.family && f.status === 'loaded');
  const subset = LATIN_EXT_PROBES.every((cp) => faces.some((f) => covers(f.unicodeRange, cp)));
  return { ok: fallback.length === 0, fallback, subset };
}

export default function GlyphTest() {
  const sample = t('ds.type.glyphs.sample');
  const upper = t('ds.type.glyphs.upperSample');
  const [results, setResults] = useState({});

  useEffect(() => {
    let alive = true;
    Promise.all(
      CASES.map((c) => testCase(c, c.uppercase ? upper.toLocaleUpperCase('ro') : sample)),
    ).then((r) => alive && setResults(Object.fromEntries(r.map((res, i) => [i, res]))));
    return () => {
      alive = false;
    };
  }, [sample, upper]);

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-1">{t('ds.type.glyphs.heading')}</h3>
      <p className="prose-body text--1">{t('ds.type.glyphs.intro')}</p>
      <ul className="mt-2 flex flex-col">
        {CASES.map((c, i) => {
          const r = results[i];
          const status = !r ? 'checking' : r.ok ? 'native' : 'fallback';
          return (
            <li
              key={i}
              data-glyph-case={`${c.family}|${c.weight}|${c.italic ? 'italic' : 'normal'}|${c.uppercase ? 'upper' : 'lower'}`}
              data-glyph-status={status}
              data-glyph-subset={r ? String(r.subset) : undefined}
              className="grid gap-x-6 gap-y-1 border-b border-dashed border-ink-faint py-3 sm:grid-cols-[13rem_1fr_auto] sm:items-baseline"
            >
              <span className="text-label text-ink-soft">
                {c.family} · {t('ds.type.glyphs.weight', { w: c.weight })}
                {c.italic && ` · ${t('ds.type.glyphs.italic')}`}
                {c.uppercase && ` · ${t('ds.type.glyphs.uppercase')}`}
              </span>
              <span
                className={cx('text-3 leading-heading', c.uppercase && 'text-label !text-2')}
                style={{
                  fontFamily: `"${c.family}"`,
                  fontWeight: c.weight,
                  fontStyle: c.italic ? 'italic' : 'normal',
                  fontVariationSettings: c.display ? 'var(--fraunces-display)' : undefined,
                }}
              >
                {c.uppercase ? upper : sample}
              </span>
              <span
                className={cx(
                  'text-label',
                  status === 'native' && 'text-methylene-deep',
                  status === 'fallback' && 'text-eosin-deep',
                  status === 'checking' && 'text-ink-soft',
                )}
              >
                {t(`ds.type.glyphs.${status}`)}
                {r && ` · ${t(r.subset ? 'ds.type.glyphs.subsetOk' : 'ds.type.glyphs.subsetMissing')}`}
                {r && r.fallback.length > 0 && ` (${r.fallback.join(' ')})`}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
