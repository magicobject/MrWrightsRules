// Guards the fix for every page's HTML changing on every commit just
// because a shared build number and a hand-written ?v= were stamped into
// it. The build number must appear nowhere but /updates.html, and every
// same-origin stylesheet/script link must be versioned by a content hash,
// not hand-written.
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..');
const htmlFiles = readdirSync(join(root, 'public')).filter((f) => f.endsWith('.html'));
const hashOf = (publicPath) => createHash('sha256').update(readFileSync(join(root, 'public', publicPath))).digest('hex').slice(0, 10);

describe('the build number only appears on /updates.html', () => {
  for (const name of htmlFiles) {
    if (name === 'updates.html') continue;
    test(`${name} has no .build-number`, () => {
      const html = readFileSync(join(root, 'public', name), 'utf8');
      assert.doesNotMatch(html, /class="build-number"/);
    });
  }

  test('updates.html shows the current build number', () => {
    const html = readFileSync(join(root, 'public', 'updates.html'), 'utf8');
    const { date, build } = JSON.parse(readFileSync(join(root, 'build-number.json'), 'utf8'));
    const current = `${date}.${String(build).padStart(3, '0')}`;
    assert.match(html, new RegExp(`class="build-number">Current build: ${current.replace(/\./g, '\\.')}<`));
  });
});

describe('same-origin asset links are versioned by content hash, not hand-written', () => {
  for (const name of htmlFiles) {
    test(`${name}'s stylesheet/script links carry a 10-hex-char ?v=`, () => {
      const html = readFileSync(join(root, 'public', name), 'utf8');
      const tags = html.match(/<(?:link|script)\b[^>]*>/g) ?? [];
      const sameOrigin = tags.filter((tag) => /\b(?:href|src)="\/(?!\/)[^"?#]+/.test(tag));
      assert.ok(sameOrigin.length > 0, `${name} has no same-origin <link>/<script> tags to check`);
      for (const tag of sameOrigin) assert.match(tag, /\?v=[0-9a-f]{10}"/, tag);
    });
  }

  test('the hash in style.css?v=... and main.js?v=... matches each file\'s own content', () => {
    const html = readFileSync(join(root, 'public', 'index.html'), 'utf8');
    assert.ok(html.includes(`/css/style.css?v=${hashOf('css/style.css')}`));
    assert.ok(html.includes(`/js/main.js?v=${hashOf('js/main.js')}`));
  });
});
