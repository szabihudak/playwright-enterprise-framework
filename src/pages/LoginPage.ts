import { type Locator, type Page } from '@playwright/test';

export class LoginPage {
    readonly page: Page;
    readonly heading: Locator;
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly loginButton: Locator;

    constructor (page:Page) {
        this.page = page;
        this.heading = page.getByRole('heading',{name:'Sign in'});
        this.emailInput = page.getByPlaceholder('Email');
        this.passwordInput= page.getByPlaceholder('Password');
        this.loginButton = page.getByRole('button',{name:'Login'})
    }

    async goto(): Promise<void> {
        await this.page.goto('/#/login');
    }

    async login(email:string, password:string): Promise<void> {
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
        await this.loginButton.click();
    }
}

