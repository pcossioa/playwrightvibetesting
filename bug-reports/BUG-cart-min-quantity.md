### [BUG-cart-min-quantity] Quantity 0 or negative is accepted in the cart and catalog, producing a negative order total

- **Environment:**
  - **App Version / Target:** TechShop `broken-app` (repo commit `1cfdd6d`), served locally
  - **Browser / Engine:** Chromium 156.0.8078.4 (Playwright 1.64.1, `Desktop Chrome` device profile), macOS. Firefox and WebKit give the same result.
  - **URL:** http://localhost:3000/ → Products, and → Cart
  - **Failing Test Spec:** `tests/cart.spec.ts` › Quantity boundary (min 1):
    - `[TC-CART-NEG-01] Cart quantity 0 is rejected and the item keeps quantity 1`
    - `[TC-CART-NEG-01] Cart quantity -1 is rejected and the item keeps quantity 1`
    - `[TC-CART-NEG-01b] Catalog quantity -2 is rejected and nothing is added`

- **Severity:** High
  - **Justification:** A cart with a negative item count, line total and order total ($-111.99) is invalid order data. Combined with the other cart defects it corrupts the order amount, and there is no validation to stop it.

- **Steps to Reproduce:**
  *A — in the cart*
  1. Open http://localhost:3000/ in a fresh browser window.
  2. Type `demo@techshop.com` in **Username** and `password123` in **Password**, then click **Sign In**.
  3. On the **Wireless Headphones** card, leave Qty at 1 and click **Add to Cart**.
  4. Click **Cart** in the top navigation bar.
  5. In the quantity box of the Wireless Headphones row, select the `1`, type `0`, then click outside the box.
  6. Repeat step 5 with `-1`.
  7. Click **Continue Shopping**, then **Cart** again, and read the row and the Order Summary.

  *B — in the catalog*
  1. Repeat steps 1–2 above in a fresh browser window.
  2. On the **Webcam HD 1080p** card, select the `1` in the **Qty** box and type `-2`.
  3. Click **Add to Cart**.
  4. Click **Cart** in the top navigation bar.

- **Expected Result:**
  The minimum quantity is 1. The requirement is "Increment/decrement quantity controls — minimum 1".
  - *A:* entering `0` or `-1` is rejected or corrected back to `1`. The row keeps quantity 1, the badge shows `1`, and the totals stay at one item.
  - *B:* `-2` is rejected. Nothing is added, the badge stays at `0`, and the cart stays empty.

- **Actual Result:**
  Both inputs are plain number boxes with no `min` attribute, and any integer is accepted:

  | Step | Qty box | Navbar badge | Line total | Subtotal | Total |
  |---|---|---|---|---|---|
  | A5 (`0`) | `0` | `0` | (unchanged, $88.19) | $88.19 | $93.18 |
  | A7 (after `-1`, cart reopened) | `-1` | `-1` | **$-88.19** | **$-88.19** | **$-83.20** |
  | B3 (`-2` from catalog) | — | `-2` | — | — | — |
  | B4 (cart) | `-2` | `-2` | **$-116.98** | **$-116.98** | **$-111.99** |

  - In B3, the toast "Webcam HD 1080p added to cart!" is shown even though the quantity is negative.
  - The **Proceed to Checkout** button stays enabled with a negative total.
  - No validation message is shown.
  - No console or page errors are logged.
  - The result is the same on every run and in all three browsers.

  *Developer hint (non-normative):*
  - `updateCartItemQty()` (`app.js:230`) assigns `parseInt(newQty)` with no lower bound.
  - `buggyAddToCart()` (`app.js:131`) adds `parseInt(qtyInput.value)` with no check.
  - Neither `<input type="number">` has `min="1"`.

- **Evidence:**
  - **Playwright Trace:** `test-results/cart-Cart-Quantity-boundar-fd67d-d-the-item-keeps-quantity-1-chromium/trace.zip` (qty 0). Others:
    - `test-results/cart-Cart-Quantity-boundar-58322-d-the-item-keeps-quantity-1-chromium/trace.zip` (qty -1)
    - `test-results/cart-Cart-Quantity-boundar-9b409-jected-and-nothing-is-added-chromium/trace.zip` (catalog -2)

    Regenerate with:
    ```bash
    npx playwright test tests/cart.spec.ts -g "TC-CART-NEG-01" --project=chromium --trace=on
    ```
  - **Screenshot / Artifact:** These were captured manually, because the suite's fixture context produces no automatic screenshot.
    - `bug-reports/BUG-cart-min-quantity-cart.png`: the cart row with Qty `0` still listed.
    - `bug-reports/BUG-cart-min-quantity-catalog.png`: the catalog with the cart badge at `-2`.
  - **Error Output / Failed Assertion:**
    ```text
    [chromium] › tests/cart.spec.ts:186 › Cart › Quantity boundary (min 1) ›
      [TC-CART-NEG-01] Cart quantity 0 is rejected and the item keeps quantity 1

    Error: expect(locator).toHaveValue(expected) failed

    Locator:  locator('.cart-item').filter({ hasText: 'Wireless Headphones' }).getByRole('spinbutton')
    Expected: "1"
    Received: "0"

    [TC-CART-NEG-01]  qty -1   Expected "1"  Received "-1"

    [chromium] › tests/cart.spec.ts:201 › [TC-CART-NEG-01b] Catalog quantity -2 is rejected and nothing is added
    Locator:  locator('#cart-count')
    Expected: "0"
    Received: "-2"
        14 × locator resolved to <span id="cart-count" class="cart-badge">-2</span>
    ```
    The negative totals in steps A7 and B4 come from following the Steps to Reproduce. The tests stop at the first assertion.
