import { test as base, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { NavigationBar } from '../components/NavigationBar';

type AppFixtures = {
  homePage: HomePage;
  loginPage:LoginPage;
  navigation: NavigationBar;
};

export const test = base.extend<AppFixtures>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  navigation: async ({ page }, use) => {
    await use(new NavigationBar(page));
  },
});

export { expect };