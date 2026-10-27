### [BUG-cart-totals-stale] Changing an item's quantity in the cart does not update its line total, subtotal or order total

- **Environment:**
  - **App Version / Target:** TechShop `broken-app` (repo commit `1cfdd6d`), served locally
  - **Browser / Engine:** Chromium 156.0.8078.4 (Playwright 1.64.1, `Desktop Chrome` device profile), macOS. Firefox and WebKit give the same result.
  - **URL:** http://localhost:3000/ → Cart
  - **Failing Test Spec:** `tests/cart.spec.ts`:
    - `Quantity & totals › [TC-CART-POS-03] Increasing quantity to 3 updates line total and order total`
    - `Quantity & totals › [TC-CART-POS-03b] Decreasing quantity from 3 to 2 lowers the order total`
    - `Quantity boundary (min 1) › [TC-CART-BVA-01] Quantity exactly 1 (lower valid boundary) is accepted`

- **Severity:** High
  - **Justification:** The cart shows wrong totals, an incorrect pricing calculation. After any quantity change, the amount the customer reviews before checkout no longer matches what they ordered.

- **Steps to Reproduce:**
  1. Open http://localhost:3000/ in a fresh browser window.
  2. Type `demo@techshop.com` in **Username** and `password123` in **Password**, then click **Sign In**.
  3. On the **USB-C Hub 7-in-1** card, leave Qty at 1 and click **Add to Cart**.
  4. Click **Cart** in the top navigation bar. Note the line total, Subtotal and Total.
  5. In the quantity box of the USB-C Hub row, select the `1`, type `3`, then click anywhere outside the box (or press Tab).
  6. Read the line total, Subtotal and Total again.

- **Expected Result:**
  As soon as the quantity changes, the cart re-calculates:
  - line total = unit price × 3
  - Subtotal = the sum of the line totals
  - Total = Subtotal + $4.99 shipping

  The requirement is "Cart shows: name, unit price, quantity, line total, order total". With the unit price the cart displays ($34.47 each), that gives a line total and Subtotal of **$103.41** and a Total of **$108.40**.

  (The unit price itself is wrong. That is tracked separately in `BUG-discount.md`. This report is only about totals not following the quantity.)

- **Actual Result:**
  The quantity box shows `3` and the navbar badge updates to `3`. But the cart amounts keep their old values:

  | | Before (qty 1) | After changing to 3 | Expected |
  |---|---|---|---|
  | Line total | $34.47 | **$34.47** | $103.41 |
  | Subtotal | $34.47 | **$34.47** | $103.41 |
  | Total | $39.46 | **$39.46** | $108.40 |

  The amounts are corrected only after leaving the cart and opening it again: click **Continue Shopping**, then **Cart**. Decreasing the quantity fails the same way. For Webcam HD 1080p, going from 3 to 2 keeps the line total at $175.47 instead of $116.98. Going from 2 to 1 on Wireless Headphones keeps the Total at $181.37 instead of $93.18. No console or page errors are logged. The result is the same on every run and in all three browsers.

  *Developer hint (non-normative):* `updateCartItemQty()` (`techshop/broken-app/app.js:230-234`) updates `cart` and the badge but never calls `renderCart()`. The Subtotal is also taken from the cached `_frozenTotal` (`app.js:160, 200`).

- **Evidence:**
  - **Playwright Trace:** `test-results/cart-Cart-Quantity-totals--d4b26--line-total-and-order-total-chromium/trace.zip` (POS-03). Others:
    - `test-results/cart-Cart-Quantity-totals--aebd4-to-2-lowers-the-order-total-chromium/trace.zip` (POS-03b)
    - `test-results/cart-Cart-Quantity-boundar-0acac--valid-boundary-is-accepted-chromium/trace.zip` (BVA-01)

    Regenerate with:
    ```bash
    npx playwright test tests/cart.spec.ts -g "TC-CART-POS-03|TC-CART-BVA-01" --project=chromium --trace=on
    ```
  - **Screenshot / Artifact:** `bug-reports/BUG-cart-totals-stale.png`: the cart with Qty `3` next to a line total of $34.47 and a Total of $39.46. It was captured manually, because the suite's fixture context produces no automatic screenshot.
  - **Error Output / Failed Assertion:**
    ```text
    [chromium] › tests/cart.spec.ts:108 › Cart › Quantity & totals ›
      [TC-CART-POS-03] Increasing quantity to 3 updates line total and order total

    Error: expect(locator).toHaveText(expected) failed

    Locator:  locator('.cart-item').filter({ hasText: 'USB-C Hub 7-in-1' }).locator('.cart-item-subtotal')
    Expected: "$103.41"
    Received: "$34.47"
        14 × locator resolved to <div class="cart-item-subtotal">$34.47</div>

    [TC-CART-POS-03b]  line total  Expected "$116.98"  Received "$175.47"
    [TC-CART-BVA-01]   #cart-total Expected "$93.18"   Received "$181.37"
    ```
