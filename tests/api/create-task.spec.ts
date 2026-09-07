import { test, expect } from "../../src/fixtures/test-fixtures";
import { HTTP_STATUS } from "../../src/api/constants/httpStatuses";
import { API_ERRORS } from "../../src/api/constants/apiErrors";
import type { Task } from "../../src/api/models/Task";
import { taskResponseSchema } from "../../src/api/schemas/TaskResponseSchema";
import { validateSchema } from "../../src/api/utils/SchemaValidator";
import {createTask} from "../../src/data/taskFactory";

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

test.describe("Create a Task API", () => {
  test.only("creates a task matching the provider contract", async ({
    userApi,
    authenticatedTestUser,
  }) => {
    const user = authenticatedTestUser;
    const taskData = createTask();
    const response = await userApi.createTask(taskData, user.accessToken);
    expect(response.status()).toBe(HTTP_STATUS.CREATED);

    const body = (await response.json()) as Task;
    validateSchema(taskResponseSchema, body);

    expect(body.id).toBeTruthy();
    expect(body.createdAt).toBeTruthy();
    expect(body.updatedAt).toBeTruthy();
    expect(body.description).toBe(taskData.description);
    expect(body.priority).toBe(taskData.priority);
    expect(body.status).toBe(taskData.status);
    expect(body.title).toBe(taskData.title);
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
