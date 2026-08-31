import { test, expect } from '../../src/fixtures/test-fixtures';
import { NavigationBar } from '../../src/components/NavigationBar';

test.describe('Authenticated user', () => {
  test('authenticated user sees account navigation', async ({
    authenticatedPage,
    testUser,
  }) => {
    const navigation = new NavigationBar(authenticatedPage);

    await expect(
      navigation.userMenuButton,
    ).toBeVisible();

    await navigation.openUserMenu();

    await expect(
      navigation.userName,
    ).toHaveText(testUser.name);

    await expect(
      navigation.userEmail,
    ).toHaveText(testUser.email);

    await expect(
      navigation.dashboardLink,
    ).toBeVisible();

    await expect(
      navigation.loginLink,
    ).not.toBeVisible();
  });
});