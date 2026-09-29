// Progress, kept only in this browser. No accounts, no network, no cookies.
// Shape (v3):
//   { v: 3,
//     topics:   { [slug]: { sectionsRead: string[], quizBest: { score, total } | null, completed: boolean } },
//     games:    { [gameId]: { bestScore: number, stars: 0-3, plays: number, usedHelp: boolean } },
//     settings: { sound: boolean },
//     lastGame: gameId | null }       (v3: the last game finished, for the "continuă" link)
// Every storage access is wrapped: if storage is blocked, progress lives in memory for this visit.
// Old or broken data never throws: it is migrated, sanitised, or dropped.

import { LESSON_SLUGS as TOPIC_SLUGS } from '../content/ro/lessons/index.ts';

const KEY = 'soft-educational:v1'; // key name kept from v1 so migration can find old data
const VERSION = 3;
const DEFAULT_SETTINGS = Object.freeze({ sound: false });
const empty = () => ({ v: VERSION, topics: {}, games: {}, settings: { ...DEFAULT_SETTINGS }, lastGame: null });
export const EMPTY_TOPIC = Object.freeze({ sectionsRead: [], quizBest: null, completed: false });
export const EMPTY_GAME = Object.freeze({ bestScore: 0, stars: 0, plays: 0, usedHelp: false });

let state = null;
let blocked = false;
const listeners = new Set();

const isObj = (v) => Boolean(v) && typeof v === 'object' && !Array.isArray(v);
const count = (v) => (Number.isFinite(v) && v >= 0 ? Math.floor(v) : 0);

function sanitizeTopic(raw) {
  if (!isObj(raw)) return { ...EMPTY_TOPIC };
  const sectionsRead = Array.isArray(raw.sectionsRead) ? raw.sectionsRead.filter((s) => typeof s === 'string') : [];
  const q = raw.quizBest;
  const quizBest =
    q && Number.isInteger(q.score) && Number.isInteger(q.total) && q.total > 0 ? { score: q.score, total: q.total } : null;
  return { sectionsRead: [...new Set(sectionsRead)], quizBest, completed: raw.completed === true };
}

function sanitizeGame(raw) {
  if (!isObj(raw)) return { ...EMPTY_GAME };
  return {
    bestScore: count(raw.bestScore),
    stars: Math.min(3, count(raw.stars)),
    plays: count(raw.plays),
    usedHelp: raw.usedHelp === true,
  };
}

// v1 (grades XI–XII) → v2: every v1 topic slug is gone from the registry, so topics drop out in
// sanitize(); the per-topic `interactive` field no longer exists. Only the sound setting survives.
const MIGRATIONS = {
  1: (raw) => ({ v: 2, topics: raw.topics, games: {}, settings: raw.settings }),
  // v2 → v3 (S1): lessons replace the topic stubs under the same slugs, so everything carries over;
  // lastGame starts empty.
  2: (raw) => ({ ...raw, v: 3, lastGame: null }),
};

function migrate(raw) {
  let data = raw;
  while (isObj(data) && data.v !== VERSION && MIGRATIONS[data.v]) data = MIGRATIONS[data.v](data);
  return data;
}

// Unknown versions or broken JSON start fresh. Unknown topic slugs are dropped.
function sanitize(input) {
  const raw = migrate(input);
  if (!isObj(raw) || raw.v !== VERSION) return empty();
  const topics = {};
  if (isObj(raw.topics))
    for (const [slug, t] of Object.entries(raw.topics)) if (TOPIC_SLUGS.includes(slug)) topics[slug] = sanitizeTopic(t);
  const games = {};
  if (isObj(raw.games)) for (const [id, g] of Object.entries(raw.games)) games[id] = sanitizeGame(g);
  // Sound is opt-in: anything but an explicit true stays muted
  const lastGame = typeof raw.lastGame === 'string' && raw.lastGame in games ? raw.lastGame : null;
  return { v: VERSION, topics, games, settings: { sound: raw.settings?.sound === true }, lastGame };
}

function load() {
  try {
    const raw = window.localStorage.getItem(KEY);
    blocked = false;
    return raw ? sanitize(JSON.parse(raw)) : empty();
  } catch {
    // Blocked storage, or JSON so broken it can't be parsed: start fresh either way
    blocked = !canUseStorage();
    return empty();
  }
}

function canUseStorage() {
  try {
    window.localStorage.getItem(KEY);
    return true;
  } catch {
    return false;
  }
}

function get() {
  if (!state) state = load();
  return state;
}

function commit(next) {
  state = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
    blocked = false;
  } catch {
    blocked = true;
  }
  listeners.forEach((l) => l());
}

function updateTopic(slug, sectionIds, change) {
  const current = get();
  const before = current.topics[slug] ?? EMPTY_TOPIC;
  const after = { ...before, ...change(before) };
  // Completion is sticky: once earned it survives later content edits
  after.completed =
    before.completed || (after.quizBest !== null && sectionIds.every((id) => after.sectionsRead.includes(id)));
  if (JSON.stringify(after) === JSON.stringify(before)) return;
  commit({ ...current, topics: { ...current.topics, [slug]: after } });
}

export const progressStore = {
  get,
  getServerSnapshot: empty,
  isBlocked: () => blocked,

  subscribe(listener) {
    listeners.add(listener);
    // Keep several open tabs in sync
    const onStorage = (e) => {
      if (e.key === KEY || e.key === null) {
        state = load();
        listener();
      }
    };
    window.addEventListener('storage', onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener('storage', onStorage);
    };
  },

  markSectionRead(slug, sectionId, sectionIds) {
    updateTopic(slug, sectionIds, (t) =>
      t.sectionsRead.includes(sectionId) ? {} : { sectionsRead: [...t.sectionsRead, sectionId] },
    );
  },

  saveQuiz(slug, score, total, sectionIds) {
    updateTopic(slug, sectionIds, (t) =>
      !t.quizBest || score > t.quizBest.score ? { quizBest: { score, total } } : {},
    );
  },

  /**
   * Records one finished game run. Best score and stars only go up; plays always counts.
   * usedHelp describes the best-starred run: an unassisted run with as many stars clears it, so
   * the "completat cu ajutor" stamp stays honest without punishing a later hint.
   */
  saveGame(gameId, { score, stars, usedHelp }) {
    const current = get();
    const before = current.games[gameId] ?? EMPTY_GAME;
    const s = Math.min(3, count(stars));
    const after = {
      bestScore: Math.max(before.bestScore, count(score)),
      stars: Math.max(before.stars, s),
      plays: before.plays + 1,
      usedHelp:
        before.plays === 0 || s > before.stars ? usedHelp === true : s === before.stars ? before.usedHelp && usedHelp === true : before.usedHelp,
    };
    commit({ ...current, games: { ...current.games, [gameId]: after }, lastGame: gameId });
  },

  setSetting(key, value) {
    const current = get();
    commit({ ...current, settings: { ...current.settings, [key]: value } });
  },

  reset() {
    try {
      window.localStorage.removeItem(KEY);
    } catch {
      // Blocked storage: clearing memory is all we can do
    }
    const settings = get().settings;
    state = { ...empty(), settings };
    if (settings.sound) commit(state);
    listeners.forEach((l) => l());
  },
};

// Exported for tests and the migration check script only
export const __test = { sanitize, KEY, VERSION };
