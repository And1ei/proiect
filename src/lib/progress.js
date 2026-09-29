// Reading progress, kept only in this browser. No accounts, no network, no cookies.
// Shape: { v: 1, topics: { [slug]: { sectionsRead: string[], quizBest: { score, total } | null, completed: boolean,
//          interactive: { completed: true, assisted: boolean } | null } }, settings: { sound: boolean } }
// Every storage access is wrapped: if storage is blocked, progress lives in memory for this visit.

const KEY = 'soft-educational:v1';
const VERSION = 1;
const DEFAULT_SETTINGS = Object.freeze({ sound: false });
const empty = () => ({ v: VERSION, topics: {}, settings: { ...DEFAULT_SETTINGS } });
export const EMPTY_TOPIC = Object.freeze({ sectionsRead: [], quizBest: null, completed: false, interactive: null });

let state = null;
let blocked = false;
const listeners = new Set();

function sanitizeTopic(raw) {
  if (!raw || typeof raw !== 'object') return { ...EMPTY_TOPIC };
  const sectionsRead = Array.isArray(raw.sectionsRead) ? raw.sectionsRead.filter((s) => typeof s === 'string') : [];
  const q = raw.quizBest;
  const quizBest =
    q && Number.isInteger(q.score) && Number.isInteger(q.total) && q.total > 0 ? { score: q.score, total: q.total } : null;
  const i = raw.interactive;
  const interactive = i && i.completed === true ? { completed: true, assisted: i.assisted === true } : null;
  return { sectionsRead: [...new Set(sectionsRead)], quizBest, completed: raw.completed === true, interactive };
}

// Unknown versions or broken JSON start fresh; add migrations here when VERSION changes
function sanitize(raw) {
  if (!raw || typeof raw !== 'object' || raw.v !== VERSION || !raw.topics || typeof raw.topics !== 'object') return empty();
  const topics = {};
  for (const [slug, t] of Object.entries(raw.topics)) topics[slug] = sanitizeTopic(t);
  // Sound is opt-in: anything but an explicit true stays muted
  return { v: VERSION, topics, settings: { sound: raw.settings?.sound === true } };
}

function load() {
  try {
    const raw = window.localStorage.getItem(KEY);
    blocked = false;
    return raw ? sanitize(JSON.parse(raw)) : empty();
  } catch {
    blocked = true;
    return empty();
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

  // Best result wins: once completed without hints, a later assisted run doesn't downgrade it
  saveInteractive(slug, assisted, sectionIds) {
    updateTopic(slug, sectionIds, (t) =>
      t.interactive && !t.interactive.assisted ? {} : { interactive: { completed: true, assisted: t.interactive ? t.interactive.assisted && assisted : assisted } },
    );
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
