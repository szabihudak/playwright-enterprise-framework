import { test, expect } from '../../src/fixtures/test-fixtures';
import type { TestUser } from '../../src/api/models/User';
import {
  createTestUser,
  createInvalidTestUser,
} from '../../src/data/userFactory';

type MissingFieldScenario = {
  name: string;
  missingField: keyof TestUser;
};

const emptyFieldScenarios = [
  {
    name: 'rejects an empty email',
    overrides: { email: '' },
    field: 'email',
    expectedMessage: 'Invalid email address',
  },
  {
    name: 'rejects an empty name',
    overrides: { name: '' },
    field: 'name',
    expectedMessage: 'Name must be at least 2 characters',
  },
  {
    name: 'rejects an empty password',
    overrides: { password: '' },
    field: 'password',
    expectedMessage: 'Password must be at least 6 characters',
  },
];

const missingFieldScenarios: MissingFieldScenario[] = [
  {
    name: 'rejects a missing email',
    missingField: 'email',
  },
  {
    name: 'rejects a missing name',
    missingField: 'name',
  },
  {
    name: 'rejects a missing password',
    missingField: 'password',
  },
];


test.describe('User Authentication API', () => {
 
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

  test('accepts a 6-character password', async ({ userApi }) => {
    const userData = createTestUser({password: '123456'});
    const response = await userApi.register(userData);
    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.message).toBe('User created successfully');
    expect(body.user.id).toBeTruthy();
    expect(body.user.email).toBe(userData.email);
    expect(body.user.name).toBe(userData.name);
    expect(body.user.createdAt).toBeTruthy();
  });

  test('rejects a password shorter than 6 characters', async ({ userApi }) => {
    const userData = createTestUser({password: '12345'});
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

  test('rejects duplicate registration - same email', async ({ userApi }) => {
    const userData = createTestUser();
    await userApi.register(userData);
    const response = await userApi.register(userData);
    expect(response.status()).toBe(409);
    const body = await response.json();
    expect(body.error).toBe('User already exists');
  });

  for (const scenario of emptyFieldScenarios) {
    test(scenario.name, async ({ userApi }) => {
      const userData = createTestUser(scenario.overrides);
      const response = await userApi.register(userData);
      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.error).toBe('Validation failed');
      expect(body.details.fieldErrors[scenario.field],).toEqual([scenario.expectedMessage]);
    });
  }
  
  for (const scenario of missingFieldScenarios) {
    test(scenario.name, async ({ userApi }) => {
      const userData = createInvalidTestUser({missingFields: [scenario.missingField]});
      const response = await userApi.register(userData);
      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.error).toBe('Validation failed');
      expect(body.details.fieldErrors[scenario.missingField],).toEqual(['Required']);
    });
  }
});