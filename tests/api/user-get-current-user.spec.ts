import { test, expect } from "../../src/fixtures/test-fixtures";
import { HTTP_STATUS } from "../../src/api/constants/httpStatuses";
import { API_ERRORS } from "../../src/api/constants/apiErrors";
import { CurrentUser } from "../../src/api/models/CurrentUser";
import { currentUserSchema } from "../../src/api/schemas/CurrentUserSchema";
import { validateSchema } from "../../src/api/utils/SchemaValidator";

type GetCurrentUserValidationScenario = {
  name: string;
  statusCode: number;
  accessToken?: string;
  expectedMessage: string;
};

const getCurrentUserValidationScenarios = [
  {
    name: "rejects without token",
    statusCode: HTTP_STATUS.UNAUTHORIZED,
    expectedMessage: API_ERRORS.UNAUTHORIZED,
  },
  {
    name: "rejects with invalid token",
    statusCode: HTTP_STATUS.UNAUTHORIZED,
    accessToken: "invalid-token-12345%6543",
    expectedMessage: API_ERRORS.UNAUTHORIZED,
  },
] satisfies GetCurrentUserValidationScenario[];

test.describe("Get Current User API", () => {
  test("get current user with token", async ({
    userApi,
    authenticatedTestUser,
  }) => {
    const user = authenticatedTestUser;
    const response = await userApi.getCurrentUser(user.accessToken);
    expect(response.status()).toBe(HTTP_STATUS.OK);

    const body = (await response.json()) as CurrentUser;
    validateSchema(currentUserSchema, body);

    expect(body.user.id).toBeTruthy();
    expect(body.user.email).toBe(user.email);
    expect(body.user.name).toBe(user.name);
    expect(body.user.createdAt).toBeTruthy();
    expect(body.user.updatedAt).toBeTruthy();
  });

  for (const scenario of getCurrentUserValidationScenarios) {
    test(scenario.name, async ({ userApi }) => {
      const response = await userApi.getCurrentUser(scenario.accessToken);
      expect(response.status()).toBe(scenario.statusCode);

      const body = await response.json();
      expect(body.error).toBe(scenario.expectedMessage);
    });
  }
});
