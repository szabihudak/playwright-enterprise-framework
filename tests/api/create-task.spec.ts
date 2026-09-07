import { test, expect } from "../../src/fixtures/test-fixtures";
import { HTTP_STATUS } from "../../src/api/constants/httpStatuses";
import type { TaskResponse } from "../../src/api/models/Task";
import type { CurrentUser } from "../../src/api/models/CurrentUser";
import { taskResponseSchema } from "../../src/api/schemas/TaskResponseSchema";
import { validateSchema } from "../../src/api/utils/SchemaValidator";
import {createTask} from "../../src/data/taskFactory";

test.describe("Create a Task API", () => {
  test("creates a task matching the provider contract", async ({
    userApi,
    authenticatedTestUser,
  }) => {
    const user = authenticatedTestUser;
    const currentUserResponse = await userApi.getCurrentUser(
      authenticatedTestUser.accessToken,
    );
    expect(currentUserResponse.status()).toBe(HTTP_STATUS.OK);
    const currentUser = (await currentUserResponse.json()) as CurrentUser;
    const taskData = createTask();
    const response = await userApi.createTask(taskData, user.accessToken);
    expect(response.status()).toBe(HTTP_STATUS.CREATED);

    const body = (await response.json()) as TaskResponse;
    validateSchema(taskResponseSchema, body);

    expect(body.description).toBe(taskData.description);
    expect(body.priority).toBe(taskData.priority);
    expect(body.status).toBe(taskData.status);
    expect(body.title).toBe(taskData.title);
    expect(body.userId).toBe(currentUser.user.id);
  });
});
