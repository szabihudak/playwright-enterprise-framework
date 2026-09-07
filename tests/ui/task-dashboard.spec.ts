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

  test("shows error state when tasks API fails", async ({
    authenticatedPage,
    tasksDashboardPage,
  }) => {
    await authenticatedPage.route("**/api/tasks", async (route) => {
      if (route.request().method() !== "GET") {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({
          error: "Internal Server Error",
        }),
      });
    });

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
