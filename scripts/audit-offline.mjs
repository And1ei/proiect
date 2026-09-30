// Offline test in a real Chromium: first visit online (the service worker installs and precaches),
// then the network is cut and each route is loaded again: by normal reload, by a fresh navigation
// in a new tab, and by a hard reload (cache-bypassing). The real Phaser games are started offline to
// prove the lazy Phaser chunk, scene code, sprites and fonts come from the precache.
//
// Usage:
//   npm run build
//   npx vite preview --port 4173
//   node scripts/audit-offline.mjs [baseUrl]
import { chromium } from 'playwright-core';
import os from 'node:os';
import path from 'node:path';

const BASE = process.argv[2] ?? 'http://localhost:4173';
const executablePath =
  process.env.CHROMIUM_PATH ?? path.join(os.homedir(), 'AppData/Local/Chromium/Application/chrome.exe');
const GAMES = ['/joc/poarta-membranei', '/joc/poarta-membranei-avansat', '/joc/safari-microscop', '/joc/safari-microscop-avansat'];
const DOM_GAMES = ['/joc/echilibrul', '/joc/echilibrul-avansat'];
const ROUTES = ['/', '/jocuri', '/celula', '/ecosisteme', '/diversitatea-vietii', '/impactul-uman', '/laboratorul', '/credite', ...GAMES, ...DOM_GAMES];
const GAME = GAMES[0];

const results = [];
const check = (name, pass, detail = '') => {
  results.push(pass);
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`);
};

const browser = await chromium.launch({ executablePath, headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));

// ── Online: install the service worker ──
await page.goto(`${BASE}/`);
const swState = await page.evaluate(async () => {
  const reg = await navigator.serviceWorker.ready;
  // Wait until it controls the page (clientsClaim) and precaching has finished (activated)
  for (let i = 0; i < 100 && !navigator.serviceWorker.controller; i++) await new Promise((r) => setTimeout(r, 100));
  return { active: reg.active?.state, controlled: Boolean(navigator.serviceWorker.controller) };
});
check('service worker installed and controlling the page', swState.active === 'activated' && swState.controlled, JSON.stringify(swState));
const cached = await page.evaluate(async () => {
  const names = await caches.keys();
  const urls = (await Promise.all(names.map(async (n) => (await (await caches.open(n)).keys()).map((r) => r.url)))).flat();
  return { count: urls.length, phaser: urls.some((u) => /\/assets\/phaser-[^/]+\.js/.test(u)) };
});
check('precache holds the lazy Phaser chunk', cached.phaser, `${cached.count} files cached`);

// ── Offline ──
await context.setOffline(true);
const failedRequests = [];
context.on('requestfailed', (r) => failedRequests.push(r.url().replace(BASE, '')));
const heading = async (p) => (await p.locator('h1').first().textContent({ timeout: 8000 }).catch(() => null))?.trim();

for (const route of ROUTES) {
  // Fresh navigation (typing the URL)
  await page.goto(`${BASE}${route}`).catch(() => undefined);
  const h1 = await heading(page);
  check(`offline navigate ${route}`, Boolean(h1), h1 ?? 'no page');

  // Normal reload (F5)
  await page.reload().catch(() => undefined);
  const h1r = await heading(page);
  check(`offline reload ${route}`, Boolean(h1r), h1r ?? 'no page');
}

// New tab, deep link, offline
const tab = await context.newPage();
await tab.goto(`${BASE}/jocuri`).catch(() => undefined);
check('offline deep link in a new tab', Boolean(await heading(tab)));
await tab.close();

// Start each Phaser game offline: the chunk, scene, sprites and fonts must all load from the cache
for (const game of GAMES) {
  await page.goto(`${BASE}${game}`).catch(() => undefined);
  // the animated intro: an ordered list of steps with a drawing in each (canvas or svg)
  const howTo = await page.locator('ol[aria-label] :is(canvas, svg)').first().waitFor({ timeout: 8000 }).then(() => true).catch(() => false);
  check(`offline: animated intro renders ${game}`, howTo);
  await page.getByRole('button', { name: /^(Începe|Sari peste, joc direct)$/ }).click();
  const canvas = await page.locator('[data-game-stage] canvas').waitFor({ timeout: 10000 }).then(() => true).catch(() => false);
  check(`offline: Phaser game boots ${game}`, canvas);
  await page.waitForTimeout(3000);
  const loadError = await page.getByText('Jocul nu s-a putut încărca').count();
  const drawn = await page.evaluate(() => { const c = document.querySelector('[data-game-stage] canvas'); return !!c && c.width > 0 && c.height > 0; });
  check(`offline: scene running, no load error ${game}`, loadError === 0 && drawn);
}
if (process.env.OFFLINE_SCREENSHOT) await page.screenshot({ path: process.env.OFFLINE_SCREENSHOT });
// DOM games offline: they start and run from the precache, and never request the Phaser chunk
for (const game of DOM_GAMES) {
  const phaserRequests = [];
  const onReq = (r) => /phaser-/.test(r.url()) && phaserRequests.push(r.url());
  page.on('request', onReq);
  await page.goto(`${BASE}${game}`).catch(() => undefined);
  await page.getByRole('button', { name: /^(Începe|Sari peste, joc direct)$/ }).click();
  const running = await page.getByText(/Anul 1 din 10/).waitFor({ timeout: 8000 }).then(() => true).catch(() => false);
  await page.waitForTimeout(2500);
  const sprites = await page.evaluate(() => [...document.querySelectorAll('[data-game-stage] svg image')].length);
  page.off('request', onReq);
  check(`offline: ${game} runs, sprites drawn, no Phaser chunk requested`, running && sprites > 10 && phaserRequests.length === 0, `${sprites} sprites`);
}

const fonts = await page.evaluate(() => document.fonts.check('16px "DM Mono"') && document.fonts.check('500 32px "Fraunces Variable"'));
check('offline: self-hosted fonts available', fonts);

check('offline: no failed requests (everything served from the precache)', failedRequests.length === 0, failedRequests.slice(0, 5).join(', '));

// Hard reload (bypasses the service worker by browser design). Reported, not required.
const cdp = await context.newCDPSession(page);
await cdp.send('Page.reload', { ignoreCache: true }).catch(() => undefined);
await page.waitForTimeout(1500);
const hard = await heading(page);
console.log(`INFO  offline hard reload (cache bypass) ${GAME}: ${hard ? `rendered "${hard}"` : 'no page: the browser skips the service worker on a hard reload, as specified'}`);

check('no uncaught page errors', errors.length === 0, errors.slice(0, 3).join(' | '));
await browser.close();

const failed = results.filter((r) => !r).length;
console.log(`\naudit-offline: ${results.length - failed}/${results.length} passed`);
process.exitCode = failed ? 1 : 0;
