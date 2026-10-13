// Guards the data files: a missing translation or a typo in an id would
// otherwise only show up as a raw key on someone's phone.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { DICTIONARIES, LOCALES, detectLocale, setLocale, t } from '../js/core/i18n.js';
import { BADGES, KEYWORDS, MISSIONS, REACTIONS, REPLIES } from '../js/data/missions.js';
import { PHRASE_KEYS, WIFE_LANGUAGES } from '../js/data/phrases.js';
import { NOTICES, sampleEntries, samplePosts } from '../js/data/seed.js';
import { totalPoints, streak } from '../js/core/domain.js';

const root = new URL('..', import.meta.url);
const koKeys = Object.keys(DICTIONARIES.ko).sort();
const placeholders = (s) => (s.match(/\{\w+\}/g) ?? []).sort();

for (const { code } of LOCALES) {
    test(`locale "${code}" has exactly the Korean keys`, () => {
        assert.deepEqual(Object.keys(DICTIONARIES[code]).sort(), koKeys);
    });

    test(`locale "${code}" keeps every {placeholder}`, () => {
        for (const key of koKeys) {
            assert.deepEqual(placeholders(DICTIONARIES[code][key]), placeholders(DICTIONARIES.ko[key]), key);
        }
    });
}

test('every catalog item has its text', () => {
    const needed = [
        ...MISSIONS.flatMap((m) => [`mission.${m.id}.title`, `mission.${m.id}.desc`]),
        ...BADGES.map((b) => `badge.${b.level}`),
        ...KEYWORDS.map((k) => `kw.${k}`),
        ...REACTIONS.map((r) => `reaction.${r.key}`),
        ...REPLIES.map((r) => `reply.${r.key}`),
        ...PHRASE_KEYS.map((k) => `phrase.${k}`),
        ...NOTICES.flatMap((n) => [
            `notice.${n.id}.title`, `notice.${n.id}.sub`, `notice.${n.id}.desc`,
            ...n.rows.flatMap((row) => [`n.${row}`, `notice.${n.id}.${row}`]),
        ]),
    ];
    for (const key of needed) assert.ok(key in DICTIONARIES.ko, `missing ${key}`);
});

test('every key used in the UI code exists', () => {
    const source = ['js/main.js', 'js/ui/pages.js', 'js/ui/sheets.js', 'index.html']
        .map((file) => readFileSync(new URL(file, root), 'utf8'))
        .join('\n');
    const used = [
        ...source.matchAll(/\bt\('([\w.]+)'/g),
        ...source.matchAll(/data-i18n(?:-label)?="([\w.]+)"/g),
    ];
    assert.ok(used.length > 50);
    for (const [, key] of used) assert.ok(key in DICTIONARIES.ko, `missing ${key}`);
});

test('t() interpolates and falls back', () => {
    setLocale('en');
    assert.equal(t('home.hello', { name: 'Minsu' }), 'Hello, Minsu');
    assert.equal(t('no.such.key'), 'no.such.key');
    assert.equal(setLocale('xx'), 'ko');
    assert.equal(t('nav.home'), '홈');
});

test('detectLocale picks the first supported language', () => {
    assert.equal(detectLocale(['fr-FR', 'vi-VN', 'en']), 'vi');
    assert.equal(detectLocale(['zh-TW']), 'zh');
    assert.equal(detectLocale(['fr']), 'ko');
    assert.equal(detectLocale(), 'ko');
});

test('badges are sorted and every wife language has every phrase', () => {
    for (let i = 1; i < BADGES.length; i++) assert.ok(BADGES[i].points > BADGES[i - 1].points);
    for (const lang of WIFE_LANGUAGES) {
        for (const key of PHRASE_KEYS) {
            assert.ok(lang.phrases[key].text && lang.phrases[key].hangul, `${lang.code}.${key}`);
        }
    }
});

test('sample data is valid and lies in the past', () => {
    const now = new Date(2026, 9, 14, 12).getTime();
    const entries = sampleEntries(now);
    const ids = new Set(MISSIONS.map((m) => m.id));
    for (const e of entries) {
        assert.ok(ids.has(e.missionId));
        assert.ok(e.ts < now);
        assert.ok(e.reaction || e.familyResponse);
        if (e.photo) assert.ok(existsSync(new URL(e.photo, root)), e.photo);
    }
    assert.equal(totalPoints(entries), 12000);
    assert.equal(streak(entries, now), 3);
    for (const p of samplePosts(now)) {
        assert.ok(p.ts < now);
        assert.ok(existsSync(new URL(p.image, root)), p.image);
    }
});

test('the service worker precaches only files that exist', () => {
    const sw = readFileSync(new URL('sw.js', root), 'utf8');
    const list = sw.slice(sw.indexOf('PRECACHE = ['), sw.indexOf('];'));
    const files = [...list.matchAll(/'([^']+)'/g)].map((m) => m[1]).filter((f) => f !== './');
    assert.ok(files.length > 10);
    for (const file of files) assert.ok(existsSync(new URL(file, root)), file);
});
