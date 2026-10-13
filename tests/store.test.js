import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
    STORAGE_KEY, SCHEMA_VERSION, createStore, defaultState, memoryStorage, migrate,
} from '../js/core/store.js';

test('a fresh store starts from defaults', () => {
    const store = createStore(memoryStorage());
    assert.deepEqual(store.get(), defaultState());
});

test('update persists and a new store reads it back', () => {
    const storage = memoryStorage();
    const store = createStore(storage);
    assert.equal(store.update((d) => { d.profile.name = '민수'; }), true);
    assert.equal(createStore(storage).get().profile.name, '민수');
});

test('update replaces state instead of mutating it', () => {
    const store = createStore(memoryStorage());
    const before = store.get();
    store.update((d) => { d.entries.push({ id: 'a' }); });
    assert.equal(before.entries.length, 0);
    assert.equal(store.get().entries.length, 1);
});

test('subscribers are notified and can unsubscribe', () => {
    const store = createStore(memoryStorage());
    let calls = 0;
    const unsubscribe = store.subscribe(() => { calls += 1; });
    store.update(() => {});
    unsubscribe();
    store.update(() => {});
    assert.equal(calls, 1);
});

test('update reports a failed save but keeps the change in memory', () => {
    const full = {
        getItem: () => null,
        setItem: () => { throw new Error('QuotaExceededError'); },
    };
    const store = createStore(full);
    assert.equal(store.update((d) => { d.liked.push('x'); }), false);
    assert.deepEqual(store.get().liked, ['x']);
});

test('corrupt or foreign data falls back to defaults', () => {
    const storage = memoryStorage();
    storage.setItem(STORAGE_KEY, '{not json');
    assert.deepEqual(createStore(storage).get(), defaultState());
    assert.deepEqual(migrate(null), defaultState());
    assert.deepEqual(migrate({ v: 999, entries: [1] }), defaultState());
    assert.deepEqual(migrate('text'), defaultState());
});

test('migrate fills in fields missing from older saves', () => {
    const state = migrate({ v: SCHEMA_VERSION, profile: { name: '철수' }, entries: 'oops' });
    assert.equal(state.profile.name, '철수');
    assert.equal(state.profile.wifeLang, 'vi');
    assert.equal(state.settings.fontScale, 1);
    assert.deepEqual(state.entries, []);
});
