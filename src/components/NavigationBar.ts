import { type Locator, type Page } from '@playwright/test';

export class NavigationBar {
  readonly navigation: Locator;
  readonly brand: Locator;
  readonly homeLink: Locator;
  readonly loginLink: Locator;
  readonly signUpLink: Locator;

  constructor(page: Page) {
    this.navigation = page.getByRole('navigation');

    this.brand = this.navigation.getByRole('link', { name: 'conduit' });
    this.homeLink = this.navigation.getByRole('link', { name: 'Home' });
    this.loginLink = this.navigation.getByRole('link', { name: 'Login' });
    this.signUpLink = this.navigation.getByRole('link', { name: 'Sign up' });
  }
}