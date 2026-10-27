import { test as base, expect } from './fixtures';
import { CartPage } from './pages/CartPage';
import { CheckoutPage, CheckoutData, CHECKOUT_FIELDS } from './pages/CheckoutPage';

/**
 * Checkout Feature Tests
 *
 * ┌─ BLOCKER DEPENDENCY ─────────────────────────────────────────────────────┐
 * │ Every test here reaches the checkout form through the real UI:           │
 * │   catalog → Add to Cart → Cart → "Proceed to Checkout".                  │
 * │ Known blocker: "Proceed to Checkout" does not respond to clicks          │
 * │ (onclick → proceedToCheckoutBuggy(), which returns false).               │
 * │ While the blocker is open, every test FAILS in the `checkout` fixture    │
 * │ with a "BLOCKER" message. That is intended: the flow is not faked (no    │
 * │ forced navigation, no calling showPage('checkout')) and not skipped.     │
 * │ These tests will pass once the blocker is fixed, except where the app    │
 * │ itself breaks the checkout requirements.                                 │
 * └──────────────────────────────────────────────────────────────────────────┘
 *
 * Validation rules come from requirements.md (Checkout Form):
 *   Expiry: MM/YY, not in the past · CVV: exactly 3 digits · all fields required
 *   Success: confirmation page with order reference, items, total
 */

/** MM/YY for a month offset from the current month (0 = this month) */
function expiry(monthOffset: number): string {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + monthOffset);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yy = String(d.getFullYear() % 100).padStart(2, '0');
  return `${mm}/${yy}`;
}

const VALID: CheckoutData = {
  'First Name':    'John',
  'Last Name':     'Doe',
  'Address':       '123 Main Street',
  'City':          'New York',
  'ZIP Code':      '10001',
  'Email Address': 'john@example.com',
  'Phone Number':  '5550100123',
  'Card Number':   '4242424242424242',
  'Expiry':        expiry(12),
  'CVV':           '123',
};

const PRODUCT = 'Wireless Headphones'; // well above the $10 minimum order

type CheckoutFixtures = {
  checkout: CheckoutPage;
  /** Order total shown in the cart just before proceeding, e.g. "$76.98" */
  cartTotal: string;
};

const test = base.extend<CheckoutFixtures>({
  cartTotal: async ({ authedPage }, use) => {
    const cart = new CartPage(authedPage);
    await cart.addToCart(PRODUCT);
    await cart.open();
    await expect(cart.orderTotal).toHaveText(/^\$\d+\.\d{2}$/);
    await use(await cart.orderTotal.innerText());
  },

  checkout: async ({ authedPage, cartTotal: _ }, use) => {
    // BLOCKER: "Proceed to Checkout" is unresponsive in the current build.
    // This assertion is where every checkout test fails until it is fixed.
    await authedPage.getByRole('button', { name: 'Proceed to Checkout' }).click();
    const checkout = new CheckoutPage(authedPage);
    await expect(
      checkout.heading,
      'BLOCKER: "Proceed to Checkout" did not open the checkout page'
    ).toBeVisible();
    await use(checkout);
  },
});

test.describe('Checkout', () => {

  // --------------------------------------------------------------------------
  // Empty-form submission
  // --------------------------------------------------------------------------
  test.describe('Empty form', () => {

    test('[TC-CHK-NEG-01] Submitting an empty form is rejected with an error on every required field', async ({ checkout }) => {
      await checkout.placeOrder();

      await expect(checkout.heading).toBeVisible();
      await expect(checkout.confirmationHeading).toBeHidden();
      await expect(checkout.formErrorBanner).toBeVisible();
      for (const field of CHECKOUT_FIELDS) {
        await expect(checkout.fieldError(field), `${field} should show an error`).toBeVisible();
      }
    });

  });

  // --------------------------------------------------------------------------
  // Card expiry validation  (MM/YY, not in the past)
  // --------------------------------------------------------------------------
  test.describe('Expiry validation', () => {

    test('[TC-CHK-EDGE-03a] Expiry in the current month is accepted', async ({ checkout }) => {
      await checkout.fill({ ...VALID, Expiry: expiry(0) });
      await checkout.placeOrder();

      await expect(checkout.confirmationHeading).toBeVisible();
    });

    const invalidExpiries = [
      { id: 'TC-CHK-EDGE-03b', label: 'previous month',          value: expiry(-1) },
      { id: 'TC-CHK-NEG-05',   label: 'past date 01/20',         value: '01/20' },
      { id: 'TC-CHK-EDGE-06',  label: 'month 13',                value: `13/${expiry(12).slice(3)}` },
      { id: 'TC-CHK-EDGE-06b', label: 'month 00',                value: `00/${expiry(12).slice(3)}` },
      { id: 'TC-CHK-NEG-05b',  label: 'incomplete "1/2"',        value: '1/2' },
    ];

    for (const { id, label, value } of invalidExpiries) {
      test(`[${id}] Expiry ${label} (${value}) is rejected`, async ({ checkout }) => {
        await checkout.fill({ ...VALID, Expiry: value });
        await checkout.placeOrder();

        await expect(checkout.fieldError('Expiry')).toBeVisible();
        await expect(checkout.heading).toBeVisible();
        await expect(checkout.confirmationHeading).toBeHidden();
      });
    }

  });

  // --------------------------------------------------------------------------
  // CVV validation  (exactly 3 digits)
  // --------------------------------------------------------------------------
  test.describe('CVV validation', () => {

    test('[TC-CHK-CVV-01] 3-digit CVV is accepted', async ({ checkout }) => {
      await checkout.fill(VALID);
      await checkout.placeOrder();

      await expect(checkout.fieldError('CVV')).toBeHidden();
      await expect(checkout.confirmationHeading).toBeVisible();
    });

    const invalidCvvs = [
      { id: 'TC-CHK-NEG-06a', label: '1 digit',     value: '1' },
      { id: 'TC-CHK-NEG-06b', label: '2 digits',    value: '12' },
      { id: 'TC-CHK-NEG-06c', label: '4 digits',    value: '1234' },
      { id: 'TC-CHK-NEG-10',  label: 'with letter', value: '12A' },
      { id: 'TC-CHK-NEG-08',  label: 'empty',       value: '' },
    ];

    for (const { id, label, value } of invalidCvvs) {
      test(`[${id}] CVV ${label} ("${value}") is rejected`, async ({ checkout }) => {
        await checkout.fill({ ...VALID, CVV: value });
        await checkout.placeOrder();

        await expect(checkout.fieldError('CVV')).toBeVisible();
        await expect(checkout.heading).toBeVisible();
        await expect(checkout.confirmationHeading).toBeHidden();
      });
    }

  });

  // --------------------------------------------------------------------------
  // Confirmation & order reference
  // --------------------------------------------------------------------------
  test.describe('Confirmation', () => {

    test('[TC-CHK-POS-01] Valid order shows confirmation with order reference, items and total', async ({ checkout, cartTotal }) => {
      await checkout.fill(VALID);
      await checkout.placeOrder();

      await expect(checkout.confirmationHeading).toBeVisible();
      await expect(checkout.orderReference).toBeVisible();
      await expect(checkout.orderReference).not.toHaveText(/TS-000000/);
      await expect(checkout.confirmationSummary).toContainText(`${PRODUCT} × 1`);
      await expect(checkout.confirmationSummary).toContainText(cartTotal);
    });

  });

});
