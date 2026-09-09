import { test, expect } from "../../src/fixtures/test-fixtures";
import { HTTP_STATUS } from "../../src/api/constants/httpStatuses";
import { API_ERRORS } from "../../src/api/constants/apiErrors";
import type { TaskRequest, TaskResponse } from "../../src/api/models/Task";
import type { CurrentUser } from "../../src/api/models/CurrentUser";
import { taskResponseSchema } from "../../src/api/schemas/TaskResponseSchema";
import { validateSchema } from "../../src/api/utils/SchemaValidator";
import { createTask, createInvalidTask } from "../../src/data/taskFactory";

type MissingTaskFieldScenario = {
  name: string;
  missingField: keyof TaskRequest;
};

const missingTaskFieldScenarios = [
  {
    name: "rejects a missing title",
    missingField: "title",
  },
  {
    name: "rejects a missing description",
    missingField: "description",
  },
  {
    name: "rejects a missing priority",
    missingField: "priority",
  },
  {
    name: "rejects a missing status",
    missingField: "status",
  },
] satisfies MissingTaskFieldScenario[];

test.describe("Create a Task API", () => {
  test("creates a task matching the provider contract", async ({
    userApi,
    taskApi,
    authenticatedTestUser,
  }) => {
    const user = authenticatedTestUser;
    const currentUserResponse = await userApi.getCurrentUser(
      authenticatedTestUser.accessToken,
    );
    expect(currentUserResponse.status()).toBe(HTTP_STATUS.OK);
    const currentUser = (await currentUserResponse.json()) as CurrentUser;
    const taskData = createTask();

    const response = await taskApi.createTask(taskData, user.accessToken);
    expect(response.status()).toBe(HTTP_STATUS.CREATED);
    const body = (await response.json()) as TaskResponse;

    validateSchema(taskResponseSchema, body);

    expect(body.description).toBe(taskData.description);
    expect(body.priority).toBe(taskData.priority);
    expect(body.status).toBe(taskData.status);
    expect(body.title).toBe(taskData.title);
    expect(body.userId).toBe(currentUser.user.id);
  });

  test("rejects task without user token", async ({
    taskApi,
  }) => {
    const taskData = createTask();
    const response = await taskApi.createTask(taskData, "");
    expect(response.status()).toBe(HTTP_STATUS.UNAUTHORIZED);
    const body = await response.json();
    expect(body.error).toBe(API_ERRORS.UNAUTHORIZED);
  });

  test("rejects task with invalid user token", async ({
    taskApi,
  }) => {
    const taskData = createTask();
    const response = await taskApi.createTask(taskData, "Invalid-Token_123");
    expect(response.status()).toBe(HTTP_STATUS.UNAUTHORIZED);
    const body = await response.json();
    expect(body.error).toBe(API_ERRORS.UNAUTHORIZED);
  });

  for (const scenario of missingTaskFieldScenarios) {
    test.only(scenario.name, async ({ taskApi, authenticatedTestUser }) => {
      const user = authenticatedTestUser;

      const taskData = createInvalidTask({missingFields:[scenario.missingField]});
      const response = await taskApi.createTask(taskData, user.accessToken);
     // expect(response.status()).toBe(HTTP_STATUS.BAD_REQUEST);
  
      const body = await response.json();
      console.log(body);
      expect(body.error).toBe(API_ERRORS.VALIDATION_FAILED);
      expect(body.details.fieldErrors[scenario.missingField]).toEqual([
        API_ERRORS.REQUIRED_FIELD,
      ]);
    });
  }
});
