// One small line-icon set (24px grid, 1.75 stroke) so every icon shares the
// same weight and inherits the text colour. All are decorative: the adjacent
// text or an aria-label carries the meaning.

import { html } from '../core/html.js';

const icon = (paths) => html`<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${paths}</svg>`;

export const chevron = icon(html`<path d="M9 6l6 6-6 6"/>`);
export const check = icon(html`<path d="M5 12.5l4.5 4.5L19 7.5"/>`);
export const heart = icon(html`<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>`);
export const comment = icon(html`<path d="M4 5h16v11H9l-5 4z"/>`);
export const speaker = icon(html`<path d="M4 10v4h3l5 4V6L7 10z"/><path d="M16 9a4 4 0 0 1 0 6"/>`);
export const camera = icon(html`<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>`);
