import { test, expect } from "../../src/fixtures/test-fixtures";
import { LoginCredentials } from "../../src/api/models/LoginCredentials";

type LoginValidationScenario = {
  name: string;
  statusCode: number;
  overrides: Partial<LoginCredentials>;
  expectedMessage: string;
};

const loginValidationScenarios = [
  {
    name: "rejects an empty email",
    statusCode: 400,
    overrides: {email:"", password:"TestPassword1234!"},
    expectedMessage: "Invalid email or password format",
  },
  {
    name: "rejects an empty password",
    statusCode: 400,
    overrides: {email:"test@example.com", password:""},
    expectedMessage: "Invalid email or password format",
  },
  {
    name: "reject an known user with malformed email",
    statusCode: 400,
    overrides: {email:"user.com", password:"TestPassword1234!"},
    expectedMessage: "Invalid email or password format",
  },
  {
    name: "reject an unknown user",
    statusCode: 401,
    overrides: {email:"somebody@gmail.com", password:"TestPassword1234!"},
    expectedMessage: "Invalid credentials",
  },
  {
    name: "rejects an missing email",
    statusCode: 400,
    overrides: {password:"TestPassword1234!"},
    expectedMessage: "Invalid email or password format",
  },
  {
    name: "rejects an missing password",
    statusCode: 400,
    overrides: {email:"test@example.com"},
    expectedMessage: "Invalid email or password format",
  }, 
] satisfies LoginValidationScenario[];

test.describe("User Authentication API", () => {
  test("authenticate a valid user", async ({ userApi, registeredTestUser }) => {
    const response = await userApi.login({email:registeredTestUser.email, password:registeredTestUser.password});
    const body = await response.json();
    expect(response.status()).toBe(200);
    expect(body.access_token).toBeTruthy();
    expect(body.token_type).toBe("Bearer");
    expect(body.expires_in).toBe(86400);
  });

  test("reject a valid user with wrong password", async ({ userApi, registeredTestUser }) => {
    const response = await userApi.login({email:registeredTestUser.email, password:"wrong_pwd_123"});
    const body = await response.json();
    expect(response.status()).toBe(401);
    expect(body.error).toBe("Invalid credentials");
  });


  for (const scenario of loginValidationScenarios) {
    test(scenario.name, async ({ userApi }) => {
      const response = await userApi.login(scenario.overrides);
      const body = await response.json();
      expect(response.status()).toBe(scenario.statusCode);
      expect(body.error).toBe(scenario.expectedMessage);
    });
  }
});
