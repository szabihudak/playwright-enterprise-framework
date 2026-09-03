import { test, expect } from "../../src/fixtures/test-fixtures";
import { NavigationBar } from "../../src/components/NavigationBar";
import { TasksDashboardPage } from "../../src/pages/TasksDashboardPage";

test.describe("Task Dashboard tests", () => {
  test("authenticated user sees the tasks on the dashboard", async ({
    tasksDashboardPage,
    createdTask
  }) => {
    const task = createdTask;
    await tasksDashboardPage.goto();
    await expect(tasksDashboardPage.taskCardByTitle(task.title)).toBeVisible();


  });
});
