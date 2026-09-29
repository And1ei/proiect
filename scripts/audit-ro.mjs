// Visits every route in a real Chromium and checks the Romanian conversion:
// leftover English UI strings, em dashes, cedillas, straight quotes, fonts/glyphs, hyphenation.
// Usage: node scripts/audit-ro.mjs [baseUrl]   (dev server must be running)
import { chromium } from 'playwright-core';
import os from 'node:os';
import path from 'node:path';

const BASE = process.argv[2] ?? 'http://localhost:3000';
const executablePath =
  process.env.CHROMIUM_PATH ?? path.join(os.homedir(), 'AppData/Local/Chromium/Application/chrome.exe');

const ROUTES = [
  '/', '/celula', '/ecosisteme', '/diversitatea-vietii', '/impactul-uman', '/laboratorul', '/jocuri',
  '/despre', '/credite', '/sistem-de-design', '/pagina-care-nu-exista', '/__eroare',
];

// Proper nouns and code identifiers that legitimately stay as they are
const ALLOW = [
  'Soft Educational', 'Undercase Type', 'Instrument Sans', 'Instrument', 'Colophon Foundry', 'DM Mono', 'Fraunces',
  'React Router', 'React', 'Tailwind CSS', 'Vite', 'Motion', 'SIL Open Font', 'MIT',
  'BlobButton', 'SpecimenCard', 'SpecimenLabel', 'HandUnderline', 'HandArrow', 'springSettle', 'spring',
  'SOFT', 'WONK', 'H&E', 'WCAG AA', 'WCAG', 'latin-ext', 'JavaScript', 'SVG', 'Tab', 'Lugol', 'ATP', 'ARN', 'ADN', 'NaCl',
];
// Common English UI words; none are Romanian words
const ENGLISH = new Set(
  ('the and of to is with for your you this that page click home menu close skip content not found loading error ' +
    'back next small medium disabled hover press target input button label reduced motion focus surface color colour ' +
    'type notes on off from by all every sample cell stain contents about credits sources system ' +
    'here more read open learn start submit search cancel yes no ok please try again reload something went wrong ' +
    'figure plate module inline send release simulate enabled breathing').split(' '),
);

const results = [];
const check = (name, pass, detail = '') => {
  results.push({ name, pass });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? `\n      ${detail}` : ''}`);
};

const browser = await chromium.launch({ executablePath, headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
const page = await ctx.newPage();
const googleRequests = [];
page.on('request', (r) => /fonts\.(googleapis|gstatic)\.com/.test(r.url()) && googleRequests.push(r.url()));

const englishHits = [];
const dashHits = [];
const quoteHits = [];
const cedillaHits = [];

for (const route of ROUTES) {
  await page.goto(BASE + route);
  await page.locator('h1').first().waitFor({ timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(400);
  const data = await page.evaluate(() => {
    const attrs = [];
    for (const el of document.querySelectorAll('[aria-label],[alt],[title],[placeholder]')) {
      for (const a of ['aria-label', 'alt', 'title', 'placeholder']) if (el.hasAttribute(a)) attrs.push(el.getAttribute(a));
    }
    // Only human-readable meta values; og:type/og:locale are protocol values
    const metas = [...document.querySelectorAll('meta[name=description], meta[property="og:title"], meta[property="og:description"], meta[property="og:site_name"]')].map((m) => m.content);
    return {
      lang: document.documentElement.lang,
      title: document.title,
      text: document.body.innerText,
      attrs,
      metas,
      noscript: (document.querySelector('noscript')?.textContent ?? '').replace(/<[^>]*>/g, ' '),
    };
  });

  const sources = [
    ['title', data.title],
    ['text', data.text],
    ...data.attrs.map((a) => ['attr', a]),
    ...data.metas.map((m) => ['meta', m]),
    ['noscript', data.noscript],
  ];
  for (const [kind, raw] of sources) {
    let s = raw.replace(/--[\w-]+/g, ' ').replace(/#[0-9A-F]{6}/gi, ' ');
    // Case-insensitive: labels are rendered uppercase by CSS
    for (const a of ALLOW) s = s.replace(new RegExp(a.replace(/[.*+?^${}()|[\]\\&]/g, '\\$&'), 'gi'), ' ');
    const words = s.toLowerCase().match(/[a-zăâîșț]+/g) ?? [];
    const found = [...new Set(words.filter((w) => ENGLISH.has(w)))];
    if (found.length) englishHits.push(`${route} ${kind}: ${found.join(', ')}  «${raw.slice(0, 90).replace(/\n/g, ' ')}»`);
    if (/—/.test(raw)) dashHits.push(`${route} ${kind}: ${raw.match(/.{0,30}—.{0,30}/)?.[0]}`);
    if (/[ŞşŢţ]/.test(raw)) cedillaHits.push(`${route} ${kind}`);
    if (/"/.test(raw) && kind !== 'meta') quoteHits.push(`${route} ${kind}: ${raw.match(/.{0,30}".{0,30}/)?.[0]}`);
  }
  check(`${route}: lang="ro"`, data.lang === 'ro', data.lang);
  console.log(`      title: ${data.title}`);
}

check('no English UI strings on any route (text, aria-label, alt, title, placeholder, meta)', englishHits.length === 0, englishHits.join('\n      '));
check('no em dashes in rendered text', dashHits.length === 0, dashHits.join('\n      '));
check('no cedilla diacritics in rendered text', cedillaHits.length === 0, cedillaHits.join('\n      '));
check('no straight double quotes used as quotation marks', quoteHits.length === 0, quoteHits.join('\n      '));

// 404 and error screens
await page.goto(`${BASE}/pagina-care-nu-exista`);
await page.waitForTimeout(400);
check('404 shows „Pagina nu a fost găsită”', (await page.locator('h1').innerText()) === 'Pagina nu a fost găsită');
await page.goto(`${BASE}/__eroare`);
await page.waitForTimeout(400);
check('error boundary shows Romanian recovery screen', (await page.locator('h1').innerText()) === 'Ceva nu a mers bine', await page.title());

// Skip link text
await page.goto(`${BASE}/`);
check('skip link reads „Sari la conținut”', (await page.locator('.skip-link').textContent()) === 'Sari la conținut');

// Fonts: glyph test row on the design-system page
await page.goto(`${BASE}/sistem-de-design#type`);
await page.waitForSelector('[data-glyph-case]', { timeout: 10000 });
await page.waitForFunction(() => document.querySelectorAll('[data-glyph-status="checking"]').length === 0, null, { timeout: 15000 });
const glyphs = await page.$$eval('[data-glyph-case]', (els) =>
  els.map((e) => ({ c: e.dataset.glyphCase, status: e.dataset.glyphStatus, subset: e.dataset.glyphSubset, text: e.lastElementChild.textContent })),
);
check('glyph test rows present', glyphs.length === 9, `${glyphs.length} rows`);
for (const g of glyphs) check(`glyphs native: ${g.c}`, g.status === 'native' && g.subset === 'true', g.text);

// DM Mono uppercase via text-transform must produce the same glyphs as real uppercase Ș Ț
const upper = await page.evaluate(() => {
  const mk = (text, transform) => {
    const s = document.createElement('span');
    s.className = 'text-label';
    s.style.cssText = `position:absolute;visibility:hidden;white-space:nowrap;text-transform:${transform}`;
    s.textContent = text;
    document.body.append(s);
    const w = s.getBoundingClientRect().width;
    s.remove();
    return w;
  };
  const lower = 'fișă, țesut, înșirat, grăunte';
  return { viaCss: mk(lower, 'uppercase'), real: mk(lower.toLocaleUpperCase('ro'), 'none'), expected: lower.toLocaleUpperCase('ro') };
});
check('DM Mono text-transform uppercase yields Ș/Ț (same width as real capitals)', Math.abs(upper.viaCss - upper.real) < 0.5, JSON.stringify(upper));

// Hyphenation: a long Romanian word in a narrow box wraps with hyphens only if the ro hyphenation data works
const hyph = await page.evaluate(() => {
  const mk = (h, lang = 'ro', text = 'caracteristicile electroencefalografiei') => {
    const p = document.createElement('p');
    p.lang = lang;
    p.style.cssText = `position:absolute;visibility:hidden;width:9ch;hyphens:${h};font-size:16px`;
    p.textContent = text;
    document.body.append(p);
    const height = p.getBoundingClientRect().height;
    p.remove();
    return height;
  };
  const en = 'characteristics electroencephalography';
  return { auto: mk('auto'), none: mk('none'), enAuto: mk('auto', 'en', en), enNone: mk('none', 'en', en) };
});
if (hyph.enAuto === hyph.enNone) {
  // Not even English hyphenates: this browser profile has no hyphenation data at all
  console.log(`SKIP  hyphens:auto (this Chromium has no hyphenation data; English control failed too) ${JSON.stringify(hyph)}`);
} else check('hyphens:auto hyphenates Romanian in this browser', hyph.auto !== hyph.none, JSON.stringify(hyph));

// Number and quote formatting from Intl ro-RO
const typeText = await page.locator('#type').innerText();
check('decimal comma and dot thousands via Intl ro-RO', /0,9\s?%/.test(typeText) && typeText.includes('5.000.000') && typeText.includes('7,5'));
check('Romanian quotation marks „ ”', /„[^”]+”/.test(typeText));

await browser.close();

// Fonts are self-hosted: nothing may be requested from Google Fonts
check('no requests to fonts.googleapis.com or fonts.gstatic.com', googleRequests.length === 0, googleRequests.slice(0, 3).join(' | '));

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exitCode = failed.length ? 1 : 0;
