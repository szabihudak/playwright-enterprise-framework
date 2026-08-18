import { type Locator, type Page } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly brand: Locator;
  readonly signInLink: Locator;
  readonly signUpLink: Locator;

  constructor(page: Page) {
    this.page = page;

    this.brand = page.getByRole('link', { name: 'conduit' });
    this.signInLink = page.getByRole('link', { name: 'Sign in' });
    this.signUpLink = page.getByRole('link', { name: 'Sign up' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
  }
}