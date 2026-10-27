import { test, expect } from './fixtures';
import { LoginPage } from './pages/LoginPage';

/**
 * Login Feature Tests
 *
 * Every test starts from the `loginPage` fixture: a fresh, unauthenticated
 * context already on the login page.
 *
 * Expected behaviour comes from requirements.md (Login Page). Test-case IDs
 * from test-cases.md; where the matrix lists a REG-* case that repeats a
 * POS/NEG case, both IDs share one test instead of running it twice.
 */

const TEST_EMAIL    = process.env.TEST_EMAIL    ?? 'demo@techshop.com';
const TEST_PASSWORD = process.env.TEST_PASSWORD ?? 'password123';

/** Login was refused: still on the login page, catalog not shown */
async function expectStillOnLogin(loginPage: LoginPage) {
  await expect(loginPage.loginHeading).toBeVisible();
  await expect(loginPage.productsHeading).toBeHidden();
}

test.describe('Login', () => {

  // --------------------------------------------------------------------------
  // Positive
  // --------------------------------------------------------------------------
  test.describe('Positive', () => {

    test('[TC-AUTH-POS-01] Valid credentials redirect to the product catalog', async ({ loginPage }) => {
      await loginPage.login(TEST_EMAIL, TEST_PASSWORD);

      await expect(loginPage.productsHeading).toBeVisible();
      await expect(loginPage.loginHeading).toBeHidden();
      await expect(loginPage.visibleErrors).toHaveCount(0);
    });

    test('[TC-AUTH-POS-02][TC-AUTH-REG-01] Password field masks input', async ({ loginPage }) => {
      await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');
    });

    test('[TC-AUTH-POS-03] Session persists across a page reload', async ({ loginPage, page }) => {
      await loginPage.login(TEST_EMAIL, TEST_PASSWORD);
      await expect(loginPage.productsHeading).toBeVisible();

      await page.reload();

      await expect(loginPage.productsHeading).toBeVisible();
      await expect(loginPage.loginHeading).toBeHidden();
    });

  });

  // --------------------------------------------------------------------------
  // Empty fields  (requirement: rejected with an error message)
  // --------------------------------------------------------------------------
  test.describe('Empty fields', () => {

    test('[TC-AUTH-NEG-01][TC-AUTH-REG-02] Both fields empty → both fields flagged', async ({ loginPage }) => {
      await loginPage.clickSignIn();

      await expectStillOnLogin(loginPage);
      await expect(loginPage.fieldError('Username')).toBeVisible();
      await expect(loginPage.fieldError('Password')).toBeVisible();
    });

    test('[TC-AUTH-NEG-02] Username empty, password filled → username flagged', async ({ loginPage }) => {
      await loginPage.login('', TEST_PASSWORD);

      await expectStillOnLogin(loginPage);
      await expect(loginPage.fieldError('Username')).toBeVisible();
      await expect(loginPage.fieldError('Password')).toBeHidden();
    });

    test('[TC-AUTH-NEG-03][TC-AUTH-EDGE-06] Username filled, password empty → password flagged', async ({ loginPage }) => {
      await loginPage.login(TEST_EMAIL, '');

      await expectStillOnLogin(loginPage);
      await expect(loginPage.fieldError('Password')).toBeVisible();
      await expect(loginPage.fieldError('Username')).toBeHidden();
    });

    test('[TC-AUTH-NEG-09] Whitespace-only username is treated as empty', async ({ loginPage }) => {
      await loginPage.login('   ', TEST_PASSWORD);

      await expectStillOnLogin(loginPage);
      await expect(loginPage.fieldError('Username')).toBeVisible();
    });

  });

  // --------------------------------------------------------------------------
  // Wrong credentials  (requirement: error shown, stays on login page)
  // --------------------------------------------------------------------------
  test.describe('Wrong credentials', () => {

    const wrongCredentials = [
      { id: 'TC-AUTH-NEG-04][TC-AUTH-REG-03', label: 'wrong password',               user: TEST_EMAIL,                 pass: 'wrongpassword999' },
      { id: 'TC-AUTH-NEG-05',                 label: 'unregistered email',           user: 'nonexistent@techshop.com', pass: TEST_PASSWORD },
      { id: 'TC-AUTH-EDGE-02',                label: 'password in wrong case',       user: TEST_EMAIL,                 pass: TEST_PASSWORD.toUpperCase() },
      { id: 'TC-AUTH-EDGE-05',                label: 'password + 117 extra chars (128 total)', user: TEST_EMAIL,       pass: TEST_PASSWORD.padEnd(128, 'x') },
    ];

    for (const { id, label, user, pass } of wrongCredentials) {
      test(`[${id}] ${label} → invalid-credentials error`, async ({ loginPage }) => {
        await loginPage.login(user, pass);

        await expectStillOnLogin(loginPage);
        await expect(loginPage.formError).toBeVisible();
      });
    }

  });

  // --------------------------------------------------------------------------
  // Email format  (requirement: must contain @ and a domain)
  // --------------------------------------------------------------------------
  test.describe('Email format', () => {

    const malformedEmails = [
      { id: 'TC-AUTH-NEG-06', label: 'missing "@"',          value: 'demo.techshop.com' },
      { id: 'TC-AUTH-NEG-07', label: 'missing TLD',          value: 'demo@techshop' },
      { id: 'TC-AUTH-NEG-08', label: 'not an email ("admin")', value: 'admin' },
      { id: 'TC-AUTH-NEG-11', label: 'illegal comma',        value: 'demo,shop@techshop.com' },
    ];

    for (const { id, label, value } of malformedEmails) {
      test(`[${id}] Email ${label} is rejected`, async ({ loginPage }) => {
        await loginPage.login(value, TEST_PASSWORD);

        await expectStillOnLogin(loginPage);
        await expect(loginPage.visibleErrors).not.toHaveCount(0);
      });
    }

    test('[TC-AUTH-EDGE-01][TC-AUTH-NEG-10] Leading/trailing spaces around a valid email are trimmed', async ({ loginPage }) => {
      await loginPage.login(`  ${TEST_EMAIL}  `, TEST_PASSWORD);

      await expect(loginPage.productsHeading).toBeVisible();
      await expect(loginPage.loginHeading).toBeHidden();
    });

  });

  // --------------------------------------------------------------------------
  // Access before authentication
  // --------------------------------------------------------------------------
  test.describe('Before login', () => {

    test('[TC-AUTH-REG-04][TC-AUTH-EDGE-03] Navbar (and its Products link) is hidden before login', async ({ loginPage }) => {
      await expect(loginPage.navbar).toBeHidden();
      await expect(loginPage.navbarProductsLink).toBeHidden();
      await expect(loginPage.productsHeading).toBeHidden();
    });

  });

});
