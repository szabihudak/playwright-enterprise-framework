import { test as base, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { NavigationBar } from '../components/NavigationBar';
import { UserApiClient } from '../api/clients/UserApiClient';
import type { AuthenticatedUser } from '../api/models/User';
import { createTestUser } from '../data/userFactory';

type AppFixtures = {
  homePage: HomePage;
  loginPage:LoginPage;
  navigation: NavigationBar;
  userApi: UserApiClient;
  testUser: AuthenticatedUser;
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

  userApi: async ({request}, use) => {
    await use(new UserApiClient(request));
  },

  testUser: async ({userApi}, use) => {
    const user = await userApi.register(createTestUser());
    await use(user);
  }
});

export { expect };