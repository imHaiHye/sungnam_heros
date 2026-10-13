// The five tab pages. Each is a pure function of (state, ui, now) that returns
// markup; main.js decides when to call them.

import { html } from '../core/html.js';
import { t, num, formatDate, timeAgo } from '../core/i18n.js';
import {
    addDays, badgeProgress, countByType, countOnDay, dayKey, groupByDay, monthGrid,
    monthWeekCounts, monthlyTrend, startOfWeek, streak, totalPoints, weekSummary,
} from '../core/domain.js';
import { recommend } from '../core/recommend.js';
import { BADGES, MISSIONS, MISSION_TYPES, REACTIONS, REPLIES } from '../data/missions.js';
import { NOTICES } from '../data/seed.js';
import { check, chevron, comment, heart } from './icons.js';

const missionTitle = (id) => t(`mission.${id}.title`);
const missionDesc = (id) => t(`mission.${id}.desc`);
const missionMeta = (mission) => html`${t(`time.${mission.level}`)} · <span class="pts">+${num(mission.points)}P</span>`;

/** Colour marker for a mission type; always shown next to the type's name. */
const dot = (type) => html`<span class="dot type-${type}" aria-hidden="true"></span>`;

function meter(ratio, label) {
    const percent = Math.round(ratio * 100);
    return html`
        <div class="meter" role="progressbar" aria-label="${label}"
            aria-valuemin="0" aria-valuemax="100" aria-valuenow="${percent}">
            <span style="width: ${percent}%"></span>
        </div>`;
}

/** A full-width tappable row that opens a sheet: title, second line, chevron. */
function sheetRow(sheet, title, sub, trailing = chevron) {
    return html`
        <li>
            <button class="row" data-action="open-sheet" data-sheet="${sheet}">
                <span class="row-main">
                    <strong>${title}</strong>
                    <span class="meta">${sub}</span>
                </span>
                ${trailing}
            </button>
        </li>`;
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
        <section class="section">
            <h1 class="hello">${t('home.hello', { name: state.profile.name })}</h1>
            <div class="balance">
                <span class="points">${num(points)}<small>P</small></span>
                <span class="meta">${t('home.voucher')}</span>
            </div>
            <dl class="figures">
                <div>
                    <dt>${t('home.today')}</dt>
                    <dd class="stat-value">${t('home.todayCount', { n: countOnDay(state.entries, now) })}</dd>
                </div>
                <div>
                    <dt>${t('home.streak')}</dt>
                    <dd class="stat-value">${t('home.streakDays', { n: streak(state.entries, now) })}</dd>
                </div>
            </dl>
            <button class="row" data-action="open-sheet" data-sheet="badges" aria-label="${t('home.badges')}">
                <span class="badge-icon" aria-hidden="true">${badge.current.icon}</span>
                <span class="row-main">
                    <strong>${t(`badge.${badge.current.level}`)}</strong>
                    <span class="meta">${badgeLine}</span>
                </span>
                ${chevron}
            </button>
            ${meter(badge.ratio, badgeLine)}
        </section>

        <section class="section featured type-${rec.mission.type}">
            <p class="label">${t('home.recommend')}</p>
            <h2 class="featured-title">${missionTitle(rec.mission.id)}</h2>
            <p>${missionDesc(rec.mission.id)}</p>
            <p class="meta">${dot(rec.mission.type)} ${t(`type.${rec.mission.type}`)} · ${missionMeta(rec.mission)}</p>
            <p class="reason">${t(`reason.${rec.reason}`, { who: t(`who.${rec.mission.type}`) })}</p>
            <button class="btn btn-primary btn-lg" data-action="open-mission" data-id="${rec.mission.id}">
                ${t('home.start')}
            </button>
        </section>

        <section class="section">
            <h2 class="section-title">${t('home.all')}</h2>
            ${MISSION_TYPES.map((type) => html`
                <h3 class="group-title type-${type}">
                    ${dot(type)} ${t(`type.${type}`)}
                    <span class="meta">${t(`type.${type}.color`)}</span>
                </h3>
                <ul class="list">
                    ${MISSIONS.filter((m) => m.type === type).map((m) => html`
                        <li>
                            <button class="row" data-action="open-mission" data-id="${m.id}">
                                <span class="row-main">
                                    <strong>${missionTitle(m.id)}</strong>
                                    <span>${missionDesc(m.id)}</span>
                                    <span class="meta">${missionMeta(m)}</span>
                                </span>
                                ${chevron}
                            </button>
                        </li>`)}
                </ul>`)}
        </section>

        <section class="section">
            <h2 class="section-title">${t('home.more')}</h2>
            <ul class="list">
                ${['invite', 'nudge', 'install'].map((name) =>
                    sheetRow(name, t(`more.${name}`), t(`more.${name}.sub`)))}
            </ul>
        </section>`;
}

/* ---------- Games ---------- */

const GAMES = ['quiz', 'role', 'empathy', 'interview'];

export function gamesPage() {
    return html`
        <section class="section">
            <h1 class="page-title">${t('games.title')}</h1>
            <p class="lead">${t('games.intro')}</p>
            <ul class="list">
                ${GAMES.map((name) =>
                    sheetRow(`game-${name}`, t(`game.${name}.title`), t(`game.${name}.desc`)))}
            </ul>
        </section>`;
}

/* ---------- Diary ---------- */

function quote(labelKey, choice, labelPrefix, text) {
    if (!choice && !text) return '';
    return html`
        <div class="quote">
            <div class="label">${t(labelKey)}</div>
            ${choice ? html`
                <div>
                    ${choice.emoji ? html`<span aria-hidden="true">${choice.emoji}</span>` : ''}
                    ${t(`${labelPrefix}.${choice.key}`)}
                </div>` : ''}
            ${text ? html`<div>${text}</div>` : ''}
        </div>`;
}

export function entryCard(entry) {
    const reaction = REACTIONS.find((r) => r.key === entry.reaction);
    const reply = REPLIES.find((r) => r.key === entry.reply);
    return html`
        <article class="entry type-${entry.type}">
            <header class="entry-head">
                <div>
                    <h3 class="entry-title">${missionTitle(entry.missionId)}</h3>
                    <div class="meta">
                        ${dot(entry.type)} ${t(`type.${entry.type}`)}
                        · ${formatDate(entry.ts, { dateStyle: 'long', timeStyle: 'short' })}
                        ${entry.sample ? html` · ${t('diary.sample')}` : ''}
                    </div>
                </div>
                <strong class="entry-points">+${num(entry.points)}P</strong>
            </header>
            ${entry.photo ? html`<img class="entry-photo" src="${entry.photo}" alt="${t('m.photo.alt')}" loading="lazy">` : ''}
            ${entry.keywordMessage ? quote('diary.said', null, '', entry.keywordMessage) : ''}
            ${quote('diary.family', reaction, 'reaction', entry.familyResponse)}
            ${quote('diary.me', reply, 'reply', entry.myResponse)}
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
        <div class="cal-head">
            <button class="icon-btn flip" data-action="cal-move" data-delta="-1" aria-label="${t('cal.prev')}">${chevron}</button>
            <h2 class="cal-title">${formatDate(new Date(year, monthIndex, 1), { year: 'numeric', month: 'long' })}</h2>
            <button class="icon-btn" data-action="cal-move" data-delta="1" aria-label="${t('cal.next')}">${chevron}</button>
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
        ${selected.length > 0
            ? html`
                <h2 class="section-title spaced">
                    ${formatDate(new Date(year, monthIndex, calDay), { dateStyle: 'long' })}
                    <span class="meta">${t('diary.dayCount', { n: selected.length })}</span>
                </h2>
                <div class="entries">${selected.map(entryCard)}</div>`
            : html`<p class="empty">${t('diary.pick')}</p>`}`;
}

export function diaryPage(state, ui, now) {
    const sorted = [...state.entries].sort((a, b) => b.ts - a.ts);
    return html`
        <section class="section">
            <h1 class="page-title">${t('diary.title')}</h1>
            <p class="lead">${t('diary.intro')}</p>
            ${tabs('diaryTab', ui.diaryTab, [['timeline', t('diary.timeline')], ['calendar', t('diary.calendar')]])}
            ${ui.diaryTab === 'calendar'
                ? diaryCalendar(state, ui, now)
                : sorted.length > 0
                    ? html`<div class="entries">${sorted.map(entryCard)}</div>`
                    : html`<p class="empty">${t('diary.empty')}</p>`}
        </section>`;
}

/* ---------- Community ---------- */

function postCard(post, state, now) {
    const liked = state.liked.includes(post.id);
    const badgeLevel = post.mine ? badgeProgress(totalPoints(state.entries)).current.level : post.badgeLevel;
    const likes = post.likes + (liked ? 1 : 0);
    return html`
        <article class="post">
            <div class="post-body">
                <div class="meta">
                    ${t('community.dad', { name: post.author })}
                    <span title="${t(`badge.${badgeLevel}`)}">${BADGES[badgeLevel].icon}</span>
                    · ${timeAgo(post.ts, now)}
                </div>
                <h3 class="post-title">${post.title}</h3>
                <p class="post-text">${post.text}</p>
                <div class="post-actions">
                    <button class="like" aria-pressed="${liked ? 'true' : 'false'}"
                        data-action="toggle-like" data-id="${post.id}"
                        aria-label="${t('community.like', { n: likes })}">
                        ${heart} <span class="like-count">${likes}</span>
                    </button>
                    <span class="post-comments" aria-label="${t('community.comments', { n: post.comments })}">
                        ${comment} ${post.comments}
                    </span>
                </div>
            </div>
            ${post.image ? html`<img class="post-image" src="${post.image}" alt="" loading="lazy">` : ''}
        </article>`;
}

export function communityPage(state, ui, now) {
    const posts = [...state.posts].sort((a, b) => b.ts - a.ts);
    return html`
        <section class="section">
            <h1 class="page-title">${t('community.title')}</h1>
            <h2 class="section-title">${t('community.notices')}</h2>
            <ul class="list">
                ${NOTICES.map((n) => sheetRow(
                    `notice-${n.id}`,
                    t(`notice.${n.id}.title`),
                    t(`notice.${n.id}.sub`),
                    state.applied.includes(n.id) ? html`<span class="status-ok">${t('n.applied')}</span>` : chevron,
                ))}
            </ul>
        </section>

        <section class="section">
            <div class="section-head">
                <h2 class="section-title">${t('community.posts')}</h2>
                <button class="btn btn-secondary" data-action="open-sheet" data-sheet="post">${t('community.write')}</button>
            </div>
            <p class="meta">${t('community.local')}</p>
            <div class="posts">${posts.map((post) => postCard(post, state, now))}</div>
        </section>`;
}

/* ---------- Progress ---------- */

// Single-series bars: one hue, value labelled on every bar (there are at most
// five), so nothing depends on colour or on hover, which phones do not have.
function barChart(values, labels, caption) {
    const max = Math.max(...values, 1);
    return html`
        <figure class="chart">
            <figcaption class="meta">${caption}</figcaption>
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
        <h2 class="section-title">
            ${formatDate(week.days[0].ts, { month: 'short', day: 'numeric' })} –
            ${formatDate(week.days[6].ts, { month: 'short', day: 'numeric' })}
        </h2>
        <ol class="week">
            ${week.days.map((d) => {
                const dayName = formatDate(d.ts, { weekday: 'long' });
                const label = t(d.count > 0 ? 'progress.dayDone' : 'progress.dayTodo', { day: dayName });
                return html`
                    <li class="week-day${d.isToday ? ' is-today' : ''}" aria-label="${label}">
                        <span aria-hidden="true">${formatDate(d.ts, { weekday: 'short' })}</span>
                        <span class="week-mark${d.count > 0 ? ' is-done' : ''}" aria-hidden="true">${d.count > 0 ? check : ''}</span>
                    </li>`;
            })}
        </ol>
        <p><strong>${t('progress.activeDays', { n: week.activeDays })}</strong></p>
        ${meter(week.activeDays / 7, t('progress.activeDays', { n: week.activeDays }))}

        <h2 class="section-title spaced">${t('progress.byType')}</h2>
        <dl class="ledger">
            ${MISSION_TYPES.map((type) => html`
                <div><dt>${dot(type)} ${t(`type.${type}`)}</dt><dd>${counts[type]}</dd></div>`)}
            <div class="ledger-total"><dt>${t('progress.total')}</dt><dd>${state.entries.length}</dd></div>
        </dl>`;
}

function monthView(state, now) {
    const today = new Date(now);
    const weeks = monthWeekCounts(state.entries, today.getFullYear(), today.getMonth());
    const trend = monthlyTrend(state.entries, now, 3);
    const trendMax = Math.max(...trend.map((m) => m.count), 1);
    const monthTotal = weeks.reduce((sum, n) => sum + n, 0);
    return html`
        <h2 class="section-title">${formatDate(now, { year: 'numeric', month: 'long' })}</h2>
        <p><strong>${t('progress.monthTotal', { n: monthTotal })}</strong></p>
        ${barChart(weeks, weeks.map((_, i) => t('progress.weekN', { n: i + 1 })), t('progress.monthWeeks'))}

        <h2 class="section-title spaced">${t('progress.trend')}</h2>
        ${trend.map((m) => html`
            <div class="trend-row">
                <div class="trend-head">
                    <span>${formatDate(new Date(m.year, m.monthIndex, 1), { year: 'numeric', month: 'long' })}</span>
                    <strong>${t('progress.count', { n: m.count })}</strong>
                </div>
                <div class="meter" aria-hidden="true"><span style="width: ${(m.count / trendMax) * 100}%"></span></div>
            </div>`)}`;
}

export function progressPage(state, ui, now) {
    return html`
        <section class="section">
            <h1 class="page-title">${t('progress.title')}</h1>
            ${tabs('progressTab', ui.progressTab, [['week', t('progress.week')], ['month', t('progress.month')]])}
            ${ui.progressTab === 'month' ? monthView(state, now) : weekView(state, now)}
        </section>`;
}

export const PAGES = {
    home: homePage,
    games: gamesPage,
    diary: diaryPage,
    community: communityPage,
    progress: progressPage,
};
