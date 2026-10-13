// Single source of truth for app state, persisted to localStorage.
// Views never mutate state directly: they call store.update(draft => ...),
// which saves and then notifies subscribers so the screen re-renders.

export const STORAGE_KEY = 'heroes:state';
export const SCHEMA_VERSION = 1;

export function defaultState() {
    return {
        v: SCHEMA_VERSION,
        profile: { name: '임혜령', wifeLang: 'vi' },
        settings: { locale: null, fontScale: 1 },
        entries: [],
        posts: [],
        liked: [],
        applied: [],
        seeded: false,
    };
}

/**
 * Turn whatever was in storage into a valid current-version state. Unknown or
 * corrupt data falls back to defaults instead of crashing the app on load.
 */
export function migrate(raw) {
    const base = defaultState();
    if (!raw || typeof raw !== 'object' || raw.v !== SCHEMA_VERSION) return base;
    return {
        ...base,
        ...raw,
        profile: { ...base.profile, ...raw.profile },
        settings: { ...base.settings, ...raw.settings },
        entries: Array.isArray(raw.entries) ? raw.entries : [],
        posts: Array.isArray(raw.posts) ? raw.posts : [],
        liked: Array.isArray(raw.liked) ? raw.liked : [],
        applied: Array.isArray(raw.applied) ? raw.applied : [],
    };
}

function load(storage) {
    try {
        return migrate(JSON.parse(storage.getItem(STORAGE_KEY)));
    } catch {
        return defaultState();
    }
}

export function createStore(storage) {
    let state = load(storage);
    const subscribers = new Set();

    function save() {
        try {
            storage.setItem(STORAGE_KEY, JSON.stringify(state));
            return true;
        } catch {
            return false; // quota exceeded or storage blocked
        }
    }

    return {
        get: () => state,

        /** Returns false when the change could not be persisted. */
        update(mutate) {
            const draft = JSON.parse(JSON.stringify(state));
            mutate(draft);
            state = draft;
            const saved = save();
            subscribers.forEach((fn) => fn(state));
            return saved;
        },

        subscribe(fn) {
            subscribers.add(fn);
            return () => subscribers.delete(fn);
        },
    };
}

/** In-memory stand-in for when localStorage is unavailable (private mode, tests). */
export function memoryStorage() {
    const data = new Map();
    return {
        getItem: (key) => (data.has(key) ? data.get(key) : null),
        setItem: (key, value) => void data.set(key, String(value)),
        removeItem: (key) => void data.delete(key),
    };
}
