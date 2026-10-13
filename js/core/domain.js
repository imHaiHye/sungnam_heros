// Pure functions over the mission log. Everything the UI shows (points, badge,
// streak, weekly and monthly progress) is derived from `entries`, so there is
// no counter that can drift out of sync with the log.

import { BADGES, MISSION_TYPES } from '../data/missions.js';

export const DAY_MS = 24 * 60 * 60 * 1000;

const pad = (n) => String(n).padStart(2, '0');

/** Local-time calendar day as 'YYYY-MM-DD'. */
export function dayKey(ts) {
    const d = new Date(ts);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function startOfDay(ts) {
    const d = new Date(ts);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
}

/** Calendar-day arithmetic (not ts + n * DAY_MS, which breaks across DST). */
export function addDays(ts, n) {
    const d = new Date(ts);
    d.setDate(d.getDate() + n);
    return d.getTime();
}

/** Monday 00:00 of the week containing `ts`. */
export function startOfWeek(ts) {
    const d = new Date(startOfDay(ts));
    const sinceMonday = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - sinceMonday);
    return d.getTime();
}

export function totalPoints(entries) {
    return entries.reduce((sum, e) => sum + e.points, 0);
}

/**
 * Current badge = last threshold <= points (binary search, upper bound - 1).
 * `ratio` is progress from the current threshold to the next, in [0, 1].
 */
export function badgeProgress(points, badges = BADGES) {
    let lo = 0;
    let hi = badges.length;
    while (lo < hi) {
        const mid = (lo + hi) >>> 1;
        if (badges[mid].points <= points) lo = mid + 1;
        else hi = mid;
    }
    const current = badges[Math.max(lo - 1, 0)];
    const next = badges[lo] ?? null;
    if (!next) return { current, next: null, ratio: 1, remaining: 0 };
    const span = next.points - current.points;
    return {
        current,
        next,
        ratio: Math.min(Math.max((points - current.points) / span, 0), 1),
        remaining: next.points - points,
    };
}

/** Map of dayKey -> entries completed that day. */
export function groupByDay(entries) {
    const byDay = new Map();
    for (const e of entries) {
        const key = dayKey(e.ts);
        if (!byDay.has(key)) byDay.set(key, []);
        byDay.get(key).push(e);
    }
    return byDay;
}

export function countOnDay(entries, ts) {
    const key = dayKey(ts);
    return entries.filter((e) => dayKey(e.ts) === key).length;
}

export function countByType(entries) {
    const counts = Object.fromEntries(MISSION_TYPES.map((type) => [type, 0]));
    for (const e of entries) {
        if (e.type in counts) counts[e.type] += 1;
    }
    return counts;
}

/**
 * Consecutive days with at least one mission, ending today. A day that has not
 * been completed *yet* does not break the streak, so we start from yesterday
 * when today is still empty.
 */
export function streak(entries, now) {
    const days = new Set(entries.map((e) => dayKey(e.ts)));
    let cursor = startOfDay(now);
    if (!days.has(dayKey(cursor))) cursor = addDays(cursor, -1);
    let run = 0;
    while (days.has(dayKey(cursor))) {
        run += 1;
        cursor = addDays(cursor, -1);
    }
    return run;
}

/** Monday-to-Sunday view of the week containing `now`. */
export function weekSummary(entries, now) {
    const byDay = groupByDay(entries);
    const monday = startOfWeek(now);
    const todayKey = dayKey(now);
    const days = Array.from({ length: 7 }, (_, i) => {
        const ts = addDays(monday, i);
        const key = dayKey(ts);
        return {
            ts,
            key,
            count: byDay.get(key)?.length ?? 0,
            isToday: key === todayKey,
            isFuture: ts > now,
        };
    });
    return {
        days,
        activeDays: days.filter((d) => d.count > 0).length,
        missions: days.reduce((sum, d) => sum + d.count, 0),
    };
}

/** Sunday-first calendar cells for a month: leading nulls, then 1..N. */
export function monthGrid(year, monthIndex) {
    const leading = new Date(year, monthIndex, 1).getDay();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    return [
        ...Array.from({ length: leading }, () => null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];
}

/** Missions per week of the month (days 1-7, 8-14, ...). */
export function monthWeekCounts(entries, year, monthIndex) {
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const buckets = Array.from({ length: Math.ceil(daysInMonth / 7) }, () => 0);
    for (const e of entries) {
        const d = new Date(e.ts);
        if (d.getFullYear() === year && d.getMonth() === monthIndex) {
            buckets[Math.floor((d.getDate() - 1) / 7)] += 1;
        }
    }
    return buckets;
}

/** Mission counts for the last `months` calendar months, oldest first. */
export function monthlyTrend(entries, now, months = 3) {
    const base = new Date(now);
    return Array.from({ length: months }, (_, i) => {
        const d = new Date(base.getFullYear(), base.getMonth() - (months - 1 - i), 1);
        const year = d.getFullYear();
        const monthIndex = d.getMonth();
        const count = entries.filter((e) => {
            const ed = new Date(e.ts);
            return ed.getFullYear() === year && ed.getMonth() === monthIndex;
        }).length;
        return { year, monthIndex, count };
    });
}
