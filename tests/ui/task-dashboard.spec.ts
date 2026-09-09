import { test, expect } from "../../src/fixtures/test-fixtures";
import { mockTasksServerError } from "../../src/mocks/taskApiMock";

test.describe("Task Dashboard tests", () => {
  test("authenticated user sees the tasks on the dashboard", async ({
    tasksDashboardPage,
    createdTask,
  }) => {
    const task = createdTask;

if (task.description === null) {
  throw new Error("Expected created task to have a description");
}

await tasksDashboardPage.goto();
    await expect(tasksDashboardPage.taskTitle(task.title)).toHaveText(
      task.title,
    );
    await expect(
      tasksDashboardPage.taskDescription(task.title, task.description),
    ).toHaveText(task.description);
    await expect(
      tasksDashboardPage.taskPriority(task.title, task.priority),
    ).toHaveText(task.priority);
  });

  test("shows error state when tasks API fails", async ({
    authenticatedPage,
    tasksDashboardPage,
  }) => {
    await mockTasksServerError(authenticatedPage);
    await tasksDashboardPage.goto();
    await expect(tasksDashboardPage.emptyColumn("backlog")).toHaveText(
      "No tasks",
    );
    await expect(tasksDashboardPage.emptyColumn("in_progress")).toHaveText(
      "No tasks",
    );
    await expect(tasksDashboardPage.emptyColumn("done")).toHaveText("No tasks");
  });
});
