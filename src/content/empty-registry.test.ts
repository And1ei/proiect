// With zero games (a game hidden at the last minute) the site still renders and reads as finished:
// no game links, no "Jocuri" item, no "jucat" stamp, no promise of a game to come.
import { describe, expect, it, vi } from 'vitest';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../games/registry', () => ({
  GAMES: [],
  SANDBOX_ENABLED: false,
  getGame: () => null,
  gamePath: (id: string) => `/joc/${id}`,
}));

const render = async (path: string, load: () => Promise<{ default: (p: never) => unknown }>, props = {}) => {
  const { default: Page } = await load();
  const { default: Nav } = await import('../components/layout/Nav');
  const { default: Footer } = await import('../components/layout/Footer');
  return renderToString(h(MemoryRouter, { initialEntries: [path] }, h(Nav), h(Page as never, props), h(Footer)));
};

const plain = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

describe('with no games in the registry', () => {
  it('counts zero games', async () => {
    const stats = await import('./stats');
    expect(stats.gameCount).toBe(0);
    expect(stats.gamesSummary()).toBeNull();
    expect(stats.firstPlayable()).toBeNull();
  });

  it('renders every page without a game promise', async () => {
    const { LESSONS } = await import('./ro/lessons/index.ts');
    const pages = [
      await render('/', () => import('../pages/Contents')),
      await render('/jocuri', () => import('../pages/GamesIndex')),
      ...(await Promise.all(LESSONS.map((l) => render(`/${l.slug}`, () => import('../pages/TopicPage') as never, { slug: l.slug })))),
    ];
    for (const html of pages) {
      const text = plain(html);
      expect(text.length).toBeGreaterThan(800);
      expect(html).not.toMatch(/href="\/joc\//);
      expect(html).not.toMatch(/href="\/jocuri"/);
      expect(text).not.toMatch(/urmează|în curând|jucat\b/i);
      expect(text).not.toMatch(/\d+ (de )?jocuri|\bun joc\b|jocul îți arată/);
    }
  });
});
