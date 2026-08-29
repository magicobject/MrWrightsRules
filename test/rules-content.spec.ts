import { test, expect } from '@playwright/test';
import { RULE_SLUGS } from './support/pages';

test('rules.html lists all five rules in order, each linking to its own page', async ({ page }) => {
  await page.goto('/rules.html');

  const cards = page.locator('.rule-card');
  await expect(cards).toHaveCount(5);

  for (let i = 0; i < RULE_SLUGS.length; i++) {
    await expect(cards.nth(i)).toHaveAttribute('href', `${RULE_SLUGS[i]}.html`);
  }
});

test('every rule page has a visible summary with at least one point', async ({ page }) => {
  for (const slug of RULE_SLUGS) {
    await page.goto(`/${slug}.html`);
    const summary = page.locator('.summary-box');
    await expect(summary).toBeVisible();
    const points = summary.locator('li');
    expect(await points.count()).toBeGreaterThan(0);
  }
});

test('rule pages chain to each other in the correct prev/next order', async ({ page }) => {
  for (let i = 0; i < RULE_SLUGS.length; i++) {
    await page.goto(`/${RULE_SLUGS[i]}.html`);

    const nav = page.locator('.rule-nav');
    const prevHref = i === 0 ? 'rules.html' : `${RULE_SLUGS[i - 1]}.html`;
    const nextHref = i === RULE_SLUGS.length - 1 ? 'rules.html' : `${RULE_SLUGS[i + 1]}.html`;

    await expect(nav.locator('a').first()).toHaveAttribute('href', prevHref);
    await expect(nav.locator('a.next')).toHaveAttribute('href', nextHref);
  }
});

test('the homepage teases all five rules, in the same order as rules.html', async ({ page }) => {
  await page.goto('/index.html');

  const cards = page.locator('.rule-card');
  await expect(cards).toHaveCount(5);
  for (let i = 0; i < RULE_SLUGS.length; i++) {
    await expect(cards.nth(i)).toHaveAttribute('href', `${RULE_SLUGS[i]}.html`);
  }
});
