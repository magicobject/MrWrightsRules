// Single source of truth for facts repeated across the site — the GitHub
// links (header nav + footer both point at the repo) and the mediawright.uk
// credit. Edit a value here to update it everywhere at once;
// scripts/build.mjs replaces every {{TOKEN}} (e.g. {{GITHUB_URL}}) with the
// matching value below, in templates and in src/pages/*.html content alike.

export const SITE = {
  orgName: "Mr Wright's Rules",
  githubUrl: 'https://github.com/magicobject/MrWrightsRules',
  githubIssuesUrl: 'https://github.com/magicobject/MrWrightsRules/issues',

  mediawrightHref: 'https://mediawright.uk',
  mediawrightLabel: 'mediawright.uk',
};
