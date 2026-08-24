import { test, expect } from '../../src/fixtures/test-fixtures';

test.describe('Authenticated user', () => {
  test('authenticated user sees their username in navigation', async ({
    authenticatedPage,
    testUser,
  }) => {
    const navigation = authenticatedPage.getByRole('navigation');

    await expect(
      navigation.getByText(testUser.username, { exact: true }),
    ).toBeVisible();

    await expect(
      navigation.getByRole('link', { name: 'Login' }),
    ).not.toBeVisible();

    await expect(
      navigation.getByRole('link', { name: 'New Article' }),
    ).toBeVisible();
  });
});