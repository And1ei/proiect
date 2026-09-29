// Renders the PWA / home-screen icons from the site's own cell mark (public/favicon.svg) on the paper
// colour from tokens.css. No stock art. Re-run after changing the mark: npm run pwa:icons
// Needs a local Chromium (same as the audits; set CHROMIUM_PATH if it isn't in the default place).
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import os from 'node:os';
import { chromium } from 'playwright-core';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const mark = readFileSync(join(root, 'public/favicon.svg'), 'utf8');
const tokens = readFileSync(join(root, 'src/styles/tokens.css'), 'utf8');
const paper = tokens.match(/--paper:\s*(#[0-9a-fA-F]{6})/)[1];
const outDir = join(root, 'public/icons');
mkdirSync(outDir, { recursive: true });

// [file, size, mark scale]: "any" icons fill most of the tile; maskable keeps the mark inside the
// 80 % safe zone so launchers can crop to any shape
const ICONS = [
  ['icon-192.png', 192, 0.78],
  ['icon-512.png', 512, 0.78],
  ['icon-maskable-512.png', 512, 0.56],
  ['apple-touch-icon.png', 180, 0.7],
];

const executablePath = process.env.CHROMIUM_PATH ?? join(os.homedir(), 'AppData/Local/Chromium/Application/chrome.exe');
const browser = await chromium.launch({ executablePath, headless: true });
const page = await browser.newPage();
for (const [file, size, scale] of ICONS) {
  await page.setViewportSize({ width: size, height: size });
  const inner = Math.round(size * scale);
  await page.setContent(
    `<!doctype html><body style="margin:0;width:${size}px;height:${size}px;background:${paper};display:grid;place-items:center">` +
      `<div style="width:${inner}px;height:${inner}px">${mark.replace('<svg ', '<svg width="100%" height="100%" ')}</div></body>`,
  );
  await page.screenshot({ path: join(outDir, file), omitBackground: false });
  console.log(`ok  public/icons/${file} (${size}px)`);
}
await browser.close();
