import { test, expect } from '@playwright/test';
import { PAGES } from './support/pages';

test('landing on the site shows the homepage with Home highlighted in the nav', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/Mr Wright's Rules/);
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('nav.links a[aria-current="page"]')).toHaveText('Home');
});

test('clicking "The Rules" opens rules.html and highlights only that item', async ({ page }) => {
  await page.goto('/');

  await page.locator('nav.links').getByRole('link', { name: 'The Rules', exact: true }).click();

  await expect(page).toHaveURL(/\/rules\.html$/);
  await expect(page.locator('nav.links a[aria-current="page"]')).toHaveText('The Rules');
});

test('the brand logo links back to the homepage from every page', async ({ page }) => {
  for (const sitePage of PAGES.filter((p) => p.path !== '/index.html')) {
    await page.goto(sitePage.path);
    await page.locator('a.brand').click();
    await expect(page).toHaveURL(/\/index\.html$/);
  }
});

test('the GitHub nav link opens the real repo in a new tab, on every page', async ({ page }) => {
  for (const sitePage of PAGES) {
    await page.goto(sitePage.path);
    const githubLink = page.locator('nav.links a', { hasText: 'GitHub' });
    await expect(githubLink).toHaveAttribute('href', 'https://github.com/magicobject/MrWrightsRules');
    await expect(githubLink).toHaveAttribute('target', '_blank');
    await expect(githubLink).toHaveAttribute('rel', 'noopener');
  }
});
