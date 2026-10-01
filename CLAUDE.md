# Standing instructions for this repo

These apply to every change here, not just when explicitly asked for. This is a static site (Cloudflare Workers assets), built the same way as LovingGod, kington-parishes and the other MediaWright sites; where this file is silent, `~/.claude/CLAUDE.md` ("Standing practices") applies.

## Before any push to origin
- `git pull origin main` first, and again just before pushing.
- Run `npm test` and `npm run audit` (`npm audit --audit-level=high`), both clean. Fix real findings; never suppress or skip them.
- Report the full-suite result prefixed with the repo name, e.g. "MrWrightsRules: 80 tests passed in 10s".

## Security
- `public/_headers` holds the production security headers. `npm run serve` does NOT apply it, so `test-unit/security-headers.test.mjs` guards it, and after any change to `_headers` or to what a page loads, verify with `npx wrangler dev` and check the browser console for CSP violations.
- The CSP forbids inline scripts, inline styles and event handlers. Put scripts in `public/js/`, styles in `public/css/style.css`; the unit test fails if a generated page has an inline one. Do not add `'unsafe-inline'` to make something pass; fix the cause.
- Only Google Fonts is allowed as a third party (styles and fonts). Adding any other third-party script, font, tracker or embed means adding exactly what it needs to the CSP and verifying it.
- `wrangler.jsonc` keeps `assets.not_found_handling: "404-page"` (guarded by a unit test).
- `.gitattributes` pins text files to LF.

## Accessibility
- Known gap: this repo has no axe-core spec yet (kington-parishes and LovingGod do). Adding `@axe-core/playwright` and `test/accessibility.spec.ts` (every page in `test/support/pages.ts`, zero violations, `.reveal` elements force-settled before scanning) is the standing next step.
- No skipped heading levels; every new colour pairing is computed against WCAG AA (4.5:1 text, 3:1 large text/UI), never eyeballed.

## Build pipeline
- `public/*.html` is generated from `templates/*.html` + `src/pages/*.html` + `src/pages.config.mjs` + `src/site.config.mjs` by `scripts/build.mjs`. Never hand-edit it; edit the source and run `npm run build`.
- `public/css/style.css` and `public/js/main.js` are hand-maintained.
- The pre-commit hook bumps the build number and regenerates `public/`. Never do either by hand.

## Build numbers and changelog
Every commit gets a build tag `build-<date>.<NNN>` matching the footer's "Build ..." text. After committing, tag it and push the tag. This site has no `/updates` page yet, so record each change in the commit message until one exists.
