import { test } from 'node:test';
import assert from 'node:assert/strict';
import { escapeHtml, html } from '../js/core/html.js';

test('interpolated text is escaped', () => {
    const userText = '<img src=x onerror="alert(1)">';
    assert.equal(
        String(html`<p>${userText}</p>`),
        '<p>&lt;img src=x onerror=&quot;alert(1)&quot;&gt;</p>'
    );
});

test('attribute values cannot break out of their quotes', () => {
    const userText = '" autofocus onfocus="x';
    assert.equal(
        String(html`<input value="${userText}">`),
        '<input value="&quot; autofocus onfocus=&quot;x">'
    );
});

test('nested templates and arrays are not double-escaped', () => {
    const items = ['a&b', 'c'].map((x) => html`<li>${x}</li>`);
    assert.equal(String(html`<ul>${items}</ul>`), '<ul><li>a&amp;b</li><li>c</li></ul>');
});

test('null, undefined and false render as nothing; 0 renders', () => {
    assert.equal(String(html`[${null}${undefined}${false}${0}]`), '[0]');
});

test('escapeHtml covers the five special characters', () => {
    assert.equal(escapeHtml('&<>"\''), '&amp;&lt;&gt;&quot;&#39;');
});
