// Tiny string lookup. To add a language: create src/content/<lang>/ui.js with the same keys
// and register it below; components never change.
import ro from '../content/ro/ui.js';

const languages = { ro };
const active = { ...languages.ro };

/** Reads a dot-path key ("nav.items.about") and fills {placeholders} from `vars`. */
export function lookup(dict, key, vars) {
  const value = key.split('.').reduce((node, part) => (node == null ? node : node[part]), dict);
  if (value == null) {
    if (import.meta.env?.DEV) console.warn(`[i18n] missing key: ${key}`);
    return key;
  }
  if (typeof value !== 'string' || !vars) return value;
  return value.replace(/\{(\w+)\}/g, (m, name) => (name in vars ? String(vars[name]) : m));
}

export const t = (key, vars) => lookup(active, key, vars);

/** Adds a namespace of strings at runtime (used by dev-only pages so their text never ships). */
export function addStrings(namespace, strings) {
  active[namespace] = strings;
}

export const locale = active.locale;
export const lang = active.lang;

const pluralRules = new Intl.PluralRules(locale);

/**
 * Plural-aware lookup. The key must hold { one, few, other } (Romanian: 1 termen,
 * 2 termeni, 20 de termeni). `n` is also passed as {n}.
 */
export const tp = (key, n, vars = {}) => t(`${key}.${pluralRules.select(n)}`, { n, ...vars });

/** Locale-aware numbers: decimal comma, dot thousands, percent spacing. */
export const formatNumber = (n, options) => new Intl.NumberFormat(locale, options).format(n);

/** Wraps text in the locale's quotation marks („…” for Romanian). */
export const quote = (text) => `${active.quotes[0]}${text}${active.quotes[1]}`;

