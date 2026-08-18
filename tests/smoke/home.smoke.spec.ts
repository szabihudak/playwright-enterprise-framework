import { test, expect } from '../../src/fixtures/test-fixtures';

test.describe('Application smoke tests', () => {
  test('home page loads with public navigation', async ({
    homePage,
    navigation,
  }) => {
    await homePage.goto();

    await expect(homePage.heading).toBeVisible();
    await expect(homePage.tagline).toBeVisible();

    await expect(navigation.brand).toBeVisible();
    await expect(navigation.homeLink).toBeVisible();
    await expect(navigation.loginLink).toBeVisible();
    await expect(navigation.signUpLink).toBeVisible();
  });
});