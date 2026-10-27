import { test as base, expect } from './fixtures';
import { CartPage } from './pages/CartPage';

/**
 * Cart Feature Tests
 *
 * Every test builds on the `authedPage` fixture: a fresh browser context,
 * already logged in and on the catalog. Nothing is shared between tests.
 *
 * Expected prices follow requirements.md: unit = price × (1 − discount/100),
 * rounded to cents; line total = unit × qty; order total = subtotal + $4.99
 * flat shipping.
 *
 * Only the "Discount calculation" group asserts absolute unit prices. Quantity
 * and total tests derive expectations from the unit price the cart displays,
 * so each test fails for one root cause (the discount bug does not mask the
 * frozen-totals bug, and vice versa).
 */

const SHIPPING = 4.99;

const PRODUCTS = {
  headphones: { name: 'Wireless Headphones', price: 89.99,  discount: 20, unit: 71.99 },
  hub:        { name: 'USB-C Hub 7-in-1',    price: 34.99,  discount: 15, unit: 29.74 },
  keyboard:   { name: 'Mechanical Keyboard', price: 129.99, discount: 10, unit: 116.99 },
  webcam:     { name: 'Webcam HD 1080p',     price: 59.99,  discount: 25, unit: 44.99 },
} as const;

const usd = (amount: number) => `$${amount.toFixed(2)}`;

/** Unit price as displayed in the cart row, e.g. "$29.74 each" → 29.74 */
async function displayedUnit(cart: CartPage, productName: string): Promise<number> {
  const locator = cart.unitPrice(productName);
  await expect(locator).toHaveText(/^\$\d+\.\d{2} each$/);
  return parseFloat((await locator.innerText()).replace(/[^0-9.]/g, ''));
}

// Wrap the shared login fixture so each test receives a CartPage directly
const test = base.extend<{ cart: CartPage }>({
  cart: async ({ authedPage }, use) => {
    await use(new CartPage(authedPage));
  },
});

test.describe('Cart', () => {

  // --------------------------------------------------------------------------
  // Adding items
  // --------------------------------------------------------------------------
  test.describe('Adding items', () => {

    test('[TC-CART-POS-01] Adding a product increments the cart badge', async ({ cart }) => {
      await expect(cart.cartBadge).toHaveText('0');
      await cart.addToCart(PRODUCTS.headphones.name);
      await expect(cart.cartBadge).toHaveText('1');
    });

    test('[TC-CART-POS-02] Cart shows name, unit price, quantity, line total and order total', async ({ cart }) => {
      const { name } = PRODUCTS.hub;
      await cart.addToCart(name);
      await cart.open();

      const unit = await displayedUnit(cart, name);

      await expect(cart.cartRows).toHaveCount(1);
      await expect(cart.cartRow(name)).toContainText(name);
      await expect(cart.quantityInput(name)).toHaveValue('1');
      await expect(cart.lineTotal(name)).toHaveText(usd(unit));
      await expect(cart.orderSubtotal).toHaveText(usd(unit));
      await expect(cart.orderTotal).toHaveText(usd(unit + SHIPPING));
    });

    test('[TC-CART-NEG-06] Adding the same product twice increments quantity on a single row', async ({ cart }) => {
      const { name } = PRODUCTS.headphones;
      await cart.addToCart(name);
      await cart.addToCart(name);
      await expect(cart.cartBadge).toHaveText('2');

      await cart.open();
      const unit = await displayedUnit(cart, name);
      await expect(cart.cartRows).toHaveCount(1);
      await expect(cart.quantityInput(name)).toHaveValue('2');
      await expect(cart.lineTotal(name)).toHaveText(usd(unit * 2));
    });

    test('[TC-CART-POS-02b] Two different products produce two rows and a summed order total', async ({ cart }) => {
      const a = PRODUCTS.keyboard;
      const b = PRODUCTS.webcam;
      await cart.addToCart(a.name);
      await cart.addToCart(b.name);
      await expect(cart.cartBadge).toHaveText('2');

      await cart.open();
      const unitA = await displayedUnit(cart, a.name);
      const unitB = await displayedUnit(cart, b.name);
      await expect(cart.cartRows).toHaveCount(2);
      await expect(cart.orderSubtotal).toHaveText(usd(unitA + unitB));
      await expect(cart.orderTotal).toHaveText(usd(unitA + unitB + SHIPPING));
    });

  });

  // --------------------------------------------------------------------------
  // Changing quantity & order total updating
  // --------------------------------------------------------------------------
  test.describe('Quantity & totals', () => {

    test('[TC-CART-POS-03] Increasing quantity to 3 updates line total and order total', async ({ cart }) => {
      // Known bug [TC-CART-NEG-02]: totals stay frozen at their first render
      const { name } = PRODUCTS.hub;
      await cart.addToCart(name);
      await cart.open();

      const unit = await displayedUnit(cart, name);

      await cart.setQuantity(name, 3);

      await expect(cart.cartBadge).toHaveText('3');
      await expect(cart.lineTotal(name)).toHaveText(usd(unit * 3));
      await expect(cart.orderSubtotal).toHaveText(usd(unit * 3));
      await expect(cart.orderTotal).toHaveText(usd(unit * 3 + SHIPPING));
    });

    test('[TC-CART-POS-03b] Decreasing quantity from 3 to 2 lowers the order total', async ({ cart }) => {
      const { name } = PRODUCTS.webcam;
      await cart.addToCart(name, 3);
      await cart.open();
      const unit = await displayedUnit(cart, name);
      await expect(cart.orderTotal).toHaveText(usd(unit * 3 + SHIPPING));

      await cart.setQuantity(name, 2);

      await expect(cart.cartBadge).toHaveText('2');
      await expect(cart.lineTotal(name)).toHaveText(usd(unit * 2));
      await expect(cart.orderTotal).toHaveText(usd(unit * 2 + SHIPPING));
    });

    test('[TC-CART-EDGE-01] Quantity 99 computes line total and order total correctly', async ({ cart }) => {
      const { name } = PRODUCTS.hub;
      await cart.addToCart(name, 99);
      await expect(cart.cartBadge).toHaveText('99');

      await cart.open();
      const unit = await displayedUnit(cart, name);
      await expect(cart.quantityInput(name)).toHaveValue('99');
      await expect(cart.lineTotal(name)).toHaveText(usd(unit * 99));
      await expect(cart.orderTotal).toHaveText(usd(unit * 99 + SHIPPING));
    });

    test('[TC-CART-NEG-03] Removing the only item shows the empty state with no stale totals', async ({ cart }) => {
      const { name } = PRODUCTS.keyboard;
      await cart.addToCart(name);
      await cart.open();
      await expect(cart.cartRows).toHaveCount(1);

      await cart.removeItem(name);

      await expect(cart.cartBadge).toHaveText('0');
      await expect(cart.cartRows).toHaveCount(0);
      await expect(cart.emptyMessage).toBeVisible();
      await expect(cart.orderTotal).toBeHidden();
    });

  });

  // --------------------------------------------------------------------------
  // Below-1 quantity boundary  (requirement: minimum quantity is 1)
  // --------------------------------------------------------------------------
  test.describe('Quantity boundary (min 1)', () => {

    test('[TC-CART-BVA-01] Quantity exactly 1 (lower valid boundary) is accepted', async ({ cart }) => {
      const { name } = PRODUCTS.headphones;
      await cart.addToCart(name, 2);
      await cart.open();

      const unit = await displayedUnit(cart, name);

      await cart.setQuantity(name, 1);

      await expect(cart.cartBadge).toHaveText('1');
      await expect(cart.quantityInput(name)).toHaveValue('1');
      await expect(cart.orderTotal).toHaveText(usd(unit + SHIPPING));
    });

    for (const invalidQty of [0, -1]) {
      test(`[TC-CART-NEG-01] Cart quantity ${invalidQty} is rejected and the item keeps quantity 1`, async ({ cart }) => {
        const { name } = PRODUCTS.headphones;
        await cart.addToCart(name);
        await cart.open();

        const unit = await displayedUnit(cart, name);

        await cart.setQuantity(name, invalidQty);

        await expect(cart.quantityInput(name)).toHaveValue('1');
        await expect(cart.cartBadge).toHaveText('1');
        await expect(cart.orderTotal).toHaveText(usd(unit + SHIPPING));
      });
    }

    test('[TC-CART-NEG-01b] Catalog quantity -2 is rejected and nothing is added', async ({ cart }) => {
      // Exploration notes: the catalog input lacks min="1" and drives the badge to -2
      await cart.addToCart(PRODUCTS.webcam.name, -2);
      await expect(cart.cartBadge).toHaveText('0');

      await cart.open();
      await expect(cart.emptyMessage).toBeVisible();
    });

  });

  // --------------------------------------------------------------------------
  // Discount calculation  (unit = price × (1 − discount / 100))
  // --------------------------------------------------------------------------
  test.describe('Discount calculation', () => {

    for (const p of Object.values(PRODUCTS)) {
      test(`[TC-CAT-EDGE-01] ${p.name}: ${p.discount}% off ${usd(p.price)} is ${usd(p.unit)} in catalog and cart`, async ({ cart }) => {
        // Known bug: app divides by 1000, e.g. $89.99 at 20% shows $88.19
        await expect(cart.catalogPrice(p.name)).toHaveText(usd(p.unit));

        await cart.addToCart(p.name);
        await cart.open();
        await expect(cart.unitPrice(p.name)).toHaveText(`${usd(p.unit)} each`);
        await expect(cart.lineTotal(p.name)).toHaveText(usd(p.unit));
      });
    }

  });

});
