// "Today's mission" recommender.
//
// Each of the 9 missions gets a score that is the sum of four explainable
// terms. The highest score wins, and the dominant term becomes the reason
// shown to the user, so the nudge is never a black box.
//
//   balance   0..3   categories neglected over the last 14 days score higher
//   timeFit   0..2   short missions on weekdays, long ones on weekends
//   novelty  -2..0.5 penalise what was just done, reward what was never tried
//   momentum  0..1   easy missions after a break, harder ones on a streak

import { MISSIONS } from '../data/missions.js';
import { DAY_MS, countByType, streak } from './domain.js';

const BALANCE_WINDOW_DAYS = 14;
const REPEAT_WINDOW_DAYS = 3;
const EVENING_HOUR = 18;

const TIME_FIT = {
    weekdayDay: { easy: 2, medium: 0.5, hard: 0 },
    weekdayEvening: { easy: 1.5, medium: 2, hard: 0.5 },
    weekend: { easy: 0.5, medium: 1.5, hard: 2 },
};

export function timeContext(now) {
    const d = new Date(now);
    const day = d.getDay();
    if (day === 0 || day === 6) return 'weekend';
    return d.getHours() >= EVENING_HOUR ? 'weekdayEvening' : 'weekdayDay';
}

export function scoreMissions(entries, now, missions = MISSIONS) {
    const past = entries.filter((e) => e.ts <= now);
    const recent = past.filter((e) => now - e.ts < BALANCE_WINDOW_DAYS * DAY_MS);
    const counts = countByType(recent);
    const context = timeContext(now);
    const run = streak(past, now);

    const lastDone = new Map();
    for (const e of past) {
        if (e.ts > (lastDone.get(e.missionId) ?? -Infinity)) lastDone.set(e.missionId, e.ts);
    }

    return missions.map((mission) => {
        const balance = recent.length === 0 ? 1 : 3 * (1 - counts[mission.type] / recent.length);
        const timeFit = TIME_FIT[context][mission.level];

        const last = lastDone.get(mission.id);
        let novelty = 0;
        if (last === undefined) novelty = 0.5;
        else if (now - last < REPEAT_WINDOW_DAYS * DAY_MS) novelty = -2;

        let momentum = 0;
        if (run === 0 && mission.level === 'easy') momentum = 1;
        else if (run >= 3 && mission.level !== 'easy') momentum = 0.5;

        return {
            mission,
            score: balance + timeFit + novelty + momentum,
            parts: { balance, timeFit, novelty, momentum },
        };
    });
}

function isLeastDone(past, now, type) {
    const counts = countByType(past.filter((e) => now - e.ts < BALANCE_WINDOW_DAYS * DAY_MS));
    return counts[type] === Math.min(...Object.values(counts));
}

/**
 * Returns the best mission and a reason key:
 * 'comeback' | 'balance' | 'weekend' | 'evening' | 'quick'.
 */
export function recommend(entries, now, missions = MISSIONS) {
    const scored = scoreMissions(entries, now, missions);
    // Strict '>' keeps the catalog order as the tie-break, so the result is deterministic.
    const best = scored.reduce((top, s) => (s.score > top.score ? s : top));
    const context = timeContext(now);
    const past = entries.filter((e) => e.ts <= now);

    let reason = 'quick';
    if (past.length > 0 && streak(past, now) === 0 && best.mission.level === 'easy') {
        reason = 'comeback';
    } else if (past.length > 0 && best.parts.balance >= 2 && isLeastDone(past, now, best.mission.type)) {
        reason = 'balance';
    } else if (context === 'weekend') {
        reason = 'weekend';
    } else if (context === 'weekdayEvening') {
        reason = 'evening';
    }

    return { mission: best.mission, reason, score: best.score, parts: best.parts };
}
