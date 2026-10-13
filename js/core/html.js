// Escape-by-default HTML templating. Every interpolated value in html`...` is
// escaped unless it is itself the result of html`...`, so user-typed text
// (diary notes, post bodies, names) can never be parsed as markup.

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (ch) => ESCAPES[ch]);
}

class SafeHtml {
    constructor(value) {
        this.value = value;
    }
    toString() {
        return this.value;
    }
}

function render(value) {
    if (value instanceof SafeHtml) return value.value;
    if (Array.isArray(value)) return value.map(render).join('');
    if (value === null || value === undefined || value === false) return '';
    return escapeHtml(value);
}

export function html(strings, ...values) {
    let out = strings[0];
    values.forEach((value, i) => {
        out += render(value) + strings[i + 1];
    });
    return new SafeHtml(out);
}
