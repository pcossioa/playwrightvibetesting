import { Page, Locator } from '@playwright/test';

/**
 * Login inputs → the id of each one's inline "required" error.
 *
 * A11Y-GAP: errors have no role and are not linked to their inputs.
 * Fix: role="alert" on #login-error, aria-describedby="err-login-…" on inputs.
 * Until then each error is found by its own stable id (skill §1a, rung 2).
 */
const FIELD_ERRORS = {
  Username: 'err-login-user',
  Password: 'err-login-pass',
} as const;

export type LoginField = keyof typeof FIELD_ERRORS;

/**
 * Lightweight Page Object for the TechShop Login page.
 * Encapsulates locators and user actions; assertions live in the spec.
 */
export class LoginPage {
  readonly page: Page;

  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator;
  readonly loginHeading: Locator;
  /** Heading of the page shown after a successful login */
  readonly productsHeading: Locator;

  readonly navbar: Locator;
  readonly navbarProductsLink: Locator;

  /** "Invalid username or password" banner */
  readonly formError: Locator;
  /** Login errors currently shown (banner and/or field errors) — assert with toHaveCount */
  readonly visibleErrors: Locator;

  constructor(page: Page) {
    this.page = page;

    this.usernameInput = page.getByLabel('Username');
    this.passwordInput = page.getByLabel('Password');
    this.signInButton = page.getByRole('button', { name: 'Sign In' });
    this.loginHeading = page.getByRole('heading', { name: 'Welcome back' });
    this.productsHeading = page.getByRole('heading', { name: 'Our Products' });

    this.navbar = page.getByRole('navigation');
    this.navbarProductsLink = this.navbar.getByText('Products', { exact: true });

    // A11Y-GAP: see FIELD_ERRORS
    this.formError = page.locator('#login-error');
    this.visibleErrors = this.formError
      .or(this.fieldError('Username'))
      .or(this.fieldError('Password'))
      .filter({ visible: true });
  }

  /** Inline "required" error under a field */
  fieldError(field: LoginField): Locator {
    return this.page.locator(`#${FIELD_ERRORS[field]}`);
  }

  async goto() {
    await this.page.goto('/');
  }

  /** Fill credentials and submit the login form */
  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
  }

  /** Submit without touching the fields */
  async clickSignIn() {
    await this.signInButton.click();
  }
}
