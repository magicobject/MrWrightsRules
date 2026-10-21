import { test, expect } from '@playwright/test';

test('/updates.html shows the current build number and a changelog, and is not indexed', async ({ page }) => {
  await page.goto('/updates.html');

  await expect(page).toHaveTitle(/Site Updates/);
  await expect(page.locator('h1')).toHaveText(/site updates/i);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');

  const buildNumber = page.locator('.build-number');
  await expect(buildNumber).toBeVisible();
  await expect(buildNumber).toHaveText(/^Current build: \d{4}\.\d{2}\.\d{2}\.\d{3}$/);

  await expect(page.locator('ul.changelog li')).not.toHaveCount(0);
});

test('/updates.html is not linked from the main nav or footer of any page', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('nav.links a[href="updates.html"]')).toHaveCount(0);
  await expect(page.locator('footer.site a[href="updates.html"]')).toHaveCount(0);
});
