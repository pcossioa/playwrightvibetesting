### [BUG-checkout-blocked] Proceed to Checkout button does not respond to click; no order can be placed

- **Environment:**
  - **App Version / Target:** TechShop `broken-app` (repo commit `1cfdd6d`), served locally
  - **Browser / Engine:** Chromium 156.0.8078.4 (Playwright 1.64.1, `Desktop Chrome` device profile), macOS. Firefox and WebKit give the same result.
  - **URL:** http://localhost:3000/ → Cart
  - **Failing Test Spec:** `tests/checkout.spec.ts`. All 14 tests fail in the shared `checkout` fixture with `BLOCKER: "Proceed to Checkout" did not open the checkout page`:
    - `[TC-CHK-NEG-01]` empty form
    - Expiry: `[TC-CHK-EDGE-03a]`, `[TC-CHK-EDGE-03b]`, `[TC-CHK-NEG-05]`, `[TC-CHK-EDGE-06]`, `[TC-CHK-EDGE-06b]`, `[TC-CHK-NEG-05b]`
    - CVV: `[TC-CHK-CVV-01]`, `[TC-CHK-NEG-06a]`, `[TC-CHK-NEG-06b]`, `[TC-CHK-NEG-06c]`, `[TC-CHK-NEG-10]`, `[TC-CHK-NEG-08]`
    - `[TC-CHK-POS-01]` order confirmation

- **Severity:** Critical
  - **Justification:** The checkout feature is completely blocked with no workaround. No customer can place an order, and every checkout validation is untestable.

- **Steps to Reproduce:**
  1. Open http://localhost:3000/ in a fresh browser window.
  2. Type `demo@techshop.com` in **Username** and `password123` in **Password**, then click **Sign In**.
  3. On the **Wireless Headphones** card, leave Qty at 1 and click **Add to Cart**.
  4. Click **Cart** in the top navigation bar. The cart shows one item, with Total $93.18.
  5. Click the blue **Proceed to Checkout** button in the Order Summary. Wait a few seconds, and click it again if you want.

- **Expected Result:**
  The Checkout page opens, with the "Checkout" heading and the form fields First Name, Last Name, Email, Phone, Card Number, Expiry Date and CVV. The requirement is "Accessible via 'Proceed to Checkout' button in cart".

- **Actual Result:**
  - Nothing happens: the cart page stays on screen unchanged and the "Checkout" heading never appears.
  - The URL stays `http://localhost:3000/`.
  - No message, toast or error is shown, and no page errors are logged. The only console error is an unrelated product-image request that returned HTTP 500 (`loremflickr.com`). The reference app loads the same image URL and checks out fine.
  - The result is the same on every click, every run and all three browsers.

  *Developer hint (non-normative):* the button's handler `proceedToCheckoutBuggy()` (`techshop/broken-app/app.js:236-238`) only does `return false;`; it never calls `showPage('checkout')`. `renderCheckoutSummary()` (`app.js:243`) is also empty, so the checkout summary needs checking once navigation is fixed.

  *Not yet testable (re-test after the fix):*
  - Expiry and CVV validation (`[TC-CHK-EDGE-03b]`, `[TC-CHK-NEG-05]`, `[TC-CHK-EDGE-06]`, `[TC-CHK-EDGE-06b]`, `[TC-CHK-NEG-06c]`): these fail against the reference `fixed-app`, so they are likely to surface as separate bugs once checkout is reachable.
  - Order confirmation (`[TC-CHK-POS-01]`).

- **Evidence:**
  - **Playwright Trace:** `test-results/checkout-Checkout-Confirma-d72be-r-reference-items-and-total-chromium/trace.zip` (POS-01). Another:
    - `test-results/checkout-Checkout-Empty-fo-994ff-ror-on-every-required-field-chromium/trace.zip` (NEG-01)

    Regenerate with:
    ```bash
    npx playwright test tests/checkout.spec.ts --project=chromium --trace=on
    ```
  - **Screenshot / Artifact:** `bug-reports/BUG-checkout-blocked.png`: the cart page still shown 1.5 s after clicking Proceed to Checkout. It was captured manually, because the suite's fixture context produces no automatic screenshot.
  - **Error Output / Failed Assertion:**
    ```text
    [chromium] › tests/checkout.spec.ts:170 › Checkout › Confirmation ›
      [TC-CHK-POS-01] Valid order shows confirmation with order reference, items and total

    Error: BLOCKER: "Proceed to Checkout" did not open the checkout page

    Locator: getByRole('heading', { name: 'Checkout', exact: true })
    Expected: visible
    Error: element(s) not found
    ```
    The same failure appears in all 14 tests listed above.
