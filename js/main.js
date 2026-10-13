// App shell: owns the store, routing, the bottom sheet and every user action.
// Markup comes from ui/pages.js and ui/sheets.js; rules come from core/.

import { createStore, memoryStorage } from './core/store.js';
import { html } from './core/html.js';
import { t, num, setLocale, getLocale, detectLocale, LOCALES } from './core/i18n.js';
import { badgeProgress, totalPoints } from './core/domain.js';
import { sattolo } from './core/shuffle.js';
import { findMission, MAX_KEYWORDS } from './data/missions.js';
import { REFERRAL_CODE, sampleEntries, samplePosts } from './data/seed.js';
import { PAGES } from './ui/pages.js';
import { renderSheet, phraseList, newMemberRow, roleResults } from './ui/sheets.js';
import { compressPhoto } from './ui/photo.js';
import { check } from './ui/icons.js';

const $ = (selector, root = document) => root.querySelector(selector);

function browserStorage() {
    try {
        localStorage.setItem('heroes:probe', '1');
        localStorage.removeItem('heroes:probe');
        return localStorage;
    } catch {
        return memoryStorage(); // private mode: the app still works for this visit
    }
}

const store = createStore(browserStorage());
const today = new Date();
const ui = {
    diaryTab: 'timeline',
    progressTab: 'week',
    calYear: today.getFullYear(),
    calMonth: today.getMonth(),
    calDay: null,
};
const env = { canInstall: false };

const main = $('#main');
const sheet = $('#sheet');
const sheetTitle = $('#sheetTitle');
const sheetBody = $('#sheetBody');

let currentSheet = null;
let missionForm = null;
let installEvent = null;
let timerId = null;
let toastId = null;
let celebrateId = null;

/* ---------- Rendering ---------- */

function currentRoute() {
    const name = location.hash.slice(1);
    return name in PAGES ? name : 'home';
}

function renderPage() {
    const route = currentRoute();
    main.innerHTML = String(PAGES[route](store.get(), ui, Date.now()));
    document.querySelectorAll('.tabbar a').forEach((link) => {
        if (link.dataset.tab === route) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
    });
}

/** Everything outside <main> that depends on language or settings. */
function renderChrome() {
    const { settings } = store.get();
    document.documentElement.lang = getLocale();
    document.documentElement.dataset.font = String(settings.fontScale);
    document.title = t('app.name');
    document.querySelectorAll('[data-i18n]').forEach((el) => {
        el.textContent = t(el.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-label]').forEach((el) => {
        el.setAttribute('aria-label', t(el.dataset.i18nLabel));
    });
    $('#langLabel').textContent = LOCALES.find((l) => l.code === getLocale()).label;
}

function toast(message) {
    const el = $('#toast');
    // An open <dialog> sits in the top layer, above everything in <body>.
    (sheet.open ? sheet : document.body).append(el);
    el.textContent = message;
    el.classList.add('is-visible');
    clearTimeout(toastId);
    toastId = setTimeout(() => el.classList.remove('is-visible'), 3500);
}

function showError(message) {
    const el = $('#formError', sheet);
    el.textContent = message;
    el.hidden = false;
    el.scrollIntoView({ block: 'nearest' });
}

function celebrate(points, newBadge) {
    const el = $('#celebrate');
    el.innerHTML = String(html`
        <div class="celebrate-card">
            <div class="celebrate-icon">${check}</div>
            <strong class="celebrate-title">${t('celebrate.title')}</strong>
            <div class="celebrate-points">+${num(points)}P</div>
            <div>${t('celebrate.sub')}</div>
            ${newBadge ? html`<div class="celebrate-badge">${newBadge.icon} ${t('celebrate.badge', { title: t(`badge.${newBadge.level}`) })}</div>` : ''}
        </div>`);
    el.hidden = false;
    clearTimeout(celebrateId);
    celebrateId = setTimeout(() => { el.hidden = true; }, 2800);
}

/* ---------- Bottom sheet ---------- */

function openSheet(name) {
    const content = renderSheet(name, store.get(), Date.now(), env);
    if (!content) return;
    stopTimer();
    currentSheet = name;
    sheetTitle.textContent = content.title;
    sheetBody.innerHTML = String(content.body);
    if (!sheet.open) sheet.showModal();
    sheet.scrollTop = 0;
}

function closeSheet() {
    if (sheet.open) sheet.close();
}

function stopTimer() {
    clearInterval(timerId);
    timerId = null;
}

sheet.addEventListener('close', () => {
    stopTimer();
    window.speechSynthesis?.cancel();
    currentSheet = null;
    missionForm = null;
});

// A click on the dialog element itself (not its content) is a click on the backdrop.
sheet.addEventListener('click', (event) => {
    if (event.target === sheet) closeSheet();
});

/** Marks `el` as the only pressed button among its siblings. */
function pressOnly(el) {
    for (const sibling of el.parentElement.children) {
        sibling.setAttribute('aria-pressed', sibling === el ? 'true' : 'false');
    }
}

/* ---------- Mission flow ---------- */

function keywordMessage(keys) {
    if (keys.length === 0) return t('m.keywords.empty');
    const [first, ...rest] = keys.map((key) => t(`kw.${key}`));
    // The first phrase opens the sentence in the two- and three-word templates.
    const a = keys.length > 1 ? first.charAt(0).toLocaleUpperCase() + first.slice(1) : first;
    return t(`msg.${keys.length}`, { a, b: rest[0], c: rest[1] });
}

function newId() {
    return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function completeMission() {
    const familyResponse = $('#familyResponse').value.trim();
    const myResponse = $('#myResponse').value.trim();
    if ((!missionForm.reaction && !familyResponse) || (!missionForm.reply && !myResponse)) {
        showError(t('m.need'));
        return;
    }

    const mission = findMission(missionForm.missionId);
    const before = badgeProgress(totalPoints(store.get().entries)).current;
    const entry = {
        id: newId(),
        missionId: mission.id,
        type: mission.type,
        level: mission.level,
        points: mission.points,
        ts: Date.now(),
        photo: missionForm.photo,
        keywordMessage: missionForm.keywords.length > 0 ? keywordMessage(missionForm.keywords) : '',
        reaction: missionForm.reaction,
        familyResponse,
        reply: missionForm.reply,
        myResponse,
        sample: false,
    };

    let saved = store.update((draft) => { draft.entries.push(entry); });
    if (!saved && entry.photo) {
        // Most likely the photo pushed us over the storage quota: keep the record, drop the photo.
        saved = store.update((draft) => {
            draft.entries.find((e) => e.id === entry.id).photo = null;
        });
        if (saved) toast(t('toast.photoDropped'));
    }
    if (!saved) toast(t('toast.saveFailed'));

    const after = badgeProgress(totalPoints(store.get().entries)).current;
    closeSheet();
    celebrate(mission.points, after.level > before.level ? after : null);
}

/* ---------- Actions (click) ---------- */

const actions = {
    'open-sheet': (el) => openSheet(el.dataset.sheet),
    'close-sheet': () => closeSheet(),
    'dismiss-celebrate': (el) => { el.hidden = true; },

    'open-mission'(el) {
        openSheet(`mission-${el.dataset.id}`);
        missionForm = { missionId: el.dataset.id, keywords: [], reaction: null, reply: null, photo: null };
    },

    pick(el) {
        const { group, value } = el.dataset;
        const wasPressed = el.getAttribute('aria-pressed') === 'true';
        pressOnly(el);
        if (wasPressed) el.setAttribute('aria-pressed', 'false');
        missionForm[group] = wasPressed ? null : value;
    },

    'toggle-keyword'(el) {
        const key = el.dataset.value;
        const selected = missionForm.keywords;
        if (selected.includes(key)) {
            missionForm.keywords = selected.filter((k) => k !== key);
        } else if (selected.length < MAX_KEYWORDS) {
            selected.push(key);
        } else {
            return;
        }
        el.setAttribute('aria-pressed', missionForm.keywords.includes(key) ? 'true' : 'false');
        $('#keywordMessage').textContent = keywordMessage(missionForm.keywords);
    },

    'complete-mission': () => completeMission(),

    'set-tab'(el) {
        ui[el.dataset.group] = el.dataset.value;
        renderPage();
    },

    'cal-move'(el) {
        const moved = new Date(ui.calYear, ui.calMonth + Number(el.dataset.delta), 1);
        ui.calYear = moved.getFullYear();
        ui.calMonth = moved.getMonth();
        ui.calDay = null;
        renderPage();
    },

    'cal-pick'(el) {
        ui.calDay = Number(el.dataset.day);
        renderPage();
    },

    'toggle-like'(el) {
        const { id } = el.dataset;
        store.update((draft) => {
            draft.liked = draft.liked.includes(id) ? draft.liked.filter((x) => x !== id) : [...draft.liked, id];
        });
    },

    'apply-notice'(el) {
        const { id } = el.dataset;
        store.update((draft) => {
            if (!draft.applied.includes(id)) draft.applied.push(id);
        });
        openSheet(`notice-${id}`);
        toast(t('n.applyDone'));
    },

    'submit-post'() {
        const title = $('#postTitle').value.trim();
        const text = $('#postContent').value.trim();
        if (!title || !text) {
            showError(t('post.need'));
            return;
        }
        const saved = store.update((draft) => {
            draft.posts.push({
                id: newId(), author: draft.profile.name, badgeLevel: 0, title, text,
                image: null, ts: Date.now(), likes: 0, comments: 0, mine: true,
            });
        });
        closeSheet();
        toast(t(saved ? 'post.done' : 'toast.saveFailed'));
    },

    'quiz-submit'() {
        const done = $('#quizDone');
        done.hidden = false;
        done.scrollIntoView({ block: 'nearest' });
    },

    'add-member'() {
        $('#members').insertAdjacentHTML('beforeend', String(newMemberRow()));
        $('#members .member:last-child input').focus();
    },

    'remove-member': (el) => el.closest('.member').remove(),

    'shuffle-roles'() {
        const members = [...document.querySelectorAll('#members input')]
            .map((input) => input.value.trim())
            .filter(Boolean);
        if (members.length < 2) {
            showError(t('role.min'));
            return;
        }
        $('#formError', sheet).hidden = true;
        const results = $('#roleResults');
        results.innerHTML = String(roleResults(members, sattolo(members)));
        results.scrollIntoView({ block: 'nearest' });
    },

    'start-timer'(el) {
        const display = $('#timer');
        const done = $('#timerDone');
        // Count down to a fixed end time; counting ticks would drift when the tab is throttled.
        const endAt = Date.now() + 3 * 60 * 1000;
        done.hidden = true;
        stopTimer();
        const tick = () => {
            const left = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
            display.textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
            if (left === 0) {
                stopTimer();
                done.hidden = false;
            }
        };
        tick();
        timerId = setInterval(tick, 250);
        el.textContent = t('empathy.restart');
    },

    speak(el) {
        if (!('speechSynthesis' in window)) {
            toast(t('m.phrases.noVoice'));
            return;
        }
        const utterance = new SpeechSynthesisUtterance(el.dataset.text);
        utterance.lang = el.dataset.lang;
        utterance.rate = 0.85;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
    },

    async 'copy-code'() {
        try {
            await navigator.clipboard.writeText(REFERRAL_CODE);
            toast(t('invite.copied'));
        } catch {
            toast(t('invite.copyFail'));
        }
    },

    async 'share-invite'() {
        const text = t('invite.shareText', { code: REFERRAL_CODE });
        try {
            if (navigator.share) await navigator.share({ title: t('app.name'), text });
            else {
                await navigator.clipboard.writeText(text);
                toast(t('invite.copied'));
            }
        } catch (error) {
            if (error.name !== 'AbortError') toast(t('invite.copyFail')); // AbortError = user closed the share sheet
        }
    },

    async 'install-app'() {
        if (!installEvent) return;
        installEvent.prompt();
        await installEvent.userChoice;
        installEvent = null;
        env.canInstall = false;
        closeSheet();
    },

    'set-locale'(el) {
        const code = setLocale(el.dataset.value);
        store.update((draft) => { draft.settings.locale = code; });
        renderChrome();
        if (el.dataset.keepOpen) openSheet(currentSheet);
        else closeSheet();
    },

    'set-font'(el) {
        pressOnly(el);
        store.update((draft) => { draft.settings.fontScale = Number(el.dataset.value); });
        renderChrome();
    },

    'reset-sample'() {
        if (!confirm(t('settings.clear.confirm'))) return;
        seed();
        closeSheet();
    },

    'clear-data'() {
        if (!confirm(t('settings.clear.confirm'))) return;
        store.update((draft) => {
            draft.entries = [];
            draft.posts = [];
            draft.liked = [];
            draft.applied = [];
        });
        closeSheet();
    },
};

document.addEventListener('click', (event) => {
    const el = event.target.closest('[data-action]');
    if (el && !el.disabled) actions[el.dataset.action]?.(el, event);
});

/* ---------- Changes (inputs) ---------- */

const changes = {
    async photo(input) {
        const file = input.files[0];
        if (!file || !missionForm) return;
        try {
            const dataUrl = await compressPhoto(file);
            if (!missionForm) return; // sheet was closed while the photo was loading
            missionForm.photo = dataUrl;
            const preview = $('#photoPreview');
            preview.src = dataUrl;
            preview.hidden = false;
            $('#photoHint').hidden = true;
        } catch {
            toast(t('toast.photoFailed'));
        }
    },

    'wife-lang'(select) {
        store.update((draft) => { draft.profile.wifeLang = select.value; });
        const list = $('#phraseList');
        if (list) list.innerHTML = String(phraseList(select.value));
    },

    'profile-name'(input) {
        const name = input.value.trim();
        if (name) store.update((draft) => { draft.profile.name = name; });
    },
};

document.addEventListener('change', (event) => {
    const el = event.target.closest('[data-change]');
    if (el) changes[el.dataset.change]?.(el);
});

/* ---------- Boot ---------- */

function seed() {
    const now = Date.now();
    store.update((draft) => {
        draft.entries = sampleEntries(now);
        draft.posts = samplePosts(now);
        draft.liked = [];
        draft.applied = [];
        draft.seeded = true;
    });
}

window.addEventListener('hashchange', () => {
    renderPage();
    window.scrollTo(0, 0);
});

window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    installEvent = event;
    env.canInstall = true;
});

window.addEventListener('appinstalled', () => toast(t('install.done')));

if (!store.get().seeded) seed();
setLocale(store.get().settings.locale ?? detectLocale(navigator.languages));
store.subscribe(renderPage);
renderChrome();
renderPage();

if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    navigator.serviceWorker.register('sw.js').catch(() => {
        // Offline support is an enhancement; the app works without it.
    });
}
