import { type Locator, type Page } from "@playwright/test";

export class TasksDashboardPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly taskCards: Locator;

  constructor(page: Page) {
    this.page = page;

    this.heading = page.getByRole("heading", {
      name: /tasks|dashboard/i,
    });

    this.taskCards = page.locator('[data-testid="task-card"]');
  }

  async goto(): Promise<void> {
    await this.page.goto("/dashboard");
  }

  taskCardByTitle(title: string): Locator {
    return this.taskCards.filter({
      hasText: title,
    });
  }

  taskTitle(title: string): Locator {
    return this.taskCardByTitle(title).getByText(title, {
      exact: true,
    });
  }

  taskDescription(title: string, description: string): Locator {
    return this.taskCardByTitle(title).getByText(description, {
      exact: true,
    });
  }

  taskPriority(title: string, priority: string): Locator {
    return this.taskCardByTitle(title).getByText(priority, {
      exact: true,
    });
  }

  taskStatus(title: string, status: string): Locator {
    return this.taskCardByTitle(title).getByText(status, {
      exact: true,
    });
  }
  
}