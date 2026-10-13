import { test } from 'node:test';
import assert from 'node:assert/strict';
import { recommend, scoreMissions, timeContext } from '../js/core/recommend.js';
import { MISSIONS } from '../js/data/missions.js';

const at = (y, m, d, h = 12) => new Date(y, m - 1, d, h).getTime();
const done = (missionId, ts) => {
    const [type, level] = missionId.split('.');
    return { missionId, type, level, ts, points: 1000 };
};

// 2026-10-14 is a Wednesday, 2026-10-17 a Saturday.
const WEEKDAY_NOON = at(2026, 10, 14, 12);
const WEEKDAY_EVENING = at(2026, 10, 14, 19);
const SATURDAY = at(2026, 10, 17, 10);

test('timeContext', () => {
    assert.equal(timeContext(WEEKDAY_NOON), 'weekdayDay');
    assert.equal(timeContext(WEEKDAY_EVENING), 'weekdayEvening');
    assert.equal(timeContext(SATURDAY), 'weekend');
});

test('scores every mission exactly once', () => {
    const scored = scoreMissions([], WEEKDAY_NOON);
    assert.deepEqual(scored.map((s) => s.mission.id), MISSIONS.map((m) => m.id));
});

test('a new user on a busy weekday gets a one-minute mission', () => {
    const rec = recommend([], WEEKDAY_NOON);
    assert.equal(rec.mission.level, 'easy');
    assert.equal(rec.reason, 'quick');
});

test('a new user on the weekend gets a longer mission', () => {
    const rec = recommend([], SATURDAY);
    assert.notEqual(rec.mission.level, 'easy');
    assert.equal(rec.reason, 'weekend');
});

test('the neglected category wins', () => {
    const log = [
        done('pink.easy', at(2026, 10, 13)), done('pink.medium', at(2026, 10, 12)),
        done('green.easy', at(2026, 10, 11)), done('green.medium', at(2026, 10, 10)),
    ];
    const rec = recommend(log, WEEKDAY_EVENING);
    assert.equal(rec.mission.type, 'yellow');
    assert.equal(rec.reason, 'balance');
});

test('a mission done in the last three days is not recommended again', () => {
    const first = recommend([], WEEKDAY_NOON).mission.id;
    const rec = recommend([done(first, at(2026, 10, 14, 9))], WEEKDAY_NOON);
    assert.notEqual(rec.mission.id, first);
});

test('after a break the user is eased back in', () => {
    const rec = recommend([done('green.hard', at(2026, 10, 1))], WEEKDAY_NOON);
    assert.equal(rec.mission.level, 'easy');
    assert.equal(rec.reason, 'comeback');
});

test('entries dated in the future are ignored', () => {
    const future = [done('pink.easy', at(2026, 12, 1))];
    assert.deepEqual(recommend(future, WEEKDAY_NOON).mission, recommend([], WEEKDAY_NOON).mission);
});

test('the result is deterministic', () => {
    const log = [done('yellow.easy', at(2026, 10, 13))];
    assert.deepEqual(recommend(log, SATURDAY), recommend(log, SATURDAY));
});
