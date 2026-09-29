// Real-browser checks for the content system: lessons, glossary popovers, quiz by keyboard,
// saved progress (including blocked storage), glossary filter, mobile menu, desktop margins.
// Usage: node scripts/audit-content.mjs [baseUrl]   (dev or preview server running)
import { chromium } from 'playwright-core';
import os from 'node:os';
import path from 'node:path';

const BASE = process.argv[2] ?? 'http://localhost:3000';
const executablePath =
  process.env.CHROMIUM_PATH ?? path.join(os.homedir(), 'AppData/Local/Chromium/Application/chrome.exe');
const TOPICS = [
  ['neuron-arc-reflex', 'Neuronul și arcul reflex'],
  ['inima-circulatia', 'Inima și circulația sângelui'],
  ['ventilatia-pulmonara', 'Ventilația pulmonară'],
  ['adn-proteine', 'De la ADN la proteină'],
  ['mendel', 'Legile lui Mendel'],
];

const results = [];
const check = (name, pass, detail = '') => {
  results.push(pass);
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`);
};

// Wait up to 5 s for a locator to exist; returns true/false instead of throwing
const appears = (locator) => locator.first().waitFor({ timeout: 5000 }).then(() => true, () => false);

const browser = await chromium.launch({ executablePath, headless: true });
const newPage = async (opts = {}) => {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce', ...opts });
  const page = await ctx.newPage();
  page.errors = [];
  page.on('pageerror', (e) => page.errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && page.errors.push(m.text()));
  return page;
};

// Mendel answers: grila 1, grila 2, af(false → fix 0), af(true), completare 0
async function answerMendelByKeyboard(page) {
  // Lettered options read "b) heterozigot", so match the end of the accessible name
  const pick = async (label) => {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    await page.getByRole('radio', { name: new RegExp(`(^|\\)\\s*)${escaped}$`) }).focus();
    await page.keyboard.press('Space');
  };
  const press = async (name) => {
    await page.getByRole('button', { name }).focus();
    await page.keyboard.press('Enter');
  };
  await pick('heterozigot'); await press('Verifică'); await press('Întrebarea următoare');
  await pick('9 : 3 : 3 : 1'); await press('Verifică'); await press('Întrebarea următoare');
  await pick('Fals');
  const fixes = await page.getByText('Alege varianta corectă a afirmației').count();
  await pick('În generația F2 a unei monohibridări cu dominanță completă, raportul fenotipic este 3 : 1.');
  await press('Verifică'); await press('Întrebarea următoare');
  await pick('Adevărat'); await press('Verifică'); await press('Întrebarea următoare');
  await pick('9'); await press('Verifică'); await press('Vezi rezultatul');
  return fixes;
}

// ── Lessons render ──
{
  const page = await newPage();
  for (const [slug, title] of TOPICS) {
    await page.goto(`${BASE}/${slug}`);
    await page.waitForSelector('h1');
    const info = await page.evaluate(() => ({
      h1: document.querySelector('h1').textContent,
      sections: document.querySelectorAll('[data-section-end]').length,
      interactive: document.querySelectorAll('[data-interactive]').length,
      headings: [...document.querySelectorAll('main h1, main h2, main h3')].map((h) => Number(h.tagName[1])),
      title: document.title,
    }));
    const skips = info.headings.some((lvl, i) => i > 0 && lvl - info.headings[i - 1] > 1);
    check(`${slug}: renders`, info.h1 === title && info.sections >= 4 && info.interactive === 1 && !skips, `${info.sections} sections, title "${info.title}"`);
  }
  await page.goto(`${BASE}/neuron-arc-reflex`);
  await page.waitForSelector('[data-figure="neuron"] svg[role="img"]');
  const parts = await page.$$eval('[data-figure="neuron"] [data-part]', (els) => [...new Set(els.map((e) => e.dataset.part))]);
  check('neuron figure: loaded with data-part ids', parts.length >= 9, parts.join(', '));
  check('no console errors on lesson pages', page.errors.length === 0, page.errors.slice(0, 2).join(' | '));
  await page.context().close();
}

// ── Glossary term popover by keyboard ──
{
  const page = await newPage();
  await page.goto(`${BASE}/neuron-arc-reflex`);
  const term = page.locator('[role="button"][aria-expanded]').first();
  await term.focus();
  await page.keyboard.press('Enter');
  const open = await term.evaluate((el) => {
    const id = el.getAttribute('aria-describedby');
    return { expanded: el.getAttribute('aria-expanded'), text: id && document.getElementById(id)?.textContent };
  });
  check('term: Enter opens popover wired with aria-describedby', open.expanded === 'true' && /Celula nervoasă/.test(open.text ?? ''), open.text?.slice(0, 50));
  await page.keyboard.press('Escape');
  const closed = await term.evaluate((el) => ({ expanded: el.getAttribute('aria-expanded'), focused: document.activeElement === el }));
  check('term: Escape closes and keeps focus on the term', closed.expanded === 'false' && closed.focused);
  await page.context().close();
}

// ── Quiz by keyboard + progress persists after reload + reset ──
{
  const page = await newPage();
  await page.goto(`${BASE}/mendel`);
  await page.waitForSelector('[data-section-end]');
  // Read every section: bring each end marker into view
  for (const id of await page.$$eval('[data-section-end]', (els) => els.map((e) => e.dataset.sectionEnd))) {
    await page.locator(`[data-section-end="${id}"]`).scrollIntoViewIfNeeded();
    await page.waitForTimeout(120);
  }
  const fixesShown = await answerMendelByKeyboard(page);
  check('quiz: choosing „Fals” reveals the correction options', fixesShown === 1);
  const score = await page.getByText(/Ai răspuns corect la/).textContent();
  check('quiz: finished with keyboard only, full score', /5 întrebări din 5/.test(score), score);

  await page.reload();
  await page.waitForSelector('h1');
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('soft-educational:v1')));
  const t = stored?.topics?.mendel;
  check('progress: saved under soft-educational:v1 with the agreed shape', stored?.v === 1 && t?.completed === true && t?.quizBest?.score === 5 && t.sectionsRead.length === 5, JSON.stringify(t));
  check('progress: „Completat” stamp shown after reload', (await page.locator('header').getByText('Completat').count()) > 0);

  await page.goto(`${BASE}/`);
  check('contents: shows 1 of 5 completed', await appears(page.getByText('1 din 5 lecții completate')));
  await page.getByRole('button', { name: 'Șterge progresul' }).click();
  await page.getByRole('button', { name: 'Da, șterge' }).click();
  const after = await page.evaluate(() => localStorage.getItem('soft-educational:v1'));
  check('progress: „Șterge progresul” with confirm clears storage', after === null && (await appears(page.getByText('0 din 5 lecții completate'))));
  check('no console errors in quiz/progress flow', page.errors.length === 0, page.errors.slice(0, 2).join(' | '));
  await page.context().close();
}

// ── Blocked storage ──
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
  await ctx.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('blocked', 'SecurityError'); } });
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(`${BASE}/`);
  check('blocked storage: contents page explains progress is not kept', await appears(page.getByText(/nu permite salvarea datelor locale/)));
  await page.goto(`${BASE}/mendel`);
  await answerMendelByKeyboard(page);
  check('blocked storage: quiz still works, no crash', (await appears(page.getByText(/Ai răspuns corect la/))) && errors.length === 0, errors[0]);
  await ctx.close();
}

// ── Glossary filter ignores diacritics ──
{
  const page = await newPage();
  await page.goto(`${BASE}/dictionar`);
  const search = page.getByLabel('Caută un termen');
  await search.fill('sinapsa');
  await page.waitForTimeout(150);
  const first = await page.locator('dt').first().textContent();
  check('glossary: „sinapsa” finds „sinapsă”', first === 'sinapsă', first);
  await search.fill('TRANSCRIPTIE');
  await page.waitForTimeout(150);
  check('glossary: case and diacritics ignored', (await page.locator('dt').first().textContent()) === 'transcripție');
  await search.fill('zzz');
  await page.waitForTimeout(150);
  check('glossary: empty state', (await page.getByText('Niciun termen nu se potrivește cu „zzz”.').count()) === 1);
  await search.fill('');
  await appears(page.locator('#sinapsa a'));
  const links = await page.locator('#sinapsa a').allTextContents();
  check('glossary: terms link to the lessons that use them', links.includes('Neuronul și arcul reflex'), links.join(', '));
  await page.context().close();
}

// ── Mobile full-screen menu ──
{
  const page = await newPage({ viewport: { width: 375, height: 812 }, hasTouch: true, isMobile: true });
  await page.goto(`${BASE}/`);
  await appears(page.getByRole('heading', { name: 'Cuprins' }));
  await page.getByRole('button', { name: 'Meniu' }).click();
  const dialog = page.getByRole('dialog', { name: 'Meniu' });
  const box = await dialog.boundingBox();
  const focusedClose = await page.evaluate(() => document.activeElement?.textContent?.includes('Închide'));
  check('mobile menu: full-screen dialog, focus on close', box.width >= 375 && box.height >= 812 && focusedClose, `${box.width}×${box.height}`);
  check('mobile menu: lists all 5 lessons by unit', (await dialog.getByRole('link').count()) >= 9);
  await page.keyboard.press('Escape');
  await dialog.waitFor({ state: 'detached', timeout: 5000 }).catch(() => {});
  const back = await page.evaluate(() => document.activeElement?.textContent?.includes('Meniu'));
  check('mobile menu: Escape closes and returns focus', (await dialog.count()) === 0 && back);
  const sw = await page.evaluate(() => document.documentElement.scrollWidth);
  check('mobile: no horizontal scroll at 375px', sw <= 375, `scrollWidth ${sw}`);
  await page.context().close();
}

// ── Desktop margin notes and section index ──
{
  const page = await newPage();
  await page.goto(`${BASE}/neuron-arc-reflex`);
  await page.waitForSelector('article.lesson aside');
  const layout = await page.evaluate(() => {
    const article = document.querySelector('article.lesson').getBoundingClientRect();
    const note = document.querySelector('article.lesson aside').getBoundingClientRect();
    const index = document.querySelector('nav[aria-label="Pe această pagină"]');
    return { articleRight: article.right, noteLeft: note.left, noteRight: note.right, indexVisible: !!index?.offsetParent, vw: innerWidth };
  });
  check('desktop: margin notes sit right of the reading column', layout.noteLeft > layout.articleRight && layout.noteRight <= layout.vw, JSON.stringify(layout));
  check('desktop: section index visible', layout.indexVisible);
  await page.context().close();
}

await browser.close();
const failed = results.filter((r) => !r).length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exitCode = failed ? 1 : 0;
