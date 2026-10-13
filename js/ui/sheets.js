// Content for the bottom sheet (<dialog>). Each entry returns { title, body }.

import { html } from '../core/html.js';
import { t, num, getLocale, languageName, LOCALES } from '../core/i18n.js';
import { badgeProgress, totalPoints, weekSummary } from '../core/domain.js';
import {
    BADGES, KEYWORDS, REACTIONS, REPLIES, findMission,
} from '../data/missions.js';
import { PHRASE_KEYS, WIFE_LANGUAGES, findWifeLanguage } from '../data/phrases.js';
import { NOTICES, REFERRAL_CODE } from '../data/seed.js';
import { camera, speaker } from './icons.js';

function choices(group, items, labelPrefix) {
    return html`
        <div class="choice-grid">
            ${items.map((item) => html`
                <button type="button" class="choice" aria-pressed="false"
                    data-action="pick" data-group="${group}" data-value="${item.key}">
                    ${item.emoji ? html`<span aria-hidden="true">${item.emoji}</span>` : ''}
                    ${t(`${labelPrefix}.${item.key}`)}
                </button>`)}
        </div>`;
}

function wifeLanguageSelect(current) {
    return html`
        <select id="wifeLang" data-change="wife-lang">
            ${WIFE_LANGUAGES.map((l) => html`
                <option value="${l.code}" ${l.code === current ? 'selected' : ''}>${languageName(l.code)}</option>`)}
        </select>`;
}

export function phraseList(wifeLang) {
    const lang = findWifeLanguage(wifeLang);
    return html`
        <ul class="list phrase-list">
            ${PHRASE_KEYS.map((key) => {
                const phrase = lang.phrases[key];
                const guide = getLocale() === 'ko' ? phrase.hangul : phrase.roman;
                return html`
                    <li class="phrase">
                        <div class="row-main">
                            <strong class="phrase-text" lang="${lang.code}">${phrase.text}</strong>
                            ${guide ? html`<span class="phrase-guide">[${guide}]</span>` : ''}
                            <span class="meta">${t(`phrase.${key}`)}</span>
                        </div>
                        <button type="button" class="btn btn-quiet" data-action="speak"
                            data-text="${phrase.text}" data-lang="${lang.speech}">
                            ${speaker} ${t('m.phrases.listen')}
                        </button>
                    </li>`;
            })}
        </ul>`;
}

function missionSheet(state, id) {
    const mission = findMission(id);
    return {
        title: t(`mission.${id}.title`),
        body: html`
            <div class="mission-head type-${mission.type}">
                <p class="lead">${t(`mission.${id}.desc`)}</p>
                <p class="meta">
                    <span class="dot type-${mission.type}" aria-hidden="true"></span>
                    ${t(`type.${mission.type}`)} · ${t(`level.${mission.level}`)}
                    · ${t(`time.${mission.level}`)} · <span class="pts">+${num(mission.points)}P</span>
                </p>
            </div>

            ${id === 'pink.easy' ? html`
                <fieldset>
                    <legend>${t('m.keywords')}</legend>
                    <p class="meta">${t('m.keywords.hint')}</p>
                    <div class="choice-grid cols-3">
                        ${KEYWORDS.map((key) => html`
                            <button type="button" class="choice" aria-pressed="false"
                                data-action="toggle-keyword" data-value="${key}">${t(`kw.${key}`)}</button>`)}
                    </div>
                    <p id="keywordMessage" class="keyword-message" aria-live="polite">${t('m.keywords.empty')}</p>
                </fieldset>` : ''}

            ${id === 'pink.medium' ? html`
                <fieldset>
                    <legend>${t('m.phrases')}</legend>
                    <label class="field">
                        <span>${t('m.phrases.lang')}</span>
                        ${wifeLanguageSelect(state.profile.wifeLang)}
                    </label>
                    <div id="phraseList">${phraseList(state.profile.wifeLang)}</div>
                </fieldset>` : ''}

            <fieldset>
                <legend>${t('m.photo')}</legend>
                <label class="photo-drop">
                    <input type="file" accept="image/*" class="visually-hidden" data-change="photo">
                    <span id="photoHint" class="photo-hint">${camera} ${t('m.photo.hint')}</span>
                    <img id="photoPreview" alt="${t('m.photo.alt')}" hidden>
                </label>
            </fieldset>

            <fieldset>
                <legend>${t('m.reaction')}</legend>
                ${choices('reaction', REACTIONS, 'reaction')}
                <label class="field">
                    <span>${t('m.reaction.note')}</span>
                    <textarea id="familyResponse" rows="2" maxlength="300"
                        placeholder="${t('m.reaction.placeholder')}"></textarea>
                </label>
            </fieldset>

            <fieldset>
                <legend>${t('m.reply')}</legend>
                <div class="tip">
                    <div class="tip-good">${t('m.reply.good')}</div>
                    <div class="tip-bad">${t('m.reply.bad')}</div>
                </div>
                ${choices('reply', REPLIES, 'reply')}
                <label class="field">
                    <span>${t('m.reply.note')}</span>
                    <textarea id="myResponse" rows="2" maxlength="300"
                        placeholder="${t('m.reply.placeholder')}"></textarea>
                </label>
            </fieldset>

            <p id="formError" class="error" role="alert" hidden></p>
            <button class="btn btn-primary btn-lg" data-action="complete-mission">${t('m.complete')}</button>`,
    };
}

function badgesSheet(state) {
    const current = badgeProgress(totalPoints(state.entries)).current;
    return {
        title: t('badges.title'),
        body: html`
            <p class="lead">${t('badges.intro')}</p>
            <ul class="list badge-list">
                ${BADGES.map((badge) => html`
                    <li class="badge-row${badge.level === current.level ? ' is-current' : ''}${badge.level > current.level ? ' is-locked' : ''}">
                        <span class="badge-icon" aria-hidden="true">${badge.icon}</span>
                        <span class="row-main">
                            <strong>${t(`badge.${badge.level}`)}</strong>
                            <span class="meta">${t('badges.from', { n: num(badge.points) })}</span>
                        </span>
                        ${badge.level === current.level ? html`<span class="status-ok">${t('badges.current')}</span>` : ''}
                    </li>`)}
            </ul>
            <button class="btn btn-primary" data-action="close-sheet">${t('common.ok')}</button>`,
    };
}

function questionList(prefix, count, withInput) {
    return html`
        <ol class="questions">
            ${Array.from({ length: count }, (_, i) => html`
                <li>
                    <label>
                        <strong>${t(`${prefix}.q${i + 1}`)}</strong>
                        ${withInput ? html`<input type="text" maxlength="100" placeholder="${t('quiz.placeholder')}">` : ''}
                    </label>
                </li>`)}
        </ol>`;
}

function memberRow(value, removable) {
    return html`
        <div class="member">
            <input type="text" maxlength="20" value="${value}"
                aria-label="${t('role.member')}" placeholder="${t('role.member')}">
            ${removable ? html`<button type="button" class="btn btn-quiet" data-action="remove-member">${t('role.remove')}</button>` : ''}
        </div>`;
}

export function newMemberRow() {
    return memberRow('', true);
}

export function roleResults(members, roles) {
    return html`
        <h3 class="card-title">${t('role.result')}</h3>
        <ul class="list">
            ${members.map((member, i) => html`
                <li class="role-card">${t('role.becomes', { a: member, b: roles[i] })}</li>`)}
        </ul>
        <p class="tip">${t('role.tip')}</p>`;
}

const gameSheets = {
    quiz: () => ({
        title: t('game.quiz.title'),
        body: html`
            <p class="lead">${t('quiz.intro')}</p>
            ${questionList('quiz', 5, true)}
            <p id="quizDone" class="tip" role="status" hidden>${t('quiz.done')}</p>
            <button class="btn btn-primary" data-action="quiz-submit">${t('quiz.submit')}</button>`,
    }),
    role: () => ({
        title: t('game.role.title'),
        body: html`
            <p class="lead">${t('role.intro')}</p>
            <fieldset>
                <legend>${t('role.members')}</legend>
                <div id="members">
                    ${memberRow(t('role.dad'), false)}
                    ${memberRow(t('role.mom'), false)}
                    ${memberRow(t('role.child'), true)}
                </div>
                <button type="button" class="btn btn-quiet btn-block" data-action="add-member">${t('role.add')}</button>
            </fieldset>
            <p id="formError" class="error" role="alert" hidden></p>
            <button class="btn btn-primary" data-action="shuffle-roles">${t('role.shuffle')}</button>
            <div id="roleResults" aria-live="polite"></div>`,
    }),
    empathy: () => ({
        title: t('game.empathy.title'),
        body: html`
            <p class="lead">${t('empathy.intro')}</p>
            <div class="card-inset">
                <h3 class="card-title">${t('empathy.rules')}</h3>
                <ol class="steps">
                    ${[1, 2, 3, 4, 5].map((i) => html`<li>${t(`empathy.r${i}`)}</li>`)}
                </ol>
            </div>
            <div id="timer" class="timer" role="timer" aria-live="off">3:00</div>
            <p id="timerDone" class="tip" role="status" hidden>${t('empathy.done')}</p>
            <button class="btn btn-primary" data-action="start-timer">${t('empathy.start')}</button>`,
    }),
    interview: () => ({
        title: t('game.interview.title'),
        body: html`
            <p class="lead">${t('interview.intro')}</p>
            ${questionList('interview', 5, false)}
            <div class="card-inset">
                <h3 class="card-title">${t('interview.tips')}</h3>
                <ul class="steps">
                    ${[1, 2, 3].map((i) => html`<li>${t(`interview.t${i}`)}</li>`)}
                </ul>
            </div>`,
    }),
};

function noticeSheet(state, id) {
    const notice = NOTICES.find((n) => n.id === id);
    const applied = state.applied.includes(id);
    return {
        title: t(`notice.${id}.title`),
        body: html`
            <p class="lead">${t(`notice.${id}.desc`)}</p>
            <dl class="facts">
                ${notice.rows.map((row) => html`
                    <div><dt>${t(`n.${row}`)}</dt><dd>${t(`notice.${id}.${row}`)}</dd></div>`)}
            </dl>
            <button class="btn btn-primary" data-action="apply-notice" data-id="${id}" ${applied ? 'disabled' : ''}>
                ${applied ? t('n.applied') : t('n.apply')}
            </button>`,
    };
}

function postSheet() {
    return {
        title: t('community.write'),
        body: html`
            <label class="field">
                <span>${t('post.title')}</span>
                <input type="text" id="postTitle" maxlength="60" placeholder="${t('post.title.placeholder')}">
            </label>
            <label class="field">
                <span>${t('post.content')}</span>
                <textarea id="postContent" rows="6" maxlength="1000" placeholder="${t('post.content.placeholder')}"></textarea>
            </label>
            <p id="formError" class="error" role="alert" hidden></p>
            <button class="btn btn-primary" data-action="submit-post">${t('post.submit')}</button>`,
    };
}

function nudgeSheet(state, _param, now) {
    const week = weekSummary(state.entries, now);
    return {
        title: t('nudge.title'),
        body: html`
            <p class="lead">${t('nudge.intro')}</p>
            ${[1, 2, 3].map((i) => html`
                <div class="nudge">
                    <div class="label">${t(`nudge.${i}.when`)}</div>
                    <strong>${t(`nudge.${i}.title`)}</strong>
                    <div>${t(`nudge.${i}.body`, { n: week.missions })}</div>
                </div>`)}
            <button class="btn btn-primary" data-action="close-sheet">${t('common.ok')}</button>`,
    };
}

function inviteSheet() {
    return {
        title: t('invite.title'),
        body: html`
            <div class="banner">
                <strong>${t('invite.headline')}</strong>
                <span>${t('invite.sub')}</span>
            </div>
            <div class="card-inset">
                <div class="label">${t('invite.code')}</div>
                <div class="code">${REFERRAL_CODE}</div>
                <button class="btn btn-quiet btn-block" data-action="copy-code">${t('invite.copy')}</button>
            </div>
            <ol class="steps">
                ${[1, 2, 3].map((i) => html`<li>${t(`invite.s${i}`)}</li>`)}
            </ol>
            <button class="btn btn-primary" data-action="share-invite">${t('invite.share')}</button>`,
    };
}

function installSheet(_state, _param, _now, env) {
    return {
        title: t('install.title'),
        body: html`
            <p class="lead">${t('install.desc')}</p>
            ${env.canInstall
                ? html`<button class="btn btn-primary" data-action="install-app">${t('install.button')}</button>`
                : ''}
            <div class="card-inset">
                <h3 class="card-title">${t('install.manual')}</h3>
                <ol class="steps">
                    ${[1, 2, 3].map((i) => html`<li>${t(`install.s${i}`)}</li>`)}
                </ol>
            </div>`,
    };
}

function languageSheet() {
    return {
        title: 'Language · 언어',
        body: html`
            <div class="choice-grid cols-1">
                ${LOCALES.map((l) => html`
                    <button class="choice choice-lg" lang="${l.code}" aria-pressed="${l.code === getLocale() ? 'true' : 'false'}"
                        data-action="set-locale" data-value="${l.code}">${l.label}</button>`)}
            </div>`,
    };
}

function settingsSheet(state) {
    return {
        title: t('settings.title'),
        body: html`
            <label class="field">
                <span>${t('settings.name')}</span>
                <input type="text" id="profileName" maxlength="20" value="${state.profile.name}" data-change="profile-name">
            </label>
            <label class="field">
                <span>${t('settings.wifeLang')}</span>
                ${wifeLanguageSelect(state.profile.wifeLang)}
            </label>
            <fieldset>
                <legend>${t('settings.font')}</legend>
                <div class="choice-grid cols-3">
                    ${[1, 2, 3].map((scale) => html`
                        <button type="button" class="choice" aria-pressed="${state.settings.fontScale === scale ? 'true' : 'false'}"
                            data-action="set-font" data-value="${scale}">${t(`font.${scale}`)}</button>`)}
                </div>
            </fieldset>
            <fieldset>
                <legend>${t('settings.lang')}</legend>
                <div class="choice-grid cols-2">
                    ${LOCALES.map((l) => html`
                        <button type="button" class="choice" lang="${l.code}" aria-pressed="${l.code === getLocale() ? 'true' : 'false'}"
                            data-action="set-locale" data-value="${l.code}" data-keep-open="true">${l.label}</button>`)}
                </div>
            </fieldset>
            <fieldset>
                <legend>${t('settings.data')}</legend>
                <button type="button" class="btn btn-quiet btn-block" data-action="reset-sample">${t('settings.sample')}</button>
                <button type="button" class="btn btn-danger btn-block" data-action="clear-data">${t('settings.clear')}</button>
            </fieldset>`,
    };
}

const SHEETS = {
    mission: missionSheet,
    badges: badgesSheet,
    notice: noticeSheet,
    post: postSheet,
    nudge: nudgeSheet,
    invite: inviteSheet,
    install: installSheet,
    language: languageSheet,
    settings: settingsSheet,
    game: (_state, name) => gameSheets[name](),
};

/** `name` is e.g. 'badges', 'notice-meal' or 'game-quiz'. */
export function renderSheet(name, state, now, env) {
    const [kind, ...rest] = name.split('-');
    const builder = SHEETS[kind];
    return builder ? builder(state, rest.join('-'), now, env) : null;
}
