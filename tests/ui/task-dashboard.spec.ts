import { test, expect } from "../../src/fixtures/test-fixtures";

test.describe("Task Dashboard tests", () => {
  test("authenticated user sees the tasks on the dashboard", async ({
    tasksDashboardPage,
    createdTask,
  }) => {
    const task = createdTask;
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
});
