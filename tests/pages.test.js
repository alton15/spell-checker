import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SPELLS } from '../js/config.js';
import { calculateCooldown } from '../js/cooldown.js';

const PAGES = {
  ko: readFileSync(new URL('../index.html', import.meta.url), 'utf8'),
  en: readFileSync(new URL('../en/index.html', import.meta.url), 'utf8')
};

for (const [lang, html] of Object.entries(PAGES)) {
  test(`${lang}: static cooldown table matches the calculator`, () => {
    const rows = [...html.matchAll(/<tr data-spell="(\w+)">(.*?)<\/tr>/g)];
    assert.ok(rows.length >= 8, 'expected a row per tracked spell');
    for (const [, spellId, rowHtml] of rows) {
      const cells = [...rowHtml.matchAll(/<td data-base="(\d+)" data-haste="(\d+)">[\d:]+<small>(\d+)/g)];
      assert.equal(cells.length, 6, `${spellId} should have 6 haste columns`);
      for (const [, base, haste, shown] of cells) {
        assert.equal(Number(base), SPELLS[spellId].cooldown, `${spellId} base cooldown`);
        assert.equal(Number(shown), calculateCooldown(Number(base), Number(haste)), `${spellId} @ ${haste}`);
      }
    }
  });

  test(`${lang}: has the SEO metadata search engines and link previews need`, () => {
    const required = [
      /<html lang="(ko|en)">/,
      /<meta name="description" content=".{50,}">/,
      /<link rel="canonical" href="https:\/\/spell\.kkg-dev\.com\//,
      /hreflang="ko"/, /hreflang="en"/, /hreflang="x-default"/,
      /<meta property="og:image" content="https:\/\//,
      /<h1>/
    ];
    required.forEach(pattern => assert.match(html, pattern));
    assert.equal(html.match(/<html lang="(\w+)">/)[1], lang);
  });

  test(`${lang}: JSON-LD blocks are valid JSON`, () => {
    const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
    assert.equal(blocks.length, 2);
    blocks.forEach(([, json]) => assert.doesNotThrow(() => JSON.parse(json)));
  });
}
