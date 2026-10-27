import { test as base, expect, Page } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

/**
 * Custom fixture types exposed to spec files.
 *
 * loginPage  — navigated to / and wrapped in a LoginPage POM. Used for
 *              unauthenticated tests (the login feature spec itself).
 *
 * authedPage — a Page whose context is fully authenticated. Login happens
 *              once inside the fixture; the test receives a page with the
 *              products catalog already visible. Built on the per-test `page`
 *              fixture, so every test gets a fresh, isolated context.
 */
type AppFixtures = {
  loginPage: LoginPage;
  authedPage: Page;
};

export const test = base.extend<AppFixtures>({
  // ------------------------------------------------------------------ //
  // loginPage: unauthenticated page, pre-navigated to /                 //
  // ------------------------------------------------------------------ //
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await use(loginPage);
    // Playwright closes the default page/context automatically after the test
  },

  // ------------------------------------------------------------------ //
  // authedPage: authenticated page for tests that need a logged-in user //
  // ------------------------------------------------------------------ //
  authedPage: async ({ page }, use) => {
    // Credentials from environment, with the documented demo fallbacks
    const email = process.env.TEST_EMAIL ?? 'demo@techshop.com';
    const password = process.env.TEST_PASSWORD ?? 'password123';

    // `page` is already a fresh, isolated context per test (clean cookies,
    // clean storage) and carries the project's trace/screenshot settings
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(email, password);

    // Hand over only once the catalog is actually showing
    await expect(loginPage.productsHeading, 'Login fixture did not reach the product catalog').toBeVisible();

    await use(page);
    // Playwright closes the default page/context automatically after the test
  },
});

export { expect } from '@playwright/test';
