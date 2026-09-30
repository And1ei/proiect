// npm run verify: every check, in order, stopping at the first failure (non-zero exit).
//   tsc → unit tests → assets:check → lessons:check → production build (+ no sandbox code in it)
//   → site:check (routes, a11y, consistency with stats.ts, scroll indicator, Lighthouse) → offline
// The last two need the built site served: this starts `vite preview` on its own port and stops it.
import { spawn, spawnSync } from 'node:child_process';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');
const PORT = 4179;
const BASE = `http://localhost:${PORT}`;
const node = process.execPath;
const bin = (name) => join(ROOT, 'node_modules', name);

const steps = [
  ['typecheck', [node, bin('typescript/bin/tsc'), '--noEmit']],
  ['unit tests', [node, bin('vitest/vitest.mjs'), 'run']],
  ['assets:check', [node, 'scripts/assets-check.mjs']],
  ['lessons:check', [node, 'scripts/lessons-check.mjs']],
  ['build', [node, bin('vite/bin/vite.js'), 'build']],
  ['no sandbox code in the build', null],
  ['site:check', [node, 'scripts/site-check.mjs', BASE], true],
  ['offline', [node, 'scripts/audit-offline.mjs', BASE], true],
];

const walk = (dir) => readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? walk(join(dir, f)) : [join(dir, f)]));

function noSandbox() {
  const markers = ['Sandbox A', 'sandbox/drift', 'sandbox/sort', 'SANDBOX_GAMES'];
  const hits = walk(join(ROOT, 'dist'))
    .filter((f) => /\.(js|html)$/.test(f))
    .filter((f) => markers.some((m) => readFileSync(f, 'utf8').includes(m)));
  if (hits.length) console.log(`sandbox code found in: ${hits.join(', ')}`);
  return hits.length === 0;
}

async function waitForServer() {
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(BASE)).ok) return true;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

let server = null;
const stop = () => {
  if (!server) return;
  if (process.platform === 'win32') spawnSync('taskkill', ['/pid', String(server.pid), '/t', '/f'], { stdio: 'ignore' });
  else server.kill();
  server = null;
};
process.on('exit', stop);

const started = Date.now();
for (const [name, cmd, needsServer] of steps) {
  console.log(`\n━━ verify: ${name} ━━`);
  let ok;
  if (!cmd) ok = noSandbox();
  else {
    if (needsServer && !server) {
      server = spawn(node, [bin('vite/bin/vite.js'), 'preview', '--port', String(PORT), '--strictPort'], { cwd: ROOT, stdio: 'ignore' });
      if (!(await waitForServer())) {
        console.log(`vite preview did not start on port ${PORT}`);
        ok = false;
      }
    }
    if (ok !== false) ok = spawnSync(cmd[0], cmd.slice(1), { cwd: ROOT, stdio: 'inherit' }).status === 0;
  }
  if (!ok) {
    stop();
    console.log(`\nverify: FAILED at "${name}"`);
    process.exit(1);
  }
}
stop();
console.log(`\nverify: all ${steps.length} steps passed in ${Math.round((Date.now() - started) / 1000)} s`);
