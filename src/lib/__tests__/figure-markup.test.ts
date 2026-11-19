/**
 * The guard in front of a figure the Team App drew as markup (lib/figure-markup.ts). Run with
 * `npm run test:figure-markup`. A refused figure is not drawn, so each refusal is checked here.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FIGURE_MARKUP_MAX_CHARS, FIGURE_MARKUP_START, figureMarkupRefusal } from '../figure-markup';

const MARKUP = `${FIGURE_MARKUP_START}<style>.fx{color:#111}</style><figure class="fx"><p class="fx-step on">38%</p></figure></div>`;
const inside = (extra: string) => MARKUP.replace('</div>', `${extra}</div>`);

test('draws the Team App block', () => {
  assert.equal(figureMarkupRefusal(MARKUP), null);
  assert.equal(figureMarkupRefusal(inside('<p>turn on, one of 3 (a=b)</p>')), null);
});

test('refuses anything that is not the block', () => {
  for (const value of [undefined, null, '', 42, `<p>x</p>${MARKUP}`, ` ${MARKUP}`]) {
    assert.match(String(figureMarkupRefusal(value)), /does not start with/, String(value));
  }
});

test('refuses markup that can run or load something', () => {
  const cases: Array<[string, string]> = [
    ['<script>alert(1)</script>', '<script'],
    ['<SCRIPT src=x></SCRIPT>', '<script'],
    ['<img src=x onerror="a()">', 'event attribute'],
    ['<svg\nONLOAD = "a()"></svg>', 'event attribute'],
    ['<a href="javascript:a()">x</a>', 'javascript:'],
    ['<iframe src="x"></iframe>', '<iframe'],
    ['<object data="x"></object>', '<object'],
    ['<link rel="stylesheet" href="x">', '<link'],
  ];
  for (const [extra, name] of cases) assert.match(String(figureMarkupRefusal(inside(extra))), new RegExp(name.replace(/[<(]/g, '\\$&')), extra);
});

test('refuses markup over the limit, takes it at the limit', () => {
  const pad = (n: number) => `${FIGURE_MARKUP_START}${'x'.repeat(n - FIGURE_MARKUP_START.length)}`;
  assert.equal(figureMarkupRefusal(pad(FIGURE_MARKUP_MAX_CHARS)), null);
  assert.match(String(figureMarkupRefusal(pad(FIGURE_MARKUP_MAX_CHARS + 1))), /over the 40000 limit/);
});
