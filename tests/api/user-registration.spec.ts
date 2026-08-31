import { test, expect } from '../../src/fixtures/test-fixtures';

import {
  createTestUser,
  createInvalidTestUser,
} from '../../src/data/userFactory';

test.describe('User Authentication API', () => {
  test.skip('can register a new user', async ({ testUser }) => {
    expect(testUser.name).toBeTruthy();
    expect(testUser.email).toContain('@example.com');
    expect(testUser.accessToken).toBeTruthy();
  });

  test('registers a valid user', async ({ userApi }) => {
    const userData = createTestUser();
    const response = await userApi.register(userData);
    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.message).toBe('User created successfully');
    expect(body.user.id).toBeTruthy();
    expect(body.user.email).toBe(userData.email);
    expect(body.user.name).toBe(userData.name);
    expect(body.user.createdAt).toBeTruthy();
  });

  test('try to register a user wirthout email address', async ({ userApi }) => {
    const userData = createTestUser({
      name: 'qa_missing_email',
      email: '',
      password: 'test1234!',
    });
    const response = await userApi.register(userData);
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBe("Validation failed");
    expect(body.details).toEqual({
      formErrors: [],
      fieldErrors: {
        email: ['Invalid email address'],
      },
    });
  });

  test('try to register a user wirthout name', async ({ userApi }) => {
    const userData = createTestUser({
      name: '',
      email: 'qa_ABC@gmail.com',
      password: 'test1234!',
    });
    const response = await userApi.register(userData);
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBe("Validation failed");
    expect(body.details).toEqual({
      formErrors: [],
      fieldErrors: {
        name: ['Name must be at least 2 characters'],
      },
    });
  });

  test('try to register a user wirthout password', async ({ userApi }) => {
    const userData = createTestUser({
      name: 'qa_missing_password',
      email: 'qa_ABC@gmail.com',
      password: '',
    });
    const response = await userApi.register(userData);
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBe("Validation failed");
    expect(body.details).toEqual({
      formErrors: [],
      fieldErrors: {
        password: ['Password must be at least 6 characters'],
      },
    });
  });

  test('try to register a user with 6 char password', async ({ userApi }) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const userName = `qa_${id}`;
    const userData = createTestUser({
      password: '123456',
    });
    const response = await userApi.register(userData);
    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.message).toBe('User created successfully');
    expect(body.user.id).toBeTruthy();
    expect(body.user.email).toMatch(userData.email);
    expect(body.user.name).toMatch(userData.name);
    expect(body.user.createdAt).toBeTruthy();
  });

  test('try to register a user with less than  6 char password', async ({ userApi }) => {
    const userData = createTestUser({
      password: '12345',
    });
    const response = await userApi.register(userData);
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBe("Validation failed");
    expect(body.details).toEqual({
      formErrors: [],
      fieldErrors: {
        password: ['Password must be at least 6 characters'],
      },
    });
  });

  test('try to register a user with the same email', async ({ userApi }) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const userName = `qa_${id}`;
    console.log(userName);
    const userData = createTestUser();
    await userApi.register(userData);
    const response = await userApi.register(userData);
    expect(response.status()).toBe(409);
    const body = await response.json();
    expect(body.error).toBe('User already exists');
  });

  test('try to register a user with missing email filed', async ({ userApi }) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const userData = createInvalidTestUser({
      missingFields: ['email'],
    });
    await userApi.register(userData);
    const response = await userApi.register(userData);
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBe("Validation failed");
    expect(body.details).toEqual({
      formErrors: [],
      fieldErrors: {
        email: ['Required'],
      },
    });
  });

  test('try to register a user with missing name filed', async ({ userApi }) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const userData = createInvalidTestUser({
      missingFields: ['name'],
    });
    await userApi.register(userData);
    const response = await userApi.register(userData);
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBe("Validation failed");
    expect(body.details).toEqual({
      formErrors: [],
      fieldErrors: {
        name: ['Required'],
      },
    });
  });

  test('try to register a user with missing password filed', async ({ userApi }) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const userData = createInvalidTestUser({
      missingFields: ['password'],
    });
    await userApi.register(userData);
    const response = await userApi.register(userData);
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBe("Validation failed");
    expect(body.details).toEqual({
      formErrors: [],
      fieldErrors: {
        password: ['Required'],
      },
    });
  });
});