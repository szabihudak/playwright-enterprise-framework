import { test as base, expect, type Page } from '@playwright/test';
import { getCurrentEnvironment } from '../utils/env';
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
  authenticatedPage: Page;
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
  },
  authenticatedPage: async ({ browser, testUser }, use) => {
    const { webBaseUrl } = getCurrentEnvironment();
  
    const loggedUser = {
      headers: {
        Authorization: `Token ${testUser.token}`,
      },
      isAuth: true,
      loggedUser: {
        bio: null,
        email: testUser.email,
        image: null,
        token: testUser.token,
        username: testUser.username,
      },
    };
  
    const context = await browser.newContext({
      storageState: {
        cookies: [],
        origins: [
          {
            origin: webBaseUrl,
            localStorage: [
              {
                name: 'loggedUser',
                value: JSON.stringify(loggedUser),
              },
            ],
          },
        ],
      },
    });
  
    const page = await context.newPage();
  
    await page.goto('/');
  
    await use(page);
  
    await context.close();
  },
});

export { expect };