import { test, expect } from '@playwright/test';
import { HomePage } from '../../src/pages/HomePage';
import { NavigationBar } from '../../src/components/NavigationBar';

test.describe('Application smoke tests', () => {
    test('home page loads with public navigation', async ({ page }) => {
        const homePage = new HomePage(page);
        const navigation = new NavigationBar(page);
      
        await homePage.goto();
      
        await expect(navigation.brand).toBeVisible();
        await expect(navigation.homeLink).toBeVisible();
        await expect(navigation.loginLink).toBeVisible();
        await expect(navigation.signUpLink).toBeVisible();
      });
});