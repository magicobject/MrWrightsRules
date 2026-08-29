// Single source of truth for what each generated page should look like.
// Used across specs so a new page only needs an entry added here.
export interface SitePage {
  /** Path served by the static test server, e.g. "/rules.html". */
  path: string;
  /** Substring expected in <title>. */
  titleContains: string;
  /** Text expected in the page's <h1>. */
  heading: RegExp;
}

export const PAGES: SitePage[] = [
  { path: '/index.html', titleContains: "Mr Wright's Rules", heading: /rules for software developers/i },
  { path: '/rules.html', titleContains: 'The Rules', heading: /five rules, condensing 40 years/i },
  { path: '/rule-1-there-are-no-shortcuts.html', titleContains: 'Rule 1', heading: /there are no shortcuts/i },
  { path: '/rule-2-all-code-is-first-class-code.html', titleContains: 'Rule 2', heading: /all code is first-class code/i },
  { path: '/rule-3-code-for-other-people.html', titleContains: 'Rule 3', heading: /code for other people/i },
  {
    path: '/rule-4-avoid-stream-of-subconsciousness-programming.html',
    titleContains: 'Rule 4',
    heading: /avoid stream of subconsciousness programming/i,
  },
  {
    path: '/rule-5-security-is-your-responsibility.html',
    titleContains: 'Rule 5',
    heading: /security is your responsibility/i,
  },
];

// The order rule pages should link to each other in, prev/next.
export const RULE_SLUGS = [
  'rule-1-there-are-no-shortcuts',
  'rule-2-all-code-is-first-class-code',
  'rule-3-code-for-other-people',
  'rule-4-avoid-stream-of-subconsciousness-programming',
  'rule-5-security-is-your-responsibility',
];
