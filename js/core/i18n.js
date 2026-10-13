import ko from '../data/locales/ko.js';
import en from '../data/locales/en.js';
import vi from '../data/locales/vi.js';
import zh from '../data/locales/zh.js';

export const DICTIONARIES = { ko, en, vi, zh };
export const DEFAULT_LOCALE = 'ko';

// Labels are shown in their own language so a user can find theirs
// even when the current screen language is one they cannot read.
export const LOCALES = [
    { code: 'ko', label: '한국어', tag: 'ko-KR' },
    { code: 'en', label: 'English', tag: 'en-US' },
    { code: 'vi', label: 'Tiếng Việt', tag: 'vi-VN' },
    { code: 'zh', label: '中文', tag: 'zh-CN' },
];

let current = DEFAULT_LOCALE;

export function setLocale(code) {
    current = code in DICTIONARIES ? code : DEFAULT_LOCALE;
    return current;
}

export function getLocale() {
    return current;
}

export function localeTag() {
    return LOCALES.find((l) => l.code === current).tag;
}

/** First supported language among the browser's preferences, else Korean. */
export function detectLocale(preferred = []) {
    for (const lang of preferred) {
        const code = String(lang).toLowerCase().split('-')[0];
        if (code in DICTIONARIES) return code;
    }
    return DEFAULT_LOCALE;
}

/** Looks up `key`, falling back to Korean and then to the key itself. */
export function t(key, params) {
    const template = DICTIONARIES[current][key] ?? DICTIONARIES[DEFAULT_LOCALE][key] ?? key;
    if (!params) return template;
    return template.replace(/\{(\w+)\}/g, (match, name) => (name in params ? String(params[name]) : match));
}

export function num(n) {
    return n.toLocaleString(localeTag());
}

export function formatDate(ts, options) {
    return new Intl.DateTimeFormat(localeTag(), options).format(new Date(ts));
}

export function languageName(code) {
    try {
        return new Intl.DisplayNames([localeTag()], { type: 'language' }).of(code);
    } catch {
        return code;
    }
}

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** "5 minutes ago" in the current language. */
export function timeAgo(ts, now) {
    const rtf = new Intl.RelativeTimeFormat(localeTag(), { numeric: 'auto' });
    const diff = Math.min(ts - now, 0);
    if (-diff < HOUR) return rtf.format(Math.round(diff / MINUTE), 'minute');
    if (-diff < DAY) return rtf.format(Math.round(diff / HOUR), 'hour');
    return rtf.format(Math.round(diff / DAY), 'day');
}
