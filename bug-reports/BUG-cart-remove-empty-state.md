### [BUG-cart-remove-empty-state] Removing the last cart item leaves "Cart Items (1)", the old totals and an active Proceed to Checkout button instead of "Your cart is empty"

- **Environment:**
  - **App Version / Target:** TechShop `broken-app` (repo commit `1cfdd6d`), served locally
  - **Browser / Engine:** Chromium 156.0.8078.4 (Playwright 1.64.1, `Desktop Chrome` device profile), macOS. Firefox and WebKit give the same result.
  - **URL:** http://localhost:3000/ → Cart
  - **Failing Test Spec:** `tests/cart.spec.ts` › Quantity & totals › `[TC-CART-NEG-03] Removing the only item shows the empty state with no stale totals`

- **Severity:** Medium
  - **Justification:** A secondary cart function shows a misleading state: an empty cart with a $133.68 total and a live checkout button. Reopening the cart fixes it, so there is a workaround.

- **Steps to Reproduce:**
  1. Open http://localhost:3000/ in a fresh browser window.
  2. Type `demo@techshop.com` in **Username** and `password123` in **Password**, then click **Sign In**.
  3. On the **Mechanical Keyboard** card, leave Qty at 1 and click **Add to Cart**.
  4. Click **Cart** in the top navigation bar. One row is shown, with Subtotal $128.69 and Total $133.68.
  5. Click the red **Remove** button on the Mechanical Keyboard row.

- **Expected Result:**
  The cart switches to its empty state:
  - The message "Your cart is empty" is shown. This is the requirement "Empty cart message: 'Your cart is empty'".
  - No Order Summary, totals or Proceed to Checkout button are shown.
  - The navbar badge shows `0`.

- **Actual Result:**
  - The row disappears and the badge shows `0`, but nothing else changes.
  - The panel header still reads **"Cart Items (1)"**.
  - The Order Summary still shows Subtotal **$128.69**, Shipping $4.99 and Total **$133.68**.
  - **Proceed to Checkout** is still shown.
  - "Your cart is empty" is not shown.
  - The empty state appears only after leaving the cart and opening it again: **Continue Shopping**, then **Cart**.
  - No console or page errors are logged.
  - The result is the same on every run and in all three browsers.

  *Developer hint (non-normative):* `buggyRemoveFromCart()` (`techshop/broken-app/app.js:222-228`) updates `cart` and removes the row's DOM node, but it does not call `renderCart()`.

- **Evidence:**
  - **Playwright Trace:** `test-results/cart-Cart-Quantity-totals--4adb0--state-with-no-stale-totals-chromium/trace.zip`. Regenerate with:
    ```bash
    npx playwright test tests/cart.spec.ts -g "TC-CART-NEG-03" --project=chromium --trace=on
    ```
  - **Screenshot / Artifact:** `bug-reports/BUG-cart-remove-empty-state.png`: the cart after Remove, with "Cart Items (1)", no rows and Total $133.68. It was captured manually, because the suite's fixture context produces no automatic screenshot.
  - **Error Output / Failed Assertion:**
    ```text
    [chromium] › tests/cart.spec.ts:150 › Cart › Quantity & totals ›
      [TC-CART-NEG-03] Removing the only item shows the empty state with no stale totals

    Error: expect(locator).toBeVisible() failed

    Locator: getByText('Your cart is empty.')
    Expected: visible
    Error: element(s) not found
    ```
    Before this failure, the test's checks that the badge shows `0` and that no rows remain both passed.
