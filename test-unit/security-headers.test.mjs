// Guards on the production security headers (public/_headers) and on the
// things that would silently break them. `npm run serve` does not apply
// _headers, so without these a loosened or broken policy would only show up
// in production.
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..');
const headers = readFileSync(join(root, 'public', '_headers'), 'utf8');
const csp = (headers.match(/Content-Security-Policy:\s*(.+)/) ?? [])[1] ?? '';
const htmlFiles = readdirSync(join(root, 'public')).filter((f) => f.endsWith('.html'));

describe('public/_headers', () => {
  for (const name of ['X-Content-Type-Options: nosniff', 'X-Frame-Options: DENY', 'Referrer-Policy:', 'Permissions-Policy:', 'Strict-Transport-Security:']) {
    test(`sets ${name.split(':')[0]}`, () => assert.ok(headers.includes(name)));
  }

  test('has a CSP that is default-deny, with no inline or eval allowances', () => {
    assert.match(csp, /default-src 'self'/);
    assert.match(csp, /object-src 'none'/);
    assert.match(csp, /frame-ancestors 'none'/);
    assert.doesNotMatch(csp, /unsafe-inline|unsafe-eval/);
    assert.doesNotMatch(csp, /\*/);
  });
});

describe('generated pages work under that CSP', () => {
  for (const f of htmlFiles) {
    const html = readFileSync(join(root, 'public', f), 'utf8');
    test(`${f} has no inline script, inline style or event handler`, () => {
      assert.doesNotMatch(html, /<script(?![^>]*\ssrc=)[^>]*>/i, 'inline <script>');
      assert.doesNotMatch(html, /<style[\s>]/i, '<style> block');
      assert.doesNotMatch(html, /\sstyle\s*=/i, 'style= attribute');
      assert.doesNotMatch(html, /\son[a-z]+\s*=/i, 'on* event handler');
    });
  }
});

describe('wrangler.jsonc', () => {
  test('keeps not_found_handling: "404-page" so unknown URLs get the branded 404 in production', () => {
    const text = readFileSync(join(root, 'wrangler.jsonc'), 'utf8');
    assert.match(text, /"not_found_handling"\s*:\s*"404-page"/);
  });
});
