import { test, expect } from '../../src/fixtures/test-fixtures';
test.describe('User API', () => {
  test.skip('can register a new user', async ({ testUser }) => {
    expect(testUser.name).toBeTruthy();
    expect(testUser.email).toContain('@example.com');
    expect(testUser.accessToken).toBeTruthy();
  });

  test('registers a valid user', async ({userApi, testUserData }) => {
    const response = await userApi.register(testUserData);
    expect(response.status()).toBe(201);
    const body = await response.json();
    console.log(body);
  });

});