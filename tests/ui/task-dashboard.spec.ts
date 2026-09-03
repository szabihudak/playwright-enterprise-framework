import { test, expect } from "../../src/fixtures/test-fixtures";
import { NavigationBar } from "../../src/components/NavigationBar";
import { TasksDashboardPage } from "../../src/pages/TasksDashboardPage";

test.describe("Task Dashboard tests", () => {
  test("authenticated user sees the tasks on the dashboard", async ({
    authenticatedPage,
    createdTask,
  }) => {
    const task = createdTask;
    const tasksDektopPage = new TasksDashboardPage(authenticatedPage);
    tasksDektopPage.goto();
    console.log(task.title)
    await expect(tasksDektopPage.taskCardByTitle(task.title)).toBeVisible();


  });
});
