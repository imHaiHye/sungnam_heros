// The five tab pages. Each is a pure function of (state, ui, now) that returns
// markup; main.js decides when to call them.

import { html } from '../core/html.js';
import { t, num, formatDate, timeAgo } from '../core/i18n.js';
import {
    addDays, badgeProgress, countByType, countOnDay, dayKey, groupByDay, monthGrid,
    monthWeekCounts, monthlyTrend, startOfWeek, streak, totalPoints, weekSummary,
} from '../core/domain.js';
import { recommend } from '../core/recommend.js';
import { BADGES, MISSIONS, MISSION_TYPES, REACTIONS, REPLIES, TYPE_EMOJI } from '../data/missions.js';
import { NOTICES } from '../data/seed.js';

const missionTitle = (id) => t(`mission.${id}.title`);
const missionDesc = (id) => t(`mission.${id}.desc`);

function missionChips(mission) {
    return html`
        <span class="chips">
            <span class="chip">⏱ ${t(`time.${mission.level}`)}</span>
            <span class="chip chip-points">+${num(mission.points)}P</span>
        </span>`;
}

function meter(ratio, label) {
    const percent = Math.round(ratio * 100);
    return html`
        <div class="meter" role="progressbar" aria-label="${label}"
            aria-valuemin="0" aria-valuemax="100" aria-valuenow="${percent}">
            <span style="width: ${percent}%"></span>
        </div>`;
}

/* ---------- Home ---------- */

export function homePage(state, ui, now) {
    const points = totalPoints(state.entries);
    const badge = badgeProgress(points);
    const rec = recommend(state.entries, now);
    const badgeLine = badge.next
        ? t('home.badgeNext', { title: t(`badge.${badge.next.level}`), n: num(badge.remaining) })
        : t('home.badgeMax');

    return html`
        <section class="card hero">
            <h1 class="hello">${t('home.hello', { name: state.profile.name })}</h1>
            <div class="hero-row">
                <div>
                    <div class="points">${num(points)}<small>P</small></div>
                    <div class="muted">${t('home.voucher')}</div>
                </div>
                <button class="badge-chip" data-action="open-sheet" data-sheet="badges"
                    aria-label="${t('home.badges')}">
                    <span class="badge-icon" aria-hidden="true">${badge.current.icon}</span>
                    <span>${t(`badge.${badge.current.level}`)}</span>
                    <span aria-hidden="true">›</span>
                </button>
            </div>
            ${meter(badge.ratio, badgeLine)}
            <p class="muted small">${badgeLine}</p>
        </section>

        <section class="card rec type-${rec.mission.type}">
            <p class="eyebrow">⭐ ${t('home.recommend')}</p>
            <h2 class="rec-title">
                <span aria-hidden="true">${TYPE_EMOJI[rec.mission.type]}</span>
                ${missionTitle(rec.mission.id)}
            </h2>
            <p>${missionDesc(rec.mission.id)}</p>
            <p class="reason">💡 ${t(`reason.${rec.reason}`, { who: t(`who.${rec.mission.type}`) })}</p>
            ${missionChips(rec.mission)}
            <button class="btn btn-primary btn-lg" data-action="open-mission" data-id="${rec.mission.id}">
                ${t('home.start')}
            </button>
        </section>

        <div class="stat-row">
            <div class="stat">
                <span class="stat-icon" aria-hidden="true">✅</span>
                <span class="stat-value">${t('home.todayCount', { n: countOnDay(state.entries, now) })}</span>
                <span class="stat-label">${t('home.today')}</span>
            </div>
            <div class="stat">
                <span class="stat-icon" aria-hidden="true">🔥</span>
                <span class="stat-value">${t('home.streakDays', { n: streak(state.entries, now) })}</span>
                <span class="stat-label">${t('home.streak')}</span>
            </div>
        </div>

        <h2 class="section-title">${t('home.all')}</h2>
        ${MISSION_TYPES.map((type) => html`
            <section class="card group type-${type}">
                <h3 class="group-title">
                    <span aria-hidden="true">${TYPE_EMOJI[type]}</span>
                    ${t(`type.${type}`)}
                    <span class="tag">${t(`type.${type}.color`)}</span>
                </h3>
                <ul class="list">
                    ${MISSIONS.filter((m) => m.type === type).map((m) => html`
                        <li>
                            <button class="row" data-action="open-mission" data-id="${m.id}">
                                <span class="row-main">
                                    <strong>${missionTitle(m.id)}</strong>
                                    <span class="muted">${missionDesc(m.id)}</span>
                                    ${missionChips(m)}
                                </span>
                                <span class="row-arrow" aria-hidden="true">›</span>
                            </button>
                        </li>`)}
                </ul>
            </section>`)}

        <h2 class="section-title">${t('home.more')}</h2>
        <div class="card">
            <ul class="list">
                ${[['invite', '🎁'], ['nudge', '🔔'], ['install', '📱']].map(([name, icon]) => html`
                    <li>
                        <button class="row" data-action="open-sheet" data-sheet="${name}">
                            <span class="row-icon" aria-hidden="true">${icon}</span>
                            <span class="row-main">
                                <strong>${t(`more.${name}`)}</strong>
                                <span class="muted">${t(`more.${name}.sub`)}</span>
                            </span>
                            <span class="row-arrow" aria-hidden="true">›</span>
                        </button>
                    </li>`)}
            </ul>
        </div>`;
}

/* ---------- Games ---------- */

const GAMES = [['quiz', '🎯'], ['role', '🔄'], ['empathy', '💬'], ['interview', '🎤']];

export function gamesPage() {
    return html`
        <h1 class="page-title">${t('games.title')}</h1>
        <p class="muted">${t('games.intro')}</p>
        <div class="card">
            <ul class="list">
                ${GAMES.map(([name, icon]) => html`
                    <li>
                        <button class="row" data-action="open-sheet" data-sheet="game-${name}">
                            <span class="row-icon" aria-hidden="true">${icon}</span>
                            <span class="row-main">
                                <strong>${t(`game.${name}.title`)}</strong>
                                <span class="muted">${t(`game.${name}.desc`)}</span>
                            </span>
                            <span class="row-arrow" aria-hidden="true">›</span>
                        </button>
                    </li>`)}
            </ul>
        </div>`;
}

/* ---------- Diary ---------- */

function quote(labelKey, chipKey, chipEmoji, text) {
    if (!chipKey && !text) return '';
    return html`
        <div class="quote">
            <div class="quote-label">${t(labelKey)}</div>
            ${chipKey ? html`<div><span aria-hidden="true">${chipEmoji}</span> ${t(chipKey)}</div>` : ''}
            ${text ? html`<div>${text}</div>` : ''}
        </div>`;
}

export function entryCard(entry) {
    const reaction = REACTIONS.find((r) => r.key === entry.reaction);
    const reply = REPLIES.find((r) => r.key === entry.reply);
    return html`
        <article class="card entry type-${entry.type}">
            <header class="entry-head">
                <div>
                    <h3 class="entry-title">
                        <span aria-hidden="true">${TYPE_EMOJI[entry.type]}</span>
                        ${missionTitle(entry.missionId)}
                        ${entry.sample ? html`<span class="tag">${t('diary.sample')}</span>` : ''}
                    </h3>
                    <div class="muted small">
                        ${formatDate(entry.ts, { dateStyle: 'long', timeStyle: 'short' })}
                        · ${t(`type.${entry.type}`)}
                    </div>
                </div>
                <span class="chip chip-points">+${num(entry.points)}P</span>
            </header>
            ${entry.photo ? html`<img class="entry-photo" src="${entry.photo}" alt="${t('m.photo.alt')}" loading="lazy">` : ''}
            ${entry.keywordMessage ? quote('diary.said', null, '', entry.keywordMessage) : ''}
            ${quote('diary.family', reaction && `reaction.${reaction.key}`, reaction?.emoji, entry.familyResponse)}
            ${quote('diary.me', reply && `reply.${reply.key}`, reply?.emoji, entry.myResponse)}
        </article>`;
}

function tabs(group, current, names) {
    return html`
        <div class="tabs" role="group">
            ${names.map(([value, label]) => html`
                <button class="tab" aria-pressed="${value === current ? 'true' : 'false'}"
                    data-action="set-tab" data-group="${group}" data-value="${value}">${label}</button>`)}
        </div>`;
}

function diaryCalendar(state, ui, now) {
    const { calYear: year, calMonth: monthIndex, calDay } = ui;
    const byDay = groupByDay(state.entries);
    const todayKey = dayKey(now);
    // Any Sunday works as a reference for localized weekday names.
    const sunday = addDays(startOfWeek(now), -1);
    const selected = calDay ? byDay.get(dayKey(new Date(year, monthIndex, calDay))) ?? [] : [];

    return html`
        <div class="card">
            <div class="cal-head">
                <button class="icon-btn" data-action="cal-move" data-delta="-1" aria-label="${t('cal.prev')}">‹</button>
                <h2 class="cal-title">${formatDate(new Date(year, monthIndex, 1), { year: 'numeric', month: 'long' })}</h2>
                <button class="icon-btn" data-action="cal-move" data-delta="1" aria-label="${t('cal.next')}">›</button>
            </div>
            <div class="cal-grid" aria-hidden="true">
                ${Array.from({ length: 7 }, (_, i) => html`
                    <div class="cal-dow">${formatDate(addDays(sunday, i), { weekday: 'narrow' })}</div>`)}
            </div>
            <div class="cal-grid">
                ${monthGrid(year, monthIndex).map((day) => {
                    if (day === null) return html`<div></div>`;
                    const date = new Date(year, monthIndex, day);
                    const key = dayKey(date);
                    const count = byDay.get(key)?.length ?? 0;
                    const classes = `cal-day${key === todayKey ? ' is-today' : ''}${day === calDay ? ' is-selected' : ''}`;
                    if (count === 0) return html`<div class="${classes}">${day}</div>`;
                    const label = t('cal.missions', { date: formatDate(date, { dateStyle: 'long' }), n: count });
                    return html`
                        <button class="${classes} has-missions" data-action="cal-pick" data-day="${day}" aria-label="${label}">
                            ${day}<span class="cal-count" aria-hidden="true">${count}</span>
                        </button>`;
                })}
            </div>
        </div>
        ${selected.length > 0
            ? html`
                <h2 class="section-title">
                    ${formatDate(new Date(year, monthIndex, calDay), { dateStyle: 'long' })}
                    <span class="tag">${t('diary.dayCount', { n: selected.length })}</span>
                </h2>
                ${selected.map(entryCard)}`
            : html`<p class="empty">📅 ${t('diary.pick')}</p>`}`;
}

export function diaryPage(state, ui, now) {
    const sorted = [...state.entries].sort((a, b) => b.ts - a.ts);
    return html`
        <h1 class="page-title">${t('diary.title')}</h1>
        <p class="muted">${t('diary.intro')}</p>
        ${tabs('diaryTab', ui.diaryTab, [['timeline', `📜 ${t('diary.timeline')}`], ['calendar', `📅 ${t('diary.calendar')}`]])}
        ${ui.diaryTab === 'calendar'
            ? diaryCalendar(state, ui, now)
            : sorted.length > 0
                ? sorted.map(entryCard)
                : html`<p class="empty">${t('diary.empty')}</p>`}`;
}

/* ---------- Community ---------- */

function postCard(post, state, now) {
    const liked = state.liked.includes(post.id);
    const badgeLevel = post.mine ? badgeProgress(totalPoints(state.entries)).current.level : post.badgeLevel;
    const likes = post.likes + (liked ? 1 : 0);
    return html`
        <article class="card post">
            <div class="post-body">
                <div class="post-meta">
                    <span>
                        ${t('community.dad', { name: post.author })}
                        <span title="${t(`badge.${badgeLevel}`)}">${BADGES[badgeLevel].icon}</span>
                    </span>
                    <span class="muted">${timeAgo(post.ts, now)}</span>
                </div>
                <h3 class="post-title">${post.title}</h3>
                <p class="post-text">${post.text}</p>
                <div class="post-actions">
                    <button class="like" aria-pressed="${liked ? 'true' : 'false'}"
                        data-action="toggle-like" data-id="${post.id}"
                        aria-label="${t('community.like', { n: likes })}">
                        <span aria-hidden="true">${liked ? '❤️' : '🤍'}</span> ${likes}
                    </button>
                    <span class="muted" aria-label="${t('community.comments', { n: post.comments })}">
                        <span aria-hidden="true">💬</span> ${post.comments}
                    </span>
                </div>
            </div>
            ${post.image ? html`<img class="post-image" src="${post.image}" alt="" loading="lazy">` : ''}
        </article>`;
}

export function communityPage(state, ui, now) {
    const posts = [...state.posts].sort((a, b) => b.ts - a.ts);
    return html`
        <h1 class="page-title">${t('community.title')}</h1>

        <h2 class="section-title">${t('community.notices')}</h2>
        <div class="card">
            <ul class="list">
                ${NOTICES.map((n) => html`
                    <li>
                        <button class="row" data-action="open-sheet" data-sheet="notice-${n.id}">
                            <span class="row-icon" aria-hidden="true">${n.icon}</span>
                            <span class="row-main">
                                <strong>${t(`notice.${n.id}.title`)}</strong>
                                <span class="muted">${t(`notice.${n.id}.sub`)}</span>
                            </span>
                            ${state.applied.includes(n.id)
                                ? html`<span class="tag tag-ok">${t('n.applied')}</span>`
                                : html`<span class="row-arrow" aria-hidden="true">›</span>`}
                        </button>
                    </li>`)}
            </ul>
        </div>

        <h2 class="section-title">${t('community.posts')}</h2>
        <button class="btn btn-primary" data-action="open-sheet" data-sheet="post">✏️ ${t('community.write')}</button>
        <p class="muted small">${t('community.local')}</p>
        ${posts.map((post) => postCard(post, state, now))}`;
}

/* ---------- Progress ---------- */

// Single-series bars: one hue, value labelled on every bar (there are at most
// five), so nothing depends on colour or on hover, which phones do not have.
function barChart(values, labels, caption) {
    const max = Math.max(...values, 1);
    return html`
        <figure class="chart">
            <figcaption class="muted small">${caption}</figcaption>
            <div class="bars">
                ${values.map((value, i) => html`
                    <div class="bar-col">
                        <div class="bar-track">
                            <span class="bar" style="height: ${(value / max) * 100}%">
                                <span class="bar-value">${value}</span>
                            </span>
                        </div>
                        <span class="bar-label">${labels[i]}</span>
                    </div>`)}
            </div>
        </figure>`;
}

function weekView(state, now) {
    const week = weekSummary(state.entries, now);
    const counts = countByType(state.entries);
    return html`
        <section class="card">
            <h2 class="card-title">
                ${formatDate(week.days[0].ts, { month: 'short', day: 'numeric' })} –
                ${formatDate(week.days[6].ts, { month: 'short', day: 'numeric' })}
            </h2>
            <ol class="week">
                ${week.days.map((d) => {
                    const dayName = formatDate(d.ts, { weekday: 'long' });
                    const label = t(d.count > 0 ? 'progress.dayDone' : 'progress.dayTodo', { day: dayName });
                    return html`
                        <li class="week-day${d.isToday ? ' is-today' : ''}" aria-label="${label}">
                            <span class="week-dot${d.count > 0 ? ' is-done' : ''}" aria-hidden="true">${d.count > 0 ? '✓' : ''}</span>
                            <span class="small" aria-hidden="true">${formatDate(d.ts, { weekday: 'short' })}</span>
                        </li>`;
                })}
            </ol>
            ${meter(week.activeDays / 7, t('progress.activeDays', { n: week.activeDays }))}
            <p class="center"><strong>${t('progress.activeDays', { n: week.activeDays })}</strong></p>
        </section>

        <h2 class="section-title">${t('progress.byType')}</h2>
        <div class="stat-grid">
            ${MISSION_TYPES.map((type) => html`
                <div class="stat">
                    <span class="stat-icon" aria-hidden="true">${TYPE_EMOJI[type]}</span>
                    <span class="stat-value">${counts[type]}</span>
                    <span class="stat-label">${t(`type.${type}`)}</span>
                </div>`)}
            <div class="stat">
                <span class="stat-icon" aria-hidden="true">🏆</span>
                <span class="stat-value">${state.entries.length}</span>
                <span class="stat-label">${t('progress.total')}</span>
            </div>
        </div>`;
}

function monthView(state, now) {
    const today = new Date(now);
    const weeks = monthWeekCounts(state.entries, today.getFullYear(), today.getMonth());
    const trend = monthlyTrend(state.entries, now, 3);
    const trendMax = Math.max(...trend.map((m) => m.count), 1);
    const monthTotal = weeks.reduce((sum, n) => sum + n, 0);
    return html`
        <section class="card">
            <h2 class="card-title">${formatDate(now, { year: 'numeric', month: 'long' })}</h2>
            ${barChart(weeks, weeks.map((_, i) => t('progress.weekN', { n: i + 1 })), t('progress.monthWeeks'))}
            <p class="center"><strong>${t('progress.monthTotal', { n: monthTotal })}</strong></p>
        </section>

        <section class="card">
            <h2 class="card-title">${t('progress.trend')}</h2>
            ${trend.map((m) => html`
                <div class="trend-row">
                    <div class="trend-head">
                        <span>${formatDate(new Date(m.year, m.monthIndex, 1), { year: 'numeric', month: 'long' })}</span>
                        <strong>${t('progress.count', { n: m.count })}</strong>
                    </div>
                    <div class="meter" aria-hidden="true"><span style="width: ${(m.count / trendMax) * 100}%"></span></div>
                </div>`)}
        </section>`;
}

export function progressPage(state, ui, now) {
    return html`
        <h1 class="page-title">${t('progress.title')}</h1>
        ${tabs('progressTab', ui.progressTab, [['week', t('progress.week')], ['month', t('progress.month')]])}
        ${ui.progressTab === 'month' ? monthView(state, now) : weekView(state, now)}`;
}

export const PAGES = {
    home: homePage,
    games: gamesPage,
    diary: diaryPage,
    community: communityPage,
    progress: progressPage,
};
