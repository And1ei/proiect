// Drives a real Chromium through /sistem-de-design and checks Motion, Cursor and Focus.
// Usage: node scripts/audit-ds.mjs [baseUrl]   (dev server must be running)
// Browser: set CHROMIUM_PATH, otherwise the local Chromium install is used.
import { chromium } from 'playwright-core';
import os from 'node:os';
import path from 'node:path';

const BASE = process.argv[2] ?? 'http://localhost:3000';
const executablePath =
  process.env.CHROMIUM_PATH ?? path.join(os.homedir(), 'AppData/Local/Chromium/Application/chrome.exe');

const results = [];
const check = (area, name, pass, detail = '') => {
  results.push({ area, name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  [${area}] ${name}${detail ? `  (${detail})` : ''}`);
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const AT_REST = /^(none|matrix\(1, 0, 0, 1, 0, 0\))$/;

const browser = await chromium.launch({ executablePath, headless: true });

// ── 1. Desktop, mouse, motion allowed ───────────────────────────────
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'no-preference' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(`${BASE}/sistem-de-design`);
  await page.waitForTimeout(800);

  // Motion: spring tracks travel through intermediate positions
  const motion = page.locator('#motion');
  await motion.evaluate((el) => el.scrollIntoView({ block: 'center' })); await sleep(150);
  const dot = motion.locator('[data-test="spring-dot"]').first();
  const x0 = (await dot.boundingBox())?.x;
  await motion.locator('[data-test="spring-toggle"]').click();
  const xs = [];
  for (let i = 0; i < 8; i++) {
    await sleep(50);
    xs.push(Math.round((await dot.boundingBox())?.x ?? -1));
  }
  const xEnd = xs.at(-1);
  const intermediate = xs.filter((x) => x > x0 + 5 && x < xEnd - 5).length;
  check('Motion', 'spring track animates (not a jump)', intermediate >= 2, `x0=${Math.round(x0)} samples=${xs.join(',')}`);

  // Motion: blobs breathe
  const blob = page.locator('[data-test="blob"]').first();
  await blob.evaluate((el) => el.scrollIntoView({ block: 'center' })); await sleep(150);
  const t1 = await blob.evaluate((el) => getComputedStyle(el).transform);
  await sleep(1500);
  const t2 = await blob.evaluate((el) => getComputedStyle(el).transform);
  check('Motion', 'blob breathes', t1 !== t2 && t2 !== 'none', `${t1} -> ${t2}`);

  // Motion: hover + press squash on BlobButton
  const btn = page.locator('[data-test="squash-demo"]');
  await btn.evaluate((el) => el.scrollIntoView({ block: 'center' })); await sleep(150);
  await btn.hover();
  await sleep(500);
  const hoverT = await btn.evaluate((el) => el.style.transform);
  check('Motion', 'hover response on BlobButton', /scale/.test(hoverT), hoverT);
  await page.mouse.down();
  await sleep(400);
  const pressT = await btn.evaluate((el) => el.style.transform);
  await page.mouse.up();
  const sy = Number(/scaleY\(([\d.]+)\)/.exec(pressT)?.[1] ?? 1);
  check('Motion', 'press squash on BlobButton', sy < 0.97, pressT);

  // Cursor
  await page.mouse.move(40, 300);
  await sleep(300);
  const ring = page.locator('[data-soft-cursor-ring]');
  check('Cursor', 'ring mounted on mouse device', (await ring.count()) === 1);
  const ringState = await page.evaluate(() => {
    const el = document.querySelector('[data-soft-cursor-ring]');
    if (!el) return null;
    const cs = getComputedStyle(el);
    const grainZ = Number(getComputedStyle(document.body, '::after').zIndex);
    return { opacity: cs.opacity, z: Number(cs.zIndex), grainZ, transform: cs.transform, htmlCursor: getComputedStyle(document.documentElement).cursor };
  });
  check('Cursor', 'ring visible', ringState?.opacity === '1', JSON.stringify(ringState));
  check('Cursor', 'ring above grain overlay', ringState && ringState.z > ringState.grainZ, `ring z=${ringState?.z} grain z=${ringState?.grainZ}`);
  check('Cursor', 'native cursor hidden while ring active', ringState?.htmlCursor === 'none', ringState?.htmlCursor);

  // Ring follows with lag: immediately after a move it hasn't arrived yet
  await page.mouse.move(600, 300);
  const lag = await page.evaluate(() => new DOMMatrix(getComputedStyle(document.querySelector('[data-soft-cursor-ring]')).transform).m41);
  await sleep(600);
  const settled = await page.evaluate(() => new DOMMatrix(getComputedStyle(document.querySelector('[data-soft-cursor-ring]')).transform).m41);
  check('Cursor', 'ring follows with spring lag', lag < 590 && Math.abs(settled - 600) < 3, `lagX=${Math.round(lag)} settled=${Math.round(settled)}`);

  // Squish toward interactive element
  const target = page.locator('[data-test="cursor-target"]').first();
  await target.evaluate((el) => el.scrollIntoView({ block: 'center' })); await sleep(150);
  const tb = await target.boundingBox();
  await page.mouse.move(tb.x + tb.width * 0.2, tb.y + tb.height / 2, { steps: 4 });
  await sleep(700);
  const engaged = await page.evaluate(() => {
    const inner = document.querySelector('[data-soft-cursor-ring] > div');
    const m = new DOMMatrix(getComputedStyle(inner).transform);
    return { sx: Math.hypot(m.a, m.b), sy: Math.hypot(m.c, m.d) };
  });
  check('Cursor', 'ring grows and stretches toward interactive element', engaged.sx > 1.3 && engaged.sx > engaged.sy * 1.05, JSON.stringify(engaged));

  // Re-evaluates after scroll without pointer movement
  await page.mouse.wheel(0, 600);
  await sleep(800);
  const underPointer = await page.evaluate(({ x, y }) => !!document.elementFromPoint(x, y)?.closest('[data-test="cursor-target"]'), { x: tb.x + tb.width * 0.2, y: tb.y + tb.height / 2 });
  const afterScroll = await page.evaluate(() => {
    const inner = document.querySelector('[data-soft-cursor-ring] > div');
    return Math.hypot(...(({ a, b }) => [a, b])(new DOMMatrix(getComputedStyle(inner).transform)));
  });
  check('Cursor', 're-evaluates target after scroll', underPointer || afterScroll < 1.2, `stillOverTarget=${underPointer} scaleX=${afterScroll.toFixed(2)}`);

  // Text input keeps text cursor
  const input = page.locator('[data-test="cursor-input"]');
  if (await input.count()) {
    await input.evaluate((el) => el.scrollIntoView({ block: 'center' })); await sleep(150);
    await input.hover();
    const c = await input.evaluate((el) => getComputedStyle(el).cursor);
    check('Cursor', 'text input keeps text cursor', c === 'text', c);
  } else check('Cursor', 'text input keeps text cursor', false, 'no text input demo on page');

  // Focus: tab through everything
  await page.goto(`${BASE}/sistem-de-design`);
  await page.waitForTimeout(600);
  // Fresh load: the first Tab must start from the top of the document
  const seen = new Set();
  const focusIssues = [];
  let skipLinkFirst = null;
  for (let i = 0; i < 80; i++) {
    await page.keyboard.press('Tab');
    await sleep(60);
    const info = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const cs = getComputedStyle(el);
      const ow = parseFloat(cs.outlineWidth) || 0;
      const off = parseFloat(cs.outlineOffset) || 0;
      const r = el.getBoundingClientRect();
      const reach = ow + Math.max(off, 0);
      const ring = { l: r.left - reach, t: r.top - reach, r: r.right + reach, b: r.bottom + reach };
      // Any ancestor that clips the ring?
      let clippedBy = null;
      for (let p = el.parentElement; p && p !== document.documentElement; p = p.parentElement) {
        const pcs = getComputedStyle(p);
        const clips = /(hidden|clip|auto|scroll)/.test(pcs.overflow + pcs.overflowX + pcs.overflowY) || pcs.clipPath !== 'none';
        if (!clips || p === document.body) continue;
        const pr = p.getBoundingClientRect();
        if (ring.l < pr.left - 0.5 || ring.t < pr.top - 0.5 || ring.r > pr.right + 0.5 || ring.b > pr.bottom + 0.5) {
          clippedBy = p.tagName + '.' + String(p.className).slice(0, 40);
          break;
        }
      }
      if (el.style.clipPath || cs.clipPath !== 'none') clippedBy = 'self clip-path';
      // Background the ring sits on: first ancestor with an opaque background
      const bgOf = (node) => {
        for (let n = node; n; n = n.parentElement) {
          const c = getComputedStyle(n).backgroundColor;
          if (c && !/rgba\(.*, 0\)|transparent/.test(c)) return c;
        }
        return 'rgb(244, 239, 230)';
      };
      return {
        label: (el.getAttribute('aria-label') || el.textContent || el.tagName).trim().slice(0, 40),
        tag: el.tagName,
        style: cs.outlineStyle,
        width: ow,
        color: cs.outlineColor,
        onBg: bgOf(el.parentElement),
        ownBg: cs.backgroundColor,
        clippedBy,
        focusVisible: el.matches(':focus-visible'),
      };
    });
    if (!info) continue;
    if (skipLinkFirst === null) skipLinkFirst = info;
    const key = info.tag + info.label;
    if (seen.has(key)) continue;
    seen.add(key);
    const toRgb = (s) => (s.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
    const lum = ([r, g, b]) => {
      const f = (c) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    const ratio = (a, b) => {
      const [x, y] = [lum(toRgb(a)), lum(toRgb(b))].sort((m, n) => n - m);
      return (x + 0.05) / (y + 0.05);
    };
    const cBg = ratio(info.color, info.onBg);
    const problems = [];
    if (info.style === 'none' || info.width < 2) problems.push(`no visible outline (${info.style} ${info.width}px)`);
    if (info.clippedBy) problems.push(`clipped by ${info.clippedBy}`);
    if (cBg < 3) problems.push(`ring/background contrast ${cBg.toFixed(2)}`);
    if (problems.length) focusIssues.push(`${info.tag} "${info.label}": ${problems.join('; ')}`);
  }
  check('Focus', `ring visible, unclipped, >=3:1 on all ${seen.size} focus stops`, focusIssues.length === 0, focusIssues.join(' | '));
  check('Focus', 'first Tab lands on skip link', /sari la con/i.test(skipLinkFirst?.label ?? ''), skipLinkFirst?.label);

  // Mouse click must not show the ring
  const clickBtn = page.locator('[data-test="squash-demo"]');
  await clickBtn.evaluate((el) => el.scrollIntoView({ block: 'center' })); await sleep(150);
  await clickBtn.click();
  const mouseRing = await clickBtn.evaluate((el) => ({ fv: el.matches(':focus-visible'), outline: getComputedStyle(el).outlineStyle }));
  check('Focus', 'no ring on mouse click', !mouseRing.fv || mouseRing.outline === 'none', JSON.stringify(mouseRing));

  check('Console', 'no errors on desktop run', errors.length === 0, errors.slice(0, 3).join(' | '));
  await ctx.close();
}

// ── 2. Reduced motion (OS setting) ──────────────────────────────────
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/sistem-de-design`);
  await page.waitForTimeout(800);
  const blob = page.locator('[data-test="blob"]').first();
  await blob.evaluate((el) => el.scrollIntoView({ block: 'center' })); await sleep(150);
  const t1 = await blob.evaluate((el) => getComputedStyle(el).transform);
  await sleep(1200);
  const t2 = await blob.evaluate((el) => getComputedStyle(el).transform);
  check('Reduced', 'blob does not loop and sits at rest', t1 === t2 && AT_REST.test(t2), `${t1} -> ${t2}`);
  const motion = page.locator('#motion');
  await motion.evaluate((el) => el.scrollIntoView({ block: 'center' })); await sleep(150);
  const dot = motion.locator('[data-test="spring-dot"]').first();
  const x0 = (await dot.boundingBox()).x;
  await motion.locator('[data-test="spring-toggle"]').click();
  await sleep(40);
  const x1 = (await dot.boundingBox()).x;
  await sleep(600);
  const x2 = (await dot.boundingBox()).x;
  check('Reduced', 'transitions are instant', Math.abs(x1 - x2) < 1 && x2 > x0 + 50, `x0=${Math.round(x0)} +40ms=${Math.round(x1)} +640ms=${Math.round(x2)}`);
  await page.mouse.move(300, 300);
  check('Reduced', 'cursor ring not mounted', (await page.locator('[data-soft-cursor-ring]').count()) === 0);
  await ctx.close();
}

// ── 3. Simulated reduced motion via the dev toggle ──────────────────
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'no-preference' });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/sistem-de-design`);
  await page.waitForTimeout(600);
  const toggle = page.locator('[data-test="reduce-toggle"]');
  if (await toggle.count()) {
    await toggle.click();
    await sleep(300);
    const blob = page.locator('[data-test="blob"]').first();
    await blob.evaluate((el) => el.scrollIntoView({ block: 'center' })); await sleep(150);
    const t1 = await blob.evaluate((el) => getComputedStyle(el).transform);
    await sleep(1200);
    const t2 = await blob.evaluate((el) => getComputedStyle(el).transform);
    check('Toggle', 'dev toggle stops blob loops at rest pose', t1 === t2 && AT_REST.test(t2), `${t1} -> ${t2}`);
    await page.mouse.move(300, 300);
    check('Toggle', 'dev toggle unmounts cursor ring', (await page.locator('[data-soft-cursor-ring]').count()) === 0);
  } else check('Toggle', 'dev reduce-motion toggle exists', false);
  await ctx.close();
}

// ── 4. Touch device ─────────────────────────────────────────────────
{
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, hasTouch: true, isMobile: true, reducedMotion: 'no-preference' });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/sistem-de-design`);
  await page.waitForTimeout(600);
  await page.touchscreen.tap(200, 400);
  check('Touch', 'cursor ring not mounted on touch device', (await page.locator('[data-soft-cursor-ring]').count()) === 0);
  const htmlCursor = await page.evaluate(() => getComputedStyle(document.documentElement).cursor);
  check('Touch', 'native cursor untouched', htmlCursor !== 'none', htmlCursor);
  await ctx.close();
}

await browser.close();
const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
