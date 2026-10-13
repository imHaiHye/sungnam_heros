import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
    addDays, badgeProgress, countByType, dayKey, monthGrid, monthWeekCounts,
    monthlyTrend, startOfWeek, streak, totalPoints, weekSummary,
} from '../js/core/domain.js';
import { BADGES } from '../js/data/missions.js';

const at = (y, m, d, h = 12) => new Date(y, m - 1, d, h).getTime();
const entry = (ts, type = 'pink', points = 1000) => ({ ts, type, points, missionId: `${type}.easy` });

test('totalPoints sums the log', () => {
    assert.equal(totalPoints([]), 0);
    assert.equal(totalPoints([entry(1, 'pink', 1000), entry(2, 'green', 3000)]), 4000);
});

test('badgeProgress picks the last threshold at or below the points', () => {
    assert.equal(badgeProgress(0).current.level, 0);
    assert.equal(badgeProgress(999).current.level, 0);
    assert.equal(badgeProgress(1000).current.level, 1);
    assert.equal(badgeProgress(12000).current.level, 2);
    assert.equal(badgeProgress(99999).current.level, 4);
});

test('badgeProgress reports distance to the next badge', () => {
    const p = badgeProgress(12000);
    assert.equal(p.next.level, 3);
    assert.equal(p.remaining, 18000);
    assert.equal(p.ratio, 0.1);
});

test('badgeProgress at the top badge has no next and a full bar', () => {
    const p = badgeProgress(250000);
    assert.equal(p.current.level, BADGES.at(-1).level);
    assert.equal(p.next, null);
    assert.equal(p.ratio, 1);
    assert.equal(p.remaining, 0);
});

test('startOfWeek is Monday, including when today is Sunday', () => {
    // 2026-10-14 is a Wednesday, 2026-10-18 a Sunday.
    assert.equal(dayKey(startOfWeek(at(2026, 10, 14))), '2026-10-12');
    assert.equal(dayKey(startOfWeek(at(2026, 10, 18))), '2026-10-12');
    assert.equal(dayKey(startOfWeek(at(2026, 10, 12, 0))), '2026-10-12');
});

test('addDays crosses month and year boundaries', () => {
    assert.equal(dayKey(addDays(at(2026, 12, 31), 1)), '2027-01-01');
    assert.equal(dayKey(addDays(at(2026, 3, 1), -1)), '2026-02-28');
});

test('streak counts consecutive days ending today', () => {
    const now = at(2026, 10, 14, 20);
    const log = [entry(at(2026, 10, 14, 9)), entry(at(2026, 10, 13)), entry(at(2026, 10, 12))];
    assert.equal(streak(log, now), 3);
});

test('streak is kept alive until today ends', () => {
    const now = at(2026, 10, 14, 8);
    assert.equal(streak([entry(at(2026, 10, 13)), entry(at(2026, 10, 12))], now), 2);
});

test('streak breaks after a missed day and ignores same-day duplicates', () => {
    const now = at(2026, 10, 14);
    assert.equal(streak([entry(at(2026, 10, 12))], now), 0);
    assert.equal(streak([entry(at(2026, 10, 14, 9)), entry(at(2026, 10, 14, 10))], now), 1);
    assert.equal(streak([], now), 0);
});

test('weekSummary counts active days, not missions', () => {
    const now = at(2026, 10, 14);
    const log = [
        entry(at(2026, 10, 12)), entry(at(2026, 10, 12, 18)), // Monday twice
        entry(at(2026, 10, 14)),                              // today
        entry(at(2026, 10, 11)),                              // last week's Sunday
    ];
    const week = weekSummary(log, now);
    assert.equal(week.days.length, 7);
    assert.equal(week.activeDays, 2);
    assert.equal(week.missions, 3);
    assert.deepEqual(week.days.map((d) => d.count), [2, 0, 1, 0, 0, 0, 0]);
    assert.equal(week.days[2].isToday, true);
    assert.equal(week.days[3].isFuture, true);
});

test('countByType always returns all three types', () => {
    assert.deepEqual(countByType([]), { pink: 0, green: 0, yellow: 0 });
    assert.deepEqual(
        countByType([entry(1, 'pink'), entry(2, 'pink'), entry(3, 'yellow')]),
        { pink: 2, green: 0, yellow: 1 }
    );
});

test('monthGrid pads to the first weekday (Sunday first)', () => {
    const grid = monthGrid(2026, 9); // October 2026 starts on a Thursday
    assert.equal(grid.indexOf(1), 4);
    assert.equal(grid.at(-1), 31);
    assert.equal(monthGrid(2028, 1).at(-1), 29); // leap February
});

test('monthWeekCounts buckets days 1-7, 8-14, ...', () => {
    const log = [
        entry(at(2026, 10, 1)), entry(at(2026, 10, 7)), entry(at(2026, 10, 8)),
        entry(at(2026, 10, 31)), entry(at(2026, 9, 30)),
    ];
    assert.deepEqual(monthWeekCounts(log, 2026, 9), [2, 1, 0, 0, 1]);
    assert.equal(monthWeekCounts([], 2026, 1).length, 4); // 28-day February
});

test('monthlyTrend covers the last three months across a year boundary', () => {
    const now = at(2027, 1, 15);
    const log = [entry(at(2026, 11, 3)), entry(at(2026, 12, 25)), entry(at(2026, 12, 26)), entry(at(2027, 1, 2))];
    assert.deepEqual(monthlyTrend(log, now, 3), [
        { year: 2026, monthIndex: 10, count: 1 },
        { year: 2026, monthIndex: 11, count: 2 },
        { year: 2027, monthIndex: 0, count: 1 },
    ]);
});
