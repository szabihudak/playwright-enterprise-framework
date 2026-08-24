import { test, expect } from '../../src/fixtures/test-fixtures';

test.describe('User API', () => {
  test('can register a new user', async ({ testUser }) => {
    expect(testUser.username).toBeTruthy();
    expect(testUser.email).toContain('@example.com');
    expect(testUser.token).toBeTruthy();
  });
});