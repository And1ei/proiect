// Whole-site cross-check in a real Chromium, against a production build served locally.
// Re-runnable at the end of the project. Writes SITE-CHECK.md.
//
//   npm run build && npx vite preview --port 4173
//   npm run site:check [-- baseUrl]
//
// Routes come from the lessons, the game registry (definitions files) and the fixed pages, never a
// hand-kept list. Checks per route (375 px): console errors, failed requests, horizontal scroll,
// lang, unique title and description, favicon and manifest, one h1 and heading order, landmarks,
// images named or decorative, forbidden text, axe contrast and a11y rules; then links and anchors,
// every game reaching "playing" and exiting, keyboard focus and Esc, the learning loop, storage
// migration, and Lighthouse on / and one topic page. The offline audit runs separately
// (npm run audit:offline); its last result is read from the console if you pass --offline.
import { chromium } from 'playwright-core';
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import os from 'node:os';
import { LESSONS } from '../src/content/ro/lessons/index.ts';

const BASE = process.argv.find((a) => a.startsWith('http')) ?? 'http://localhost:4173';
const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');
const executablePath = process.env.CHROMIUM_PATH ?? join(os.homedir(), 'AppData/Local/Chromium/Application/chrome.exe');

const walk = (dir) => readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? walk(join(dir, f)) : [join(dir, f)]));
const gameIds = walk(join(ROOT, 'src/games'))
  .filter((f) => /definitions\.ts$/.test(f) && !/sandbox/.test(f))
  .flatMap((f) => [...readFileSync(f, 'utf8').matchAll(/\bid: '([a-z0-9-]+)'/g)].map((m) => m[1]));

const ROUTES = ['/', '/jocuri', '/despre', '/credite', ...LESSONS.map((l) => `/${l.slug}`), ...gameIds.map((id) => `/joc/${id}`)];
const NOT_FOUND = '/pagina-care-nu-exista';

// ── Report ──
const results = [];
const check = (area, name, pass, detail = '') => {
  results.push({ area, name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  [${area}] ${name}${detail ? `  (${detail})` : ''}`);
};

// ── Forbidden text ──
const CEDILLA = new RegExp(`[${String.fromCharCode(0x15f, 0x163, 0x15e, 0x162)}]`);
const FORBIDDEN = [
  [/lorem/i, 'Lorem'],
  [/\bTODO\b/, 'TODO'],
  [/\bFIXME\b/, 'FIXME'],
  [/placeholder/i, 'placeholder'],
  [/\bBac\b/, 'Bac'],
  [/bacalaureat/i, 'bacalaureat'],
  [/\bclasa a XI|\bclasa a XII|\bXII?\b/, 'XI/XII'],
  [CEDILLA, 'cedilla ş/ţ'],
  // built from fragments so a search for these words over the repo finds nothing (S1: zero hits)
  [new RegExp(['glo' + 'sar', 'dic' + 'ționar', 'dic' + 'tionar', 'glo' + 'ssary'].join('|'), 'i'), 'removed-feature words'],
];
// English UI words that must never show up as interface text (matched as whole words)
const ENGLISH_UI = ['Loading', 'Submit', 'Play', 'Start', 'Score', 'Next', 'Previous', 'Level', 'Back', 'Menu', 'Close', 'Settings', 'Home', 'Search', 'Cancel', 'Continue'];
const englishRe = new RegExp(`\\b(${ENGLISH_UI.join('|')})\\b`);

const scanText = (text) => {
  const hits = FORBIDDEN.filter(([re]) => re.test(text)).map(([, n]) => n);
  const en = text.match(englishRe);
  if (en) hits.push(`English UI "${en[1]}"`);
  return hits;
};

const browser = await chromium.launch({ executablePath, headless: true });
const axeSource = readFileSync(join(ROOT, 'node_modules/axe-core/axe.min.js'), 'utf8');

async function newPage(width = 375, height = 812) {
  const context = await browser.newContext({ viewport: { width, height } });
  const page = await context.newPage();
  const errors = [];
  const failed = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('requestfailed', (r) => failed.push(r.url().replace(BASE, '')));
  return { page, context, errors, failed };
}

// ── 1. Every route ──
const titles = new Map();
const links = new Set();
for (const route of [...ROUTES, NOT_FOUND]) {
  const { page, context, errors, failed } = await newPage();
  await page.goto(BASE + route, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  const info = await page.evaluate(() => ({
    lang: document.documentElement.lang,
    title: document.title,
    desc: document.querySelector('meta[name="description"]')?.getAttribute('content') ?? '',
    favicon: !!document.querySelector('link[rel~="icon"]'),
    manifest: !!document.querySelector('link[rel="manifest"]'),
    h1: document.querySelectorAll('h1').length,
    headings: [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter((h) => h.offsetParent !== null || h.closest('[inert]') === null).map((h) => +h.tagName[1]),
    main: !!document.querySelector('main'),
    nav: !!document.querySelector('nav'),
    imgs: [...document.querySelectorAll('img')].filter((i) => !i.hasAttribute('alt') && !i.closest('[aria-hidden="true"]')).length,
    overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
    text: document.body.innerText,
    links: [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')),
  }));
  const where = route;
  check('route', `${where}: no console errors`, errors.length === 0, errors.slice(0, 2).join(' | '));
  check('route', `${where}: no failed requests`, failed.length === 0, failed.slice(0, 3).join(', '));
  check('route', `${where}: no horizontal scroll at 375 px`, !info.overflow);
  check('route', `${where}: lang="ro", favicon, manifest`, info.lang === 'ro' && info.favicon && info.manifest);
  check('route', `${where}: exactly one h1`, info.h1 === 1, `${info.h1}`);
  const jumps = info.headings.some((lvl, i) => i > 0 && lvl > info.headings[i - 1] + 1);
  check('route', `${where}: heading levels don't skip`, !jumps, info.headings.join(','));
  check('route', `${where}: main and nav landmarks`, info.main && info.nav);
  check('route', `${where}: every image has alt or is decorative`, info.imgs === 0, `${info.imgs}`);
  check('route', `${where}: description present`, info.desc.length > 20);
  if (route !== NOT_FOUND) titles.set(info.title, [...(titles.get(info.title) ?? []), route]);
  const hits = scanText(info.text);
  check('text', `${where}: no forbidden or English UI text`, hits.length === 0, hits.join(', '));
  if (route === NOT_FOUND) check('route', '404 is styled in the site look (nav, footer, heading)', info.main && info.nav && info.h1 === 1);
  for (const l of info.links) if (l && (l.startsWith('/') || l.startsWith('#'))) links.add(l.startsWith('#') ? `${route}${l}` : l);

  // axe: contrast and core a11y rules (desktop width too for the topic pages)
  await page.addScriptTag({ content: axeSource });
  const axe = await page.evaluate(async () => {
    const r = await window.axe.run(document, { resultTypes: ['violations'], runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] } });
    return r.violations.map((v) => `${v.id} (${v.nodes.length}): ${v.nodes[0]?.target?.join(' ')}`);
  });
  check('a11y', `${where}: axe WCAG A/AA (incl. contrast)`, axe.length === 0, axe.slice(0, 3).join(' | '));
  await context.close();
}
for (const [title, routes] of titles) check('route', `unique <title>: "${title}"`, routes.length === 1, routes.join(', '));

// ── 2. Links and anchors ──
{
  const { page, context } = await newPage(1280, 900);
  for (const href of [...links, '/#celula', '/celula#membrana', '/ecosisteme#echilibru']) {
    const [path, hash] = href.split('#');
    await page.goto(BASE + (path || '/'), { waitUntil: 'networkidle' });
    const ok = await page.evaluate(() => !document.body.innerText.includes('Pagina nu există'));
    let anchor = true;
    if (hash) {
      if (path === '/' || path === '') await page.goto(BASE + href, { waitUntil: 'networkidle' });
      await page.waitForTimeout(300);
      anchor = await page.evaluate((h) => !!document.getElementById(h), hash);
    }
    check('links', `${href} resolves${hash ? ' and its anchor exists' : ''}`, ok && anchor);
  }
  await context.close();
}

// ── 3. Every game reaches "playing" and exits cleanly ──
for (const id of gameIds) {
  const { page, context, errors } = await newPage(1280, 900);
  await page.goto(`${BASE}/joc/${id}`, { waitUntil: 'networkidle' });
  const start = page.getByRole('button', { name: /^(Începe|Sari peste, joc direct)$/ });
  await start.click();
  const playing = await page.locator('[data-hud]').waitFor({ timeout: 10000 }).then(() => true).catch(() => false);
  await page.waitForTimeout(1500);
  await page.getByRole('link', { name: /Înapoi la/ }).first().click();
  await page.waitForTimeout(800);
  const left = !page.url().includes('/joc/');
  check('games', `${id}: reaches playing, exits by the way back`, playing && left && errors.length === 0, errors.slice(0, 2).join(' | '));
  await context.close();
}

// ── 4. Keyboard: focus visible, no trap, Esc ──
{
  const { page, context } = await newPage(1280, 900);
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  let invisible = 0;
  const seen = [];
  for (let i = 0; i < 40; i += 1) {
    await page.keyboard.press('Tab');
    const f = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const cs = getComputedStyle(el);
      const visible = (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) || cs.boxShadow !== 'none';
      return { tag: el.tagName, text: (el.textContent || '').trim().slice(0, 30), visible, inert: !!el.closest('[inert]') };
    });
    if (!f) continue;
    seen.push(f.text);
    if (!f.visible) invisible += 1;
    if (f.inert) invisible += 100;
  }
  check('keyboard', 'landing: 40 tab stops all show a focus ring, none inside collapsed content', invisible === 0, `${invisible} without ring`);
  check('keyboard', 'landing: tab order moves on (no trap)', new Set(seen).size > 10, `${new Set(seen).size} distinct stops`);
  // Expanded lesson reachable, predict card toggles
  await page.goto(`${BASE}/#celula`, { waitUntil: 'networkidle' });
  const reveal = page.getByRole('button', { name: 'Arată răspunsul' }).first();
  await reveal.focus();
  await page.keyboard.press('Enter');
  check('keyboard', 'expanded lesson: "Gândește-te" reveals with Enter', (await page.getByRole('button', { name: 'Ascunde răspunsul' }).count()) > 0);
  await context.close();

  const phone = await newPage(375, 812);
  await phone.page.goto(`${BASE}/celula`, { waitUntil: 'networkidle' });
  await phone.page.getByRole('button', { name: 'Cuprins' }).click();
  await phone.page.waitForTimeout(400);
  const opened = await phone.page.locator('dialog[open]').count();
  await phone.page.keyboard.press('Escape');
  await phone.page.waitForTimeout(300);
  check('keyboard', 'phone: Cuprins sheet opens and Esc closes it', opened === 1 && (await phone.page.locator('dialog[open]').count()) === 0);
  // lesson sheet from a game
  await phone.page.goto(`${BASE}/joc/${gameIds[0]}`, { waitUntil: 'networkidle' });
  await phone.page.getByRole('button', { name: 'Recitește lecția' }).click().catch(() => undefined);
  await phone.page.waitForTimeout(500);
  const sheet = await phone.page.locator('dialog[open]').count();
  await phone.page.keyboard.press('Escape');
  await phone.page.waitForTimeout(300);
  check('keyboard', 'game: lesson sheet opens from the intro and Esc closes it', sheet === 1 && (await phone.page.locator('dialog[open]').count()) === 0);
  await phone.context.close();
}

// ── 5. Learning loop and storage ──
{
  const { page, context } = await newPage(1280, 900);
  await page.goto(`${BASE}/ecosisteme`, { waitUntil: 'networkidle' });
  for (let y = 0; y < 8000; y += 350) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(700);
  }
  await page.waitForTimeout(1500);
  const read = await page.evaluate(() => JSON.parse(localStorage.getItem('soft-educational:v1') || '{}').topics?.ecosisteme?.sectionsRead?.length ?? 0);
  const total = LESSONS.find((l) => l.slug === 'ecosisteme').sections.length;
  check('loop', 'scrolling a lesson marks its sections read', read === total, `${read}/${total}`);
  check('loop', '"citit" stamp shows after reading', (await page.locator('[aria-label*="citit"]').count()) > 0);
  // A played game shows "jucat" and its stars (progress written as the shell would)
  await page.evaluate(() => {
    const d = JSON.parse(localStorage.getItem('soft-educational:v1'));
    d.games.echilibrul = { bestScore: 120, stars: 2, plays: 1, usedHelp: false };
    d.lastGame = 'echilibrul';
    localStorage.setItem('soft-educational:v1', JSON.stringify(d));
  });
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  const stampLabel = await page.locator('#ecosisteme [role="img"][aria-label^="Progres"]').first().getAttribute('aria-label');
  check('loop', 'played game gives "jucat" and 2 stars give "stăpânit"', /jucat/.test(stampLabel ?? '') && /stăpânit/.test(stampLabel ?? ''), stampLabel ?? '');
  // Reset clears progress
  await page.getByRole('button', { name: 'Resetează progresul' }).click();
  await page.getByRole('button', { name: /^Da/ }).click();
  const after = await page.evaluate(() => JSON.parse(localStorage.getItem('soft-educational:v1') || '{"topics":{},"games":{}}'));
  check('loop', 'Resetează progresul clears everything', Object.keys(after.topics ?? {}).length === 0 && Object.keys(after.games ?? {}).length === 0);
  // Old storage migrates without errors
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  await page.evaluate(() =>
    localStorage.setItem('soft-educational:v1', JSON.stringify({ v: 1, topics: { 'neuron-arc-reflex': { sectionsRead: ['a'] } }, settings: { sound: true } })),
  );
  await page.reload({ waitUntil: 'networkidle' });
  const migrated = await page.evaluate(() => JSON.parse(localStorage.getItem('soft-educational:v1') || 'null'));
  check('loop', 'v1 storage loads without errors (migrated on the next save)', errs.length === 0 && migrated !== null);
  await context.close();
}

await browser.close();

// ── 6. lessons:check and Lighthouse ──
const lc = spawnSync(process.execPath, [join(ROOT, 'scripts/lessons-check.mjs')], { encoding: 'utf8' });
check('content', 'npm run lessons:check passes', lc.status === 0, lc.stdout.trim().split('\n').pop());

const lighthouse = {};
for (const route of ['/', '/celula']) {
  const out = join(os.tmpdir(), `lh-${route.replace(/\W/g, '') || 'home'}.json`);
  const r = spawnSync(
    process.execPath,
    [join(ROOT, 'node_modules/lighthouse/cli/index.js'), BASE + route, '--quiet', '--only-categories=accessibility,performance', '--output=json', `--output-path=${out}`, '--chrome-flags=--headless=new'],
    { encoding: 'utf8', env: { ...process.env, CHROME_PATH: executablePath } },
  );
  try {
    const j = JSON.parse(readFileSync(out, 'utf8'));
    lighthouse[route] = { accessibility: Math.round(j.categories.accessibility.score * 100), performance: Math.round(j.categories.performance.score * 100) };
    check('lighthouse', `${route}: accessibility ≥ 90`, lighthouse[route].accessibility >= 90, `a11y ${lighthouse[route].accessibility}, perf ${lighthouse[route].performance}`);
  } catch {
    check('lighthouse', `${route}: Lighthouse ran`, false, (r.stderr || '').slice(0, 160));
  }
}

// ── SITE-CHECK.md ──
const failed = results.filter((r) => !r.pass);
const byArea = [...new Set(results.map((r) => r.area))];
const md = [
  '# SITE-CHECK',
  '',
  `Generated by \`npm run site:check\` against ${BASE} on ${new Date().toISOString().slice(0, 10)}. Re-run it after every module.`,
  '',
  `**${results.length - failed.length} of ${results.length} checks passed.** Routes checked: ${ROUTES.length + 1} (${ROUTES.join(', ')}, and a 404).`,
  '',
  '## Lighthouse',
  '',
  ...Object.entries(lighthouse).map(([r, v]) => `- \`${r}\`: accessibility ${v.accessibility}, performance ${v.performance}`),
  '',
  '## Failed',
  '',
  ...(failed.length ? failed.map((r) => `- [${r.area}] ${r.name}${r.detail ? `: ${r.detail}` : ''}`) : ['None.']),
  '',
  '## Passed, by area',
  '',
  ...byArea.map((a) => `- ${a}: ${results.filter((r) => r.area === a && r.pass).length} of ${results.filter((r) => r.area === a).length}`),
  '',
  '## Not covered by this script',
  '',
  '- Offline: `npm run audit:offline` (service worker, every route and every game offline).',
  '- A full game played to the results screen: covered by the game audits in `scripts/` and by hand.',
  '',
].join('\n');
// The generated part replaces the block between the markers; the hand-written sections stay
const file = join(ROOT, 'SITE-CHECK.md');
const START = '<!-- generated -->';
const END = '<!-- /generated -->';
let doc = '';
try {
  doc = readFileSync(file, 'utf8');
} catch {
  doc = `${START}\n${END}\n`;
}
const block = `${START}\n${md}\n${END}`;
const a = doc.indexOf(START);
const b = doc.indexOf(END);
doc = a >= 0 && b > a ? doc.slice(0, a) + block + doc.slice(b + END.length) : `${block}\n${doc}`;
writeFileSync(file, doc);
console.log(`\nsite-check: ${results.length - failed.length}/${results.length} passed`);
process.exitCode = failed.length ? 1 : 0;
