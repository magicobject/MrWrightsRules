# Mr Wright's Rules

Some development and testing principles for software developers, honed over 40 years of professional practice. This repo holds a static site rendering the rules — the original prose lives in the [GitHub wiki](https://github.com/magicobject/MrWrightsRules/wiki); this is a proper, readable, linkable home for it. Same lightweight build pipeline as [wrightmaths.uk](https://github.com/magicobject/WrightMaths), [kington-parishes](https://github.com/magicobject/kington-parishes) and the other MediaWright sites — see their READMEs for the full explanation; the short version is below.

## Quick start

```bash
npm install       # also wires up the pre-commit hook — see below
npm run build     # generate public/*.html from templates/ + src/
npm run serve     # serve public/ locally at http://localhost:4177
npm test          # run the Playwright suite
```

## How the build works

Nine real pages (`index`, `rules`, and the seven `rule-N-*` detail pages) plus `404` are assembled from four pieces by [scripts/build.mjs](scripts/build.mjs):

1. **[templates/header.html](templates/header.html)**, **[templates/footer.html](templates/footer.html)**, **[templates/page.html](templates/page.html)** — the shared page shell (nav, footer, `<head>`) with `{{PLACEHOLDER}}` tokens. The 404 page opts out of the header (it isn't a nav destination) but keeps the footer, so the build number and mediawright credit still show there.
2. **[src/pages/\*.html](src/pages)** — just the content unique to each page. No `<head>`, no header, no footer — the build script wraps that around it.
3. **[src/pages.config.mjs](src/pages.config.mjs)** — the nav (including the external GitHub link) and each page's `<title>`/meta description/robots behaviour.
4. **[src/site.config.mjs](src/site.config.mjs)** — the GitHub repo/issues/wiki links and the mediawright.uk credit, substituted in as `{{TOKEN}}`s wherever they appear.

Running `npm run build` reads all four and writes the finished files into `public/`, which is what Cloudflare actually serves (`wrangler.jsonc` points `assets.directory` at `./public`).

## What to edit, and what never to touch

| Want to change... | Edit this | Never edit this |
|---|---|---|
| A rule's wording | `src/pages/rule-N-*.html` | `public/rule-N-*.html` |
| Nav links, page title/description | `src/pages.config.mjs` | `public/<page>.html` |
| Header/footer, shared `<head>` | `templates/*.html` | `public/<page>.html` |
| GitHub/wiki links, mediawright credit | `src/site.config.mjs` | Any hard-coded string in `src/pages/` or `templates/` |
| Styling | `public/css/style.css` (this one genuinely lives in `public/` — it isn't generated) | — |
| The reveal-on-scroll script | `public/js/main.js` (also not generated) | — |

**`public/*.html` is a build artefact.** Every one of those files opens with an auto-generated `DO-NOT-EDIT` HTML comment banner for exactly this reason: a hand-edit made directly to a file in `public/` will be **silently overwritten** the next time anyone runs `npm run build` — which happens automatically on every commit (see below).

## Where the content came from, and what changed

The rules originate from the [GitHub wiki](https://github.com/magicobject/MrWrightsRules/wiki), which has a numbering bug worth knowing about: two separate pages both open with `# Rule 4` (the stream-of-subconsciousness page and the security page), and there's a stale, incomplete draft — `Avoid stream of consciousness programming` (note: *consciousness*, not *subconsciousness*) — that was clearly superseded by a cleaned-up rewrite but never deleted from the wiki. This site uses [The-Rules](https://github.com/magicobject/MrWrightsRules/wiki/The-Rules)'s list as the authoritative order and numbers pages accordingly (currently 1–7); the stale draft page was not carried over.

## The pre-commit hook and the build number in the footer

Every page's footer shows a build number like `Build 2026.08.29.003` (format `yyyy.mm.dd.NNN`, where `NNN` counts commits made that day, stored in [build-number.json](build-number.json)).

This is maintained automatically, not by hand. `npm install` runs the `prepare` script, which points git at the tracked [.githooks/pre-commit](.githooks/pre-commit) hook. On every commit, that hook:

1. Runs [scripts/bump-build-number.mjs](scripts/bump-build-number.mjs), which increments today's counter in `build-number.json`.
2. Runs `npm run build`, regenerating every file in `public/` — including stamping the new build number into each footer and cache-busting `css/style.css?v=...` and `js/main.js?v=...`.
3. Stages the results (`git add public build-number.json`) so they're included in the commit you're about to make.

In other words: **you never bump the build number or rebuild `public/` yourself** — just edit source files under `src/`/`templates/` and commit as normal.

## Tests

[Playwright](https://playwright.dev) specs in `test/` cover:

- **[rules-content.spec.ts](test/rules-content.spec.ts)** — the rules list and homepage tease all seven rules in the correct order, every rule page has a visible summary, and the prev/next chain between rule pages is correct in both directions.
- **[nav.spec.ts](test/nav.spec.ts)** — nav highlighting, and the external GitHub link opens in a new tab from every page.
- **[footer.spec.ts](test/footer.spec.ts)** — every page (404 included) shows a correctly-formatted build number and the mediawright.uk credit.
- **[page-content.spec.ts](test/page-content.spec.ts)** — each page shows its own title/heading/canonical URL, not another page's.
- **[not-found.spec.ts](test/not-found.spec.ts)** — unknown URLs get a real 404 status and the branded 404 page, which is `noindex` and has no header nav.

`test/support/pages.ts` is the shared list of page metadata used across specs; add an entry there when adding a new rule page.

## Deployment

Not yet deployed. Once a Cloudflare Worker is connected to this repo (`wrangler.jsonc`'s `assets.directory` already points at `./public`, ready to go), push to `main` and Cloudflare deploys automatically, same as the other MediaWright sites. The placeholder domain used for canonical URLs, `robots.txt` and `sitemap.xml` is `mrwrightsrules.magicobject.workers.dev` — update all three if a different domain gets used instead.
