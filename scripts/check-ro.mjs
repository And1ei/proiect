// Fails the build if Romanian text uses cedilla forms (ş ţ Ş Ţ) instead of comma-below
// (ș ț Ș Ț), or if user-facing strings contain an em dash.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = new URL('..', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');
const CEDILLA = /[ŞşŢţ]/g;
const EM_DASH = /—/g;

// Text files only: binary assets (mp3, fonts) can contain any byte sequence
const TEXT = /\.(jsx?|tsx?|mjs|css|html|json|md|svg)$/;
const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : TEXT.test(p) ? [p] : [];
  });

const problems = [];
const scan = (file, pattern, what) => {
  readFileSync(file, 'utf8')
    .split('\n')
    .forEach((line, i) => {
      for (const m of line.matchAll(pattern)) {
        const cp = m[0].codePointAt(0).toString(16).toUpperCase().padStart(4, '0');
        problems.push(`${relative(root, file)}:${i + 1}  ${what} U+${cp}  ${line.trim().slice(0, 80)}`);
      }
    });
};

for (const file of [...walk(join(root, 'src')), join(root, 'index.html')]) scan(file, CEDILLA, 'cedilla');
for (const file of [...walk(join(root, 'src/content')), join(root, 'index.html')]) scan(file, EM_DASH, 'em dash');

if (problems.length) {
  console.error(`check-ro: ${problems.length} problem(s)\n${problems.join('\n')}`);
  process.exit(1);
}
console.log('check-ro: no cedilla diacritics in src/ or index.html, no em dashes in user-facing strings');
