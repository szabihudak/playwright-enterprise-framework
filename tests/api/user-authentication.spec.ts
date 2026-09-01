import { test, expect } from "../../src/fixtures/test-fixtures";
import type { LoginCredentials } from "../../src/api/models/LoginCredentials";
import { HTTP_STATUS } from "../../src/api/constants/httpStatuses";
import { API_ERRORS } from "../../src/api/constants/apiErrors";

type LoginValidationScenario = {
  name: string;
  statusCode: number;
  overrides: Partial<LoginCredentials>;
  expectedMessage: string;
};

const loginValidationScenarios = [
  {
    name: "rejects an empty email",
    statusCode: HTTP_STATUS.BAD_REQUEST,
    overrides: { email: "", password: "TestPassword1234!" },
    expectedMessage: API_ERRORS.INVALID_LOGIN_FORMAT,
  },
  {
    name: "rejects an empty password",
    statusCode: HTTP_STATUS.BAD_REQUEST,
    overrides: { email: "test@example.com", password: "" },
    expectedMessage: API_ERRORS.INVALID_LOGIN_FORMAT,
  },
  {
    name: "rejects a malformed email",
    statusCode: HTTP_STATUS.BAD_REQUEST,
    overrides: { email: "user.com", password: "TestPassword1234!" },
    expectedMessage: API_ERRORS.INVALID_LOGIN_FORMAT,
  },
  {
    name: "rejects an unknown user",
    statusCode: HTTP_STATUS.UNAUTHORIZED,
    overrides: { email: "somebody@gmail.com", password: "TestPassword1234!" },
    expectedMessage: API_ERRORS.INVALID_CREDENTIALS,
  },
  {
    name: "rejects a missing email",
    statusCode: HTTP_STATUS.BAD_REQUEST,
    overrides: { password: "TestPassword1234!" },
    expectedMessage: API_ERRORS.INVALID_LOGIN_FORMAT,
  },
  {
    name: "rejects a missing password",
    statusCode: HTTP_STATUS.BAD_REQUEST,
    overrides: { email: "test@example.com" },
    expectedMessage: API_ERRORS.INVALID_LOGIN_FORMAT,
  },
] satisfies LoginValidationScenario[];

test.describe("User Authentication API", () => {
  test("authenticates a valid user", async ({
    userApi,
    registeredTestUser,
  }) => {
    const response = await userApi.login({
      email: registeredTestUser.email,
      password: registeredTestUser.password,
    });
    const body = await response.json();
    expect(response.status()).toBe(HTTP_STATUS.OK);
    expect(body.access_token).toBeTruthy();
    expect(body.token_type).toBe("Bearer");
    expect(body.expires_in).toBe(86400);
  });

  test("rejects a valid user with wrong password", async ({
    userApi,
    registeredTestUser,
  }) => {
    const response = await userApi.login({
      email: registeredTestUser.email,
      password: "wrong_pwd_123",
    });
    const body = await response.json();
    expect(response.status()).toBe(HTTP_STATUS.UNAUTHORIZED);
    expect(body.error).toBe(API_ERRORS.INVALID_CREDENTIALS);
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
