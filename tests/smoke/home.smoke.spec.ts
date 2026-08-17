import { test, expect } from '@playwright/test';

test.describe('Application smoke tests', () => {
  test('home page is reachable', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveURL(/conduit-realworld-example-app/);
    await expect(page.locator('body')).toBeVisible();
  });
});