import { Page, Locator } from '@playwright/test';

/**
 * Lightweight Page Object for the TechShop catalog → cart flow.
 * Encapsulates locators and user actions; assertions live in the spec.
 *
 * Locator notes: inputs, buttons and the navbar use roles/labels. The cart
 * badge, product cards, cart rows and order-summary amounts have no accessible
 * name or role in the app markup, so they fall back to their stable ids /
 * single class names. Recommended app fix: add data-testid (or aria-label)
 * to #cart-count, .product-card, .cart-item, #cart-subtotal and #cart-total.
 */
export class CartPage {
  readonly page: Page;

  // ── Navbar ──────────────────────────────────────────────────────────────
  readonly cartNavLink: Locator;
  readonly cartBadge: Locator;

  // ── Cart view ───────────────────────────────────────────────────────────
  readonly cartHeading: Locator;
  readonly cartRows: Locator;
  readonly orderSubtotal: Locator;
  readonly orderTotal: Locator;
  readonly emptyMessage: Locator;
  readonly continueShoppingButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // A11Y-GAP: nav items are <a>/<div> without href or role. Fix: real links
    this.cartNavLink = page.getByRole('navigation').getByText('Cart');
    // A11Y-GAP: badge has no name. Fix: aria-label="Items in cart"
    this.cartBadge = page.locator('#cart-count');

    this.cartHeading = page.getByRole('heading', { name: 'Shopping Cart' });
    // A11Y-GAP: rows and amounts have no role or name. Fix: role="row" /
    // aria-label on .cart-item, #cart-subtotal and #cart-total
    this.cartRows = page.locator('.cart-item');
    this.orderSubtotal = page.locator('#cart-subtotal');
    this.orderTotal = page.locator('#cart-total');
    this.emptyMessage = page.getByText('Your cart is empty.');
    this.continueShoppingButton = page.getByRole('button', { name: 'Continue Shopping' });
  }

  // ── Catalog ─────────────────────────────────────────────────────────────

  /** Product card on the catalog, identified by its exact product name */
  productCard(productName: string): Locator {
    return this.page
      .locator('.product-card')
      .filter({ has: this.page.getByText(productName, { exact: true }) });
  }

  /** Discounted price shown on a catalog card (e.g. "$71.99") */
  catalogPrice(productName: string): Locator {
    // A11Y-GAP: original and discounted prices are unnamed spans.
    // Fix: aria-label="Sale price" (or data-testid) on .price-discounted
    return this.productCard(productName).locator('.price-discounted');
  }

  /** Set the card quantity (if not 1) and click Add to Cart */
  async addToCart(productName: string, qty = 1) {
    const card = this.productCard(productName);
    if (qty !== 1) {
      await card.getByRole('spinbutton').fill(String(qty));
    }
    await card.getByRole('button', { name: 'Add to Cart' }).click();
  }

  // ── Cart ────────────────────────────────────────────────────────────────

  async open() {
    await this.cartNavLink.click();
  }

  cartRow(productName: string): Locator {
    return this.cartRows.filter({ hasText: productName });
  }

  /** Unit price text in the row, e.g. "$29.74 each" */
  unitPrice(productName: string): Locator {
    return this.cartRow(productName).getByText(/each$/);
  }

  quantityInput(productName: string): Locator {
    return this.cartRow(productName).getByRole('spinbutton');
  }

  /** Line total (unit × qty) for a row */
  lineTotal(productName: string): Locator {
    return this.cartRow(productName).locator('.cart-item-subtotal');
  }

  /** Type a new quantity and commit it (blur fires the input's change event) */
  async setQuantity(productName: string, qty: number | string) {
    const input = this.quantityInput(productName);
    await input.fill(String(qty));
    await input.blur();
  }

  async removeItem(productName: string) {
    await this.cartRow(productName).getByRole('button', { name: 'Remove' }).click();
  }
}
