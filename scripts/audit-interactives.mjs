// Plays every interactive end to end in a real Chromium, keyboard only, and checks game feel,
// progress reporting ("completat" vs "cu ajutor") and reduced motion.
// Usage: node scripts/audit-interactives.mjs [baseUrl] [only]   (dev or preview server running)
import { chromium } from 'playwright-core';
import os from 'node:os';
import path from 'node:path';

const BASE = process.argv[2] ?? 'http://localhost:3000';
const ONLY = process.argv[3];
const executablePath =
  process.env.CHROMIUM_PATH ?? path.join(os.homedir(), 'AppData/Local/Chromium/Application/chrome.exe');

const results = [];
const check = (name, pass, detail = '') => {
  results.push(pass);
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`);
};
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const browser = await chromium.launch({ executablePath, headless: true });

async function open(slug, { reducedMotion = 'no-preference' } = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion });
  const page = await ctx.newPage();
  page.errors = [];
  page.on('pageerror', (e) => page.errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && page.errors.push(m.text()));
  await page.goto(`${BASE}/${slug}`);
  const frame = page.locator(`[data-interactive]`);
  await frame.locator('h3').first().waitFor({ timeout: 10000 });
  await frame.scrollIntoViewIfNeeded();
  // Keyboard helpers scoped to the interactive
  page.press = async (locator) => {
    await locator.focus();
    await page.keyboard.press('Enter');
  };
  page.btn = (name, exact = true) => frame.getByRole('button', { name, exact });
  page.frame = frame;
  page.panel = frame.locator('[role=tabpanel]:not([hidden])');
  return page;
}

const progressOf = (page, slug) =>
  page.evaluate((s) => JSON.parse(localStorage.getItem('soft-educational:v1'))?.topics?.[s]?.interactive ?? null, slug);
const message = (page) => page.frame.locator('[role="status"]').last().textContent();

// ── Punnett ──
async function punnett() {
  const page = await open('mendel');
  const { frame } = page;
  const panel = page.panel;
  // Wrong: parent 1's allele onto parent 2's header (left side)
  await page.press(panel.locator('[data-tag-id="p1-0"]'));
  await page.press(panel.getByRole('button', { name: /Gameții părintelui 2/ }).first());
  check('punnett: wrong header placement rejected with feedback', (await panel.locator('[data-tag-id="p1-0"]').count()) === 1 && /./.test(await message(page)));
  // Right: p1 tags on top, p2 tags on the left
  for (const [tag, slotName] of [['p1-0', 1], ['p1-1', 1], ['p2-0', 2], ['p2-1', 2]]) {
    await page.press(panel.locator(`[data-tag-id="${tag}"]`));
    await page.press(panel.getByRole('button', { name: new RegExp(`Gameții părintelui ${slotName}`) }).first());
  }
  check('punnett: all four gametes placed', (await panel.locator('[data-tag-id]').count()) === 0);
  // Cells: headers are A, a on both sides → AA Aa / Aa aa
  const expected = { '1-1': 'AA', '1-2': 'Aa', '2-1': 'Aa', '2-2': 'aa' };
  await page.press(panel.getByRole('button', { name: 'Căsuța rândului 1, coloana 1, goală' }));
  await page.press(frame.getByRole('button', { name: 'aa', exact: true }));
  const stillOpen = await frame.getByRole('group', { name: 'Alege genotipul' }).count();
  check('punnett: wrong genotype keeps the picker open', stillOpen === 1);
  await page.keyboard.press('Escape');
  for (const [key, g] of Object.entries(expected)) {
    const [r, c] = key.split('-');
    const cell = panel.getByRole('button', { name: `Căsuța rândului ${r}, coloana ${c}, goală` });
    if (await cell.count()) await page.press(cell);
    await page.press(frame.getByRole('group', { name: 'Alege genotipul' }).getByRole('button', { name: g, exact: true }));
  }
  check('punnett: grid filled', (await frame.getByText('Raport genotipic').count()) === 1);
  await frame.getByLabel(/Raport genotipic/).fill('1:2:1');
  await frame.getByLabel(/Raport fenotipic/).fill('3 : 1');
  await page.press(page.btn('Verifică'));
  await page.press(frame.getByRole('button', { name: '25 %' }).first());
  await frame.getByText('Încrucișare rezolvată.').first().waitFor({ timeout: 3000 });
  const saved = await progressOf(page, 'mendel');
  check('punnett: monohybrid solved end to end, saved as completat', saved?.completed === true && saved.assisted === false, JSON.stringify(saved));
  check('punnett: stamp „Completat” shown', (await frame.getByText('Completat').count()) >= 1);
  const streak = await frame.getByText(/Serie: \d/).count();
  check('punnett: streak badge shown after consecutive correct answers', streak === 1);

  // Test cross with a hint → "cu ajutor" is not a downgrade of an unassisted result, so use a fresh context
  await page.context().close();
  const p2 = await open('mendel');
  await p2.press(p2.frame.getByRole('tab', { name: 'Încrucișare de test' }));
  await p2.press(p2.panel.getByRole('button', { name: 'Indiciu' }));
  await p2.press(p2.panel.getByRole('button', { name: 'AA', exact: true }));
  await p2.press(p2.panel.getByRole('button', { name: 'Aa', exact: true }));
  for (const [tag, n] of [['p1-0', 1], ['p1-1', 1], ['p2-0', 2], ['p2-1', 2]]) {
    await p2.press(p2.panel.locator(`[data-tag-id="${tag}"]`));
    await p2.press(p2.panel.getByRole('button', { name: new RegExp(`Gameții părintelui ${n}`) }).first());
  }
  for (const [r, c, g] of [[1, 1, 'Aa'], [1, 2, 'aa'], [2, 1, 'Aa'], [2, 2, 'aa']]) {
    await p2.press(p2.panel.getByRole('button', { name: `Căsuța rândului ${r}, coloana ${c}, goală` }));
    await p2.press(p2.frame.getByRole('group', { name: 'Alege genotipul' }).getByRole('button', { name: g, exact: true }));
  }
  await p2.panel.getByLabel(/Raport genotipic/).fill('1:1');
  await p2.panel.getByLabel(/Raport fenotipic/).fill('1:1');
  await p2.press(p2.panel.getByRole('button', { name: 'Verifică' }));
  await p2.press(p2.panel.getByRole('button', { name: '50 %' }));
  await p2.frame.getByText('Încrucișare rezolvată.').last().waitFor({ timeout: 3000 });
  const saved2 = await progressOf(p2, 'mendel');
  check('punnett: test cross with a hint saved as cu ajutor', saved2?.completed === true && saved2.assisted === true, JSON.stringify(saved2));
  check('punnett: stamp „Cu ajutor” shown', (await p2.frame.getByText('Cu ajutor').count()) >= 1);
  check('punnett: no console errors', page.errors.length + p2.errors.length === 0, [...page.errors, ...p2.errors][0]);
  await p2.context().close();
}

// ── DNA decoder ──
async function decoder() {
  const page = await open('adn-proteine');
  const { frame } = page;
  const bases = frame.getByRole('group', { name: 'Baze de ARN' });
  // One wrong base first (template starts with T, so U is wrong)
  await bases.getByRole('button', { name: 'U', exact: true }).focus();
  await page.keyboard.press('Enter');
  check('decoder: wrong base rejected', (await frame.getByText(/Poziția 1$/).count()) === 1);
  // Type the rest from the keyboard: TACCTTCAAATT → AUGGAAGUUUAA
  for (const b of 'AUGGAAGUUUAA') await page.keyboard.press(b.toLowerCase());
  const select = frame.getByLabel(/Aminoacidul pentru codonul/);
  await select.waitFor({ timeout: 3000 });
  check('decoder: full mRNA built by typing', true);
  for (const [code, codon] of [['M', 'AUG'], ['E', 'GAA'], ['V', 'GUU'], ['*', 'UAA']]) {
    await frame.getByLabel(`Aminoacidul pentru codonul ${codon}`).selectOption(code);
    await page.press(page.btn('Verifică'));
  }
  await frame.getByText(/Lanțul obținut: Met-Glu-Val/).waitFor({ timeout: 3000 });
  check('decoder: decoded Met-Glu-Val and stopped at UAA', (await frame.getByText(/codonul stop UAA/).count()) === 1);
  const saved = await progressOf(page, 'adn-proteine');
  check('decoder: completion saved', saved?.completed === true, JSON.stringify(saved));
  check('decoder: no console errors', page.errors.length === 0, page.errors[0]);
  await page.context().close();
}

// ── Heart ──
async function heart() {
  const page = await open('inima-circulatia');
  const { frame } = page;
  const part = (name) => frame.getByRole('button', { name, exact: true });
  // Wrong first click (atrium) does not advance
  await page.press(part('Atriul drept'));
  check('heart: wrong structure does not advance', (await frame.getByText('Pasul 1 din 6').count()) === 1);
  for (const name of ['Ventriculul drept', 'Valva pulmonară', 'Artere pulmonare', 'Plămâni (capilare)', 'Vene pulmonare', 'Atriul stâng']) await page.press(part(name));
  check('heart: pulmonary circuit traced', (await frame.getByText('Circuit urmărit.').count()) === 1);
  check('heart: route segments drawn', (await frame.locator('svg g[pointer-events="none"] path').count()) >= 5);
  await page.press(frame.getByRole('tab', { name: /Circulația mare/ }));
  for (const name of ['Ventriculul stâng', 'Valva aortică', 'Aorta', 'Țesuturi (capilare)', 'Vene cave', 'Atriul drept']) await page.press(part(name));
  await page.waitForTimeout(300);
  const saved = await progressOf(page, 'inima-circulatia');
  check('heart: both circuits traced, completion saved', saved?.completed === true, JSON.stringify(saved));
  check('heart: both circuit tabs marked solved', (await frame.getByRole('tab', { name: /rezolvat/ }).count()) === 2);
  check('heart: no console errors', page.errors.length === 0, page.errors[0]);
  await page.context().close();
}

// ── Reflex arc ──
async function reflexArc() {
  const page = await open('neuron-arc-reflex');
  const { frame } = page;
  const tag = (label) => frame.getByRole('button', { name: label, exact: true });
  const slot = (n) => frame.getByRole('button', { name: `Pasul ${n}: loc liber` });
  // Wrong: effector into step 1
  await page.press(tag('Efector'));
  await page.press(slot(1));
  check('reflex: wrong component bounces back', (await tag('Efector').count()) === 1 && (await slot(1).count()) === 1);
  for (const [label, n] of [['Receptor', 1], ['Cale aferentă', 2], ['Centru nervos', 3], ['Cale eferentă', 4], ['Efector', 5]]) {
    await page.press(tag(label));
    await page.press(slot(n));
  }
  check('reflex: arc complete', (await frame.getByText(/Arcul reflex e complet/).count()) === 1);
  await page.press(frame.getByRole('button', { name: 'Reflex necondiționat' }));
  await page.press(frame.getByRole('button', { name: 'Reflex condiționat' }));
  await page.press(frame.getByRole('button', { name: /S-a format în timpul vieții/ }));
  await page.waitForTimeout(300);
  const saved = await progressOf(page, 'neuron-arc-reflex');
  check('reflex: classification solved, completion saved', saved?.completed === true, JSON.stringify(saved));
  check('reflex: no console errors', page.errors.length === 0, page.errors[0]);
  await page.context().close();
}

// ── Ventilation ──
async function ventilation(reducedMotion = 'no-preference') {
  const page = await open('ventilatia-pulmonara', { reducedMotion });
  const { frame } = page;
  const settle = () => page.waitForTimeout(reducedMotion === 'reduce' ? 50 : 1400);
  // Two full cycles, one of them forced in and out
  for (const name of ['Inspiră', 'Expiră', 'Inspiră', 'Inspiră', 'Expiră', 'Expiră']) {
    await page.press(page.btn(name));
    await settle();
  }
  check(`ventilation (${reducedMotion}): two cycles counted`, (await frame.getByText('Respirații complete: 2 din 2').count()) === 1);
  const traceLen = await frame.locator('svg[role=group] > path').last().getAttribute('d');
  check(`ventilation (${reducedMotion}): graph drew the breaths`, traceLen.split('L').length > 6, `${traceLen.split('L').length} points`);
  const band = (from, to) => frame.getByRole('button', { name: `Banda dintre ${from} și ${to} ml` });
  // Wrong first: VIR band when asked for VT
  await page.press(band('2.700', '5.700'));
  check(`ventilation (${reducedMotion}): wrong band not accepted`, (await frame.getByText(/volumul curent \(VT\)/).count()) === 1);
  await page.press(band('2.200', '2.700'));
  await page.press(band('2.700', '5.700'));
  await page.press(band('1.200', '2.200'));
  await page.press(frame.getByRole('button', { name: /Acolada/ }));
  check(`ventilation (${reducedMotion}): all volumes matched`, (await frame.getByText('Toate volumele sunt la locul lor.').count()) === 1);
  await page.press(frame.getByRole('button', { name: /foițele pleurale rămân lipite/ }));
  await page.waitForTimeout(300);
  const saved = await progressOf(page, 'ventilatia-pulmonara');
  check(`ventilation (${reducedMotion}): pleura check solved, completion saved`, saved?.completed === true, JSON.stringify(saved));
  check(`ventilation (${reducedMotion}): no console errors`, page.errors.length === 0, page.errors[0]);
  await page.context().close();
}

// ── Game feel: particles, wobble, reduced-motion ring, sound gating, mouse drag ──
async function gamefeel() {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  // Count audio activity without playing anything audible in the test browser
  await ctx.addInitScript(() => {
    window.__audio = { contexts: 0, oscillators: 0 };
    const Real = window.AudioContext;
    window.AudioContext = class extends Real {
      constructor(...a) { super(...a); window.__audio.contexts += 1; }
      createOscillator() { window.__audio.oscillators += 1; return super.createOscillator(); }
    };
  });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/mendel`);
  const frame = page.locator('[data-interactive]');
  await frame.locator('h3').first().waitFor();
  await frame.scrollIntoViewIfNeeded();
  const panel = frame.locator('[role=tabpanel]:not([hidden])');

  // Mouse drag, wrong target: tag must spring back and wobble
  const tag = panel.locator('[data-tag-id="p1-0"]');
  const wrongSlot = panel.getByRole('button', { name: /Gameții părintelui 2/ }).first();
  const from = await tag.boundingBox();
  const to = await wrongSlot.boundingBox();
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 8 });
  await page.mouse.up();
  await page.waitForTimeout(60);
  const wobble = await tag.evaluate((el) => el.parentElement.style.transform);
  check('gamefeel: wrong answer wobbles the element', /translateX\(-?(?!0px)\d/.test(wobble), wobble);
  await page.waitForTimeout(900);
  check('gamefeel: wrong drag springs the tag back', (await tag.count()) === 1);

  // Mouse drag, right target
  const rightSlot = panel.getByRole('button', { name: /Gameții părintelui 1/ }).first();
  const f2 = await tag.boundingBox();
  const t2 = await rightSlot.boundingBox();
  await page.mouse.move(f2.x + f2.width / 2, f2.y + f2.height / 2);
  await page.mouse.down();
  await page.mouse.move(t2.x + t2.width / 2, t2.y + t2.height / 2, { steps: 8 });
  await page.mouse.up();
  await page.waitForTimeout(80);
  const particles = await panel.locator('svg[viewBox="0 0 200 200"].pointer-events-none').count();
  check('gamefeel: correct drop bursts blob particles', particles >= 5, `${particles} particles`);
  check('gamefeel: mouse drag places the gamete', (await panel.locator('[data-tag-id="p1-0"]').count()) === 0);

  // Sound: silent by default, nothing created until the learner turns it on
  const before = await page.evaluate(() => ({ ...window.__audio, setting: JSON.parse(localStorage.getItem('soft-educational:v1'))?.settings?.sound ?? false }));
  check('gamefeel: sound muted by default, no audio created', before.contexts === 0 && before.oscillators === 0 && before.setting === false, JSON.stringify(before));
  await frame.getByRole('button', { name: 'Sunet: oprit' }).click();
  await panel.locator('[data-tag-id="p1-1"]').click();
  await panel.getByRole('button', { name: /Gameții părintelui 1/ }).first().click();
  const after = await page.evaluate(() => ({ ...window.__audio, setting: JSON.parse(localStorage.getItem('soft-educational:v1'))?.settings?.sound }));
  check('gamefeel: turning sound on plays and persists in the progress blob', after.oscillators >= 2 && after.setting === true, JSON.stringify(after));
  await page.reload();
  await frame.locator('h3').first().waitFor();
  check('gamefeel: sound setting survives reload', (await frame.getByRole('button', { name: 'Sunet: pornit' }).count()) === 1);
  await ctx.close();

  // Reduced motion: border ring instead of movement
  const rm = await open('mendel', { reducedMotion: 'reduce' });
  await rm.press(rm.panel.locator('[data-tag-id="p1-0"]'));
  await rm.press(rm.panel.getByRole('button', { name: /Gameții părintelui 2/ }).first());
  const ring = await rm.panel.locator('[data-flash]').first().getAttribute('data-flash');
  const moved = await rm.panel.locator('[data-tag-id="p1-0"]').evaluate((el) => el.parentElement.style.transform || 'none');
  check('gamefeel (reduced): ring flash, no wobble', ring === 'incorrect' && !/translateX\(-?(?!0px)\d/.test(moved), `ring=${ring} transform=${moved}`);
  await rm.press(rm.panel.locator('[data-tag-id="p1-0"]'));
  await rm.press(rm.panel.getByRole('button', { name: /Gameții părintelui 1/ }).first());
  const burst = await rm.panel.locator('svg[viewBox="0 0 200 200"].pointer-events-none').count();
  check('gamefeel (reduced): no particle burst', burst === 0);
  await rm.context().close();
}

const suites = { punnett, decoder, heart, reflexArc, ventilation, ventilationReduced: () => ventilation('reduce'), gamefeel };
for (const [name, run] of Object.entries(suites)) {
  if (ONLY && ONLY !== name) continue;
  try {
    await run();
  } catch (e) {
    check(`${name}: ran without throwing`, false, e.message.split('\n')[0]);
  }
}

await browser.close();
const failed = results.filter((r) => !r).length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exitCode = failed ? 1 : 0;
