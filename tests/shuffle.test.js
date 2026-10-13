import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mulberry32, sattolo } from '../js/core/shuffle.js';

test('sattolo never leaves anyone in their own role', () => {
    for (let n = 2; n <= 8; n++) {
        const members = Array.from({ length: n }, (_, i) => i);
        for (let seed = 0; seed < 200; seed++) {
            const roles = sattolo(members, mulberry32(seed));
            assert.deepEqual([...roles].sort((a, b) => a - b), members, 'is a permutation');
            roles.forEach((role, i) => assert.notEqual(role, i, `fixed point for n=${n}, seed=${seed}`));
        }
    }
});

test('sattolo reaches every cyclic permutation of three', () => {
    const seen = new Set();
    for (let seed = 0; seed < 100; seed++) seen.add(sattolo([0, 1, 2], mulberry32(seed)).join(''));
    assert.deepEqual([...seen].sort(), ['120', '201']);
});

test('sattolo does not mutate its input and handles tiny lists', () => {
    const input = ['a', 'b', 'c'];
    sattolo(input, mulberry32(1));
    assert.deepEqual(input, ['a', 'b', 'c']);
    assert.deepEqual(sattolo([]), []);
    assert.deepEqual(sattolo(['solo']), ['solo']);
});

test('mulberry32 is reproducible and stays in [0, 1)', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    for (let i = 0; i < 1000; i++) {
        const x = a();
        assert.equal(x, b());
        assert.ok(x >= 0 && x < 1);
    }
});
