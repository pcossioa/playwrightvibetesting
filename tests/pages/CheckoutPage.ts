import { Page, Locator } from '@playwright/test';

/**
 * Checkout form fields → the ids of each input and its inline error.
 *
 * A11Y-GAP: the checkout <label>s are not associated with their inputs, so
 * getByLabel() cannot be used. Fix: add `for="co-…"` to every label
 * (TC-CHK-POS-02), then replace this map with getByLabel(field).
 * Until then each element is found by its own stable id (skill §1a, rung 2).
 */
const FIELDS = {
  'First Name':    { input: 'co-firstname', error: 'err-firstname' },
  'Last Name':     { input: 'co-lastname',  error: 'err-lastname' },
  'Address':       { input: 'co-address',   error: 'err-address' },
  'City':          { input: 'co-city',      error: 'err-city' },
  'ZIP Code':      { input: 'co-zip',       error: 'err-zip' },
  'Email Address': { input: 'co-email',     error: 'err-email' },
  'Phone Number':  { input: 'co-phone',     error: 'err-phone' },
  'Card Number':   { input: 'co-card',      error: 'err-card' },
  'Expiry':        { input: 'co-expiry',    error: 'err-expiry' },
  'CVV':           { input: 'co-cvv',       error: 'err-cvv' },
} as const;

export type CheckoutField = keyof typeof FIELDS;
export type CheckoutData = Record<CheckoutField, string>;
export const CHECKOUT_FIELDS = Object.keys(FIELDS) as CheckoutField[];

/**
 * Lightweight Page Object for the TechShop Checkout and Confirmation views.
 * Encapsulates locators and user actions; assertions live in the spec.
 */
export class CheckoutPage {
  readonly page: Page;

  readonly heading: Locator;
  readonly placeOrderButton: Locator;
  /** Form-level "please fix the errors" banner */
  readonly formErrorBanner: Locator;

  // ── Confirmation view ───────────────────────────────────────────────────
  readonly confirmationHeading: Locator;
  /** Order reference, e.g. "TS-483920" */
  readonly orderReference: Locator;
  readonly confirmationSummary: Locator;

  constructor(page: Page) {
    this.page = page;

    this.heading = page.getByRole('heading', { name: 'Checkout', exact: true });
    this.placeOrderButton = page.getByRole('button', { name: 'Place Order' });
    // A11Y-GAP: banner has no role. Fix: role="alert" on #checkout-error
    this.formErrorBanner = page.locator('#checkout-error');

    this.confirmationHeading = page.getByRole('heading', { name: /^Order (Confirmed|Placed)!$/ });
    this.orderReference = page.getByText(/TS-\d{6}/);
    // A11Y-GAP: summary box has no role or name. Fix: aria-label="Order details"
    this.confirmationSummary = page.locator('#confirm-summary');
  }

  input(field: CheckoutField): Locator {
    return this.page.locator(`#${FIELDS[field].input}`);
  }

  /** Inline validation message shown under a field */
  fieldError(field: CheckoutField): Locator {
    // A11Y-GAP: errors are not linked to inputs. Fix: aria-describedby="err-…"
    return this.page.locator(`#${FIELDS[field].error}`);
  }

  async fill(data: Partial<CheckoutData>) {
    for (const [field, value] of Object.entries(data) as [CheckoutField, string][]) {
      await this.input(field).fill(value);
    }
  }

  async placeOrder() {
    await this.placeOrderButton.click();
  }
}
