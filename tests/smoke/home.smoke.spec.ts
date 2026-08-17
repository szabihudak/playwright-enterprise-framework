import { test, expect } from '@playwright/test';

test.describe('Application smoke tests', () => {
  test('application is reachable', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveURL(/.+/);
  });
});