import { test, expect } from '@playwright/test';
import { PAGES } from './support/pages';

const ALL_PATHS = [...PAGES.map((p) => p.path), '/404.html'];

for (const path of ALL_PATHS) {
  // The build number only ever appears on /updates.html (see test/updates.spec.ts)
  // — stamping it into every page's footer used to rewrite every page's HTML
  // on every single commit, whether or not that page had actually changed.
  test(`${path} does not show a build number`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator('.build-number')).toHaveCount(0);
  });

  test(`${path} credits mediawright.uk in the footer`, async ({ page }) => {
    await page.goto(path);

    const credit = page.locator('.fine a[href="https://mediawright.uk"]');
    await expect(credit).toBeVisible();
    await expect(credit).toHaveText('mediawright.uk');
  });
}
