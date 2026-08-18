import { type Locator, type Page } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly heading: Locator;
  readonly tagline: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'conduit', level: 1 });
    this.tagline = page.getByText('A place to share your knowledge.');
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
  }
}