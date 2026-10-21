#!/usr/bin/env node
// Assembles public/*.html from templates/ + src/pages/*.html +
// src/pages.config.mjs + src/site.config.mjs. Run `npm run build` after
// editing anything in templates/ or src/, and commit the regenerated
// public/*.html — Cloudflare serves that directory as-is.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { NAV, FOOTER_NAV, PAGES } from '../src/pages.config.mjs';
import { SITE } from '../src/site.config.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFileSync(join(root, path), 'utf8');

// Cache-busting for every same-origin stylesheet/script a page loads:
// `<link href="/css/style.css">` becomes `<link href="/css/style.css?v=<hash>">`,
// where the hash is taken from that file's own content. A page's HTML
// therefore only changes when something it actually loads has changed —
// unlike the old ?v=<build number>, which rewrote every page on every
// commit whether or not the CSS/JS had moved. Runs over the finished HTML,
// so a reference to a file that doesn't exist fails the build instead of
// silently shipping a broken link.
const assetHashes = new Map();
function assetHash(publicPath) {
  if (!assetHashes.has(publicPath)) {
    const file = join(root, 'public', publicPath);
    if (!existsSync(file)) throw new Error(`build: page references ${publicPath}, which doesn't exist in public/`);
    assetHashes.set(publicPath, createHash('sha256').update(readFileSync(file)).digest('hex').slice(0, 10));
  }
  return assetHashes.get(publicPath);
}

function versionAssetUrls(html) {
  return html.replace(/<(link|script)\b[^>]*>/g, (tag) =>
    tag.replace(/\b(href|src)="(\/(?!\/)[^"?#]+)"/, (_, attr, path) => `${attr}="${path}?v=${assetHash(path)}"`));
}

const pageTemplate = read('templates/page.html');
const headerTemplate = read('templates/header.html').trimEnd();
const footerTemplate = read('templates/footer.html').trimEnd();

function readBuildNumber() {
  const file = join(root, 'build-number.json');
  if (!existsSync(file)) return '0000.00.00.000';
  const { date, build } = JSON.parse(readFileSync(file, 'utf8'));
  return `${date}.${String(build).padStart(3, '0')}`;
}

// camelCase site.config.mjs keys become {{UPPER_SNAKE_CASE}} tokens, e.g.
// mediawrightHref -> {{MEDIAWRIGHT_HREF}}. Every token is replaced
// everywhere it appears — in templates and in page content alike — so
// repeated facts (the GitHub links, the mediawright credit) only ever
// need to be typed once.
function tokensFromSite(site, buildNumber) {
  const tokens = { BUILD_NUMBER: buildNumber };
  for (const [key, value] of Object.entries(site)) {
    const token = key.replace(/[A-Z]/g, (c) => `_${c}`).toUpperCase();
    tokens[token] = value;
  }
  return tokens;
}

function replaceTokens(html, tokens) {
  let out = html;
  for (const [token, value] of Object.entries(tokens)) {
    out = out.replaceAll(`{{${token}}}`, value);
  }
  return out;
}

function renderNavItems(links, activeHref) {
  return links
    .map(({ href, label, external }) => {
      const current = href === activeHref ? ' aria-current="page"' : '';
      const target = external ? ' target="_blank" rel="noopener"' : '';
      return `      <a href="${href}"${current}${target}>${label}</a>`;
    })
    .join('\n');
}

const footerNavItems = FOOTER_NAV.map(({ href, label }) => `<a href="${href}">${label}</a>`).join(
  '<br>\n        ',
);

const buildNumber = readBuildNumber();
const tokens = tokensFromSite(SITE, buildNumber);

const footer = replaceTokens(
  footerTemplate.replace('{{FOOTER_NAV_ITEMS}}', footerNavItems),
  tokens,
);

for (const page of PAGES) {
  const content = read(`src/pages/${page.slug}.html`).trimEnd();

  let extraHead = '';
  if (page.robots) extraHead += `<meta name="robots" content="${page.robots}">\n`;
  if (page.canonical !== false) {
    extraHead += `<link rel="canonical" href="https://mrwrightsrules.magicobject.workers.dev/${page.slug}.html">\n`;
  }

  const header = page.header
    ? replaceTokens(headerTemplate.replace('{{NAV_ITEMS}}', renderNavItems(NAV, page.active)), tokens)
    : '';
  const pageFooter = page.footer === false ? '' : footer;

  let html = pageTemplate
    .replace('{{TITLE}}', page.title)
    .replace('{{DESCRIPTION}}', page.description)
    .replace('{{EXTRA_HEAD}}', extraHead)
    .replace('{{HEADER}}', header)
    .replace('{{CONTENT}}', content)
    .replace('{{FOOTER}}', pageFooter);

  html = replaceTokens(html, tokens);
  html = versionAssetUrls(html);

  writeFileSync(join(root, 'public', `${page.slug}.html`), html);
  console.log(`built public/${page.slug}.html`);
}
