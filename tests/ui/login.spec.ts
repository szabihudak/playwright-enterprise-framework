import { test, expect } from '../../src/fixtures/test-fixtures';

test.describe('Authentication', () => {
  test('registered user can log in through the UI', async ({
    loginPage,
    testUser,
    navigation,
  }) => {
    await loginPage.goto();

    await loginPage.login(
      testUser.email,
      testUser.password,
    );

    await expect(loginPage.page).toHaveURL(/\/dashboard/);

    await expect(
      navigation.userMenuButton,
    ).toBeVisible();

    await expect(
      navigation.loginLink,
    ).not.toBeVisible();
  });
});