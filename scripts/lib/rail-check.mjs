// Scroll indicator regression test (F1), used by site-check.mjs. On each route it scrolls to 0, 50
// and 100 % and compares the drawn fill (its rendered height against the rail's) with the true
// document progress, within 2 %. It also opens a topic block on the landing page, navigates between
// routes client-side, and checks the rail is absent on a game route and never takes pointer events.

const TOLERANCE = 0.02;

/** Scrolls to `f` of the page, waits for the spring to settle, returns { truth, shown }. */
async function sample(page, f) {
  return page.evaluate(async (f) => {
    const max = () => document.documentElement.scrollHeight - innerHeight;
    scrollTo(0, max() * f);
    // wait until the fill stops moving (spring settles), 3 s at most
    let last = -1;
    for (let i = 0; i < 60; i++) {
      await new Promise((r) => setTimeout(r, 50));
      const fill = document.querySelector('[data-rail-fill]');
      const h = fill ? fill.getBoundingClientRect().height : -1;
      if (Math.abs(h - last) < 0.2 && i > 4) break;
      last = h;
    }
    const rail = document.querySelector('[data-scroll-rail]');
    const fill = document.querySelector('[data-rail-fill]');
    const truth = scrollY / Math.max(1, max());
    if (!rail || !fill) return { truth, shown: null };
    const shown = fill.getBoundingClientRect().height / rail.getBoundingClientRect().height;
    return { truth, shown, pointer: getComputedStyle(rail).pointerEvents, hidden: rail.getAttribute('aria-hidden') };
  }, f);
}

async function assertRoute(page, check, label) {
  const bad = [];
  for (const f of [0, 0.5, 1]) {
    const r = await sample(page, f);
    if (r.shown === null || Math.abs(r.shown - r.truth) > TOLERANCE) bad.push(`${Math.round(f * 100)}%: true ${r.truth.toFixed(3)}, shown ${r.shown === null ? 'none' : r.shown.toFixed(3)}`);
    if (r.shown !== null && (r.pointer !== 'none' || r.hidden !== 'true')) bad.push('rail takes pointer events or is not aria-hidden');
  }
  check('scroll', `rail matches progress: ${label}`, bad.length === 0, bad.join('; '));
}

export async function railChecks(newPage, base, check, topicSlug) {
  for (const width of [375, 1440]) {
    const page = await newPage(width, width < 768 ? 812 : 900);
    for (const route of ['/', `/${topicSlug}`, '/jocuri']) {
      await page.goto(base + route, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      await assertRoute(page, check, `${route} at ${width}px`);
    }

    // Landing page: open a closed topic block (the document grows), then re-assert
    await page.goto(base + '/', { waitUntil: 'networkidle' });
    const closed = page.locator('li[data-rail-mark] h2 button[aria-expanded="false"]').first();
    if (await closed.count()) {
      await closed.click();
      await page.waitForTimeout(900);
    }
    await assertRoute(page, check, `/ after opening a topic at ${width}px`);

    // Client-side navigation (no reload), then re-assert
    await page.evaluate(() => scrollTo(0, 0));
    await page.getByRole('link', { name: /^Jocuri$/ }).first().click();
    await page.waitForURL('**/jocuri');
    await page.waitForTimeout(600);
    await assertRoute(page, check, `/jocuri after navigating at ${width}px`);

    // Games own the screen: no rail there
    await page.goto(base + '/joc/' + (await page.evaluate(() => window.__siteStats?.games[0]?.levels[0] ?? '')), { waitUntil: 'networkidle' });
    check('scroll', `no rail on a game route at ${width}px`, (await page.locator('[data-scroll-rail]').count()) === 0);
    await page.context().close();
  }
}
