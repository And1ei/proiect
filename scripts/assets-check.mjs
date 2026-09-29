// License gate for shipped assets. Runs before every build (package.json prebuild).
// Fails when:
//   - a file in an asset folder (src/assets/{icons,organisms,ui,sounds,textures}) has no manifest entry,
//   - a manifest entry points at a missing file, or at an original missing from assets-src/,
//   - a license is missing, unrecognised, NC or ND,
//   - a CC-BY-SA asset has no human licenseReview note (flagged for manual review, never auto-accepted),
//   - attribution data is incomplete (author, a specific sourceUrl, attributionRequired for BY licenses),
//   - an id is duplicated, or a sound event is mapped twice.
// Usage: npm run assets:check
import { existsSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ASSETS, LICENSE_INFO } from '../src/assets/manifest.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const ASSET_DIR = join(root, 'src/assets');
const RAW_DIR = join(root, 'assets-src');
const FOLDERS = ['icons', 'organisms', 'ui', 'sounds', 'textures'];
const KINDS = new Set(['icon', 'organism', 'ui', 'sound', 'texture']);

const AUTO_OK = new Set(['CC0-1.0', 'PDM-1.0', 'CC-BY-3.0', 'CC-BY-4.0', 'MIT', 'Apache-2.0', 'OFL-1.1']);
const NEEDS_REVIEW = new Set(['CC-BY-SA-3.0', 'CC-BY-SA-4.0']);
const NEEDS_ATTRIBUTION = /^CC-BY/;

const errors = [];
const flags = [];
const fail = (where, msg) => errors.push(`${where}: ${msg}`);

const walk = (dir) =>
  existsSync(dir)
    ? readdirSync(dir).flatMap((name) => {
        const p = join(dir, name);
        return statSync(p).isDirectory() ? walk(p) : [p];
      })
    : [];

// ── Every manifest entry ──
const ids = new Set();
const events = new Map();
for (const [i, a] of ASSETS.entries()) {
  const where = a.id ? `asset "${a.id}"` : `asset[${i}]`;
  for (const key of ['id', 'file', 'kind', 'title', 'sourceName', 'sourceUrl', 'author', 'license', 'modifications', 'raw'])
    if (typeof a[key] !== 'string' || !a[key].trim()) fail(where, `missing ${key}`);
  if (ids.has(a.id)) fail(where, 'duplicate id');
  ids.add(a.id);
  if (!KINDS.has(a.kind)) fail(where, `unknown kind "${a.kind}"`);
  if (typeof a.attributionRequired !== 'boolean') fail(where, 'attributionRequired must be true or false');

  // License
  const lic = a.license ?? '';
  if (/NC|ND/i.test(lic)) fail(where, `license ${lic} is NonCommercial/NoDerivatives: not allowed`);
  else if (NEEDS_REVIEW.has(lic)) {
    if (!a.licenseReview?.by || !a.licenseReview?.date) fail(where, `${lic} (share-alike) needs manual review: add licenseReview { by, date, note }`);
    else flags.push(`${a.id}: ${lic}, reviewed by ${a.licenseReview.by} on ${a.licenseReview.date}`);
  } else if (!AUTO_OK.has(lic)) fail(where, `unrecognised license "${lic}"`);
  if (!LICENSE_INFO[lic] && !/NC|ND/i.test(lic)) fail(where, `license "${lic}" has no LICENSE_INFO entry for the credits page`);
  if (NEEDS_ATTRIBUTION.test(lic) && a.attributionRequired !== true) fail(where, `${lic} requires attribution: set attributionRequired: true`);

  // Source must be a specific item page, not a site root
  try {
    const u = new URL(a.sourceUrl);
    if (u.protocol !== 'https:') fail(where, 'sourceUrl must be https');
    if (u.pathname.replace(/\/+$/, '') === '') fail(where, 'sourceUrl must be the item page, not the site root');
  } catch {
    fail(where, `sourceUrl is not a URL: ${a.sourceUrl}`);
  }

  // Files
  if (a.file && !FOLDERS.includes(a.file.split('/')[0])) fail(where, `file must live in one of: ${FOLDERS.join(', ')}`);
  if (a.file && !existsSync(join(ASSET_DIR, a.file))) fail(where, `file missing: src/assets/${a.file} (run npm run assets:clean)`);
  if (a.raw && !existsSync(join(RAW_DIR, a.raw))) fail(where, `original missing: assets-src/${a.raw}`);

  if (a.kind === 'sound') {
    if (!a.event) fail(where, 'sound needs an event');
    else if (events.has(a.event)) fail(where, `event "${a.event}" already mapped to ${events.get(a.event)}`);
    else events.set(a.event, a.id);
  }
}

// ── Every file on disk ──
const known = new Set(ASSETS.map((a) => a.file));
for (const folder of FOLDERS) {
  for (const file of walk(join(ASSET_DIR, folder))) {
    const rel = relative(ASSET_DIR, file).replaceAll('\\', '/');
    if (!known.has(rel)) fail(`src/assets/${rel}`, 'no manifest entry (every shipped asset needs a source and license)');
  }
}

for (const f of flags) console.warn(`review  ${f}`);
for (const e of errors) console.error(`FAIL  ${e}`);
const byLicense = ASSETS.reduce((m, a) => ((m[a.license] = (m[a.license] ?? 0) + 1), m), {});
console.log(
  `\nassets-check: ${ASSETS.length} assets (${Object.entries(byLicense).map(([k, n]) => `${n} ${k}`).join(', ')}), ` +
    `${flags.length} flagged for review, ${errors.length} error(s)`,
);
process.exitCode = errors.length ? 1 : 0;
