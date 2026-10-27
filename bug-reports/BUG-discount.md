### [BUG-discount] Discounted price applies only one tenth of the advertised discount (20% OFF on $89.99 shows $88.19 instead of $71.99)

- **Environment:**
  - **App Version / Target:** TechShop `broken-app` (repo commit `1cfdd6d`), served locally
  - **Browser / Engine:** Chromium 156.0.8078.4 (Playwright 1.64.1, `Desktop Chrome` device profile), macOS. The other configured engines (Firefox and WebKit) show the same values.
  - **URL:** http://localhost:3000/ (log in, then go to the Products catalog and the Cart)
  - **Failing Test Spec:** `tests/cart.spec.ts` › Cart › Discount calculation › `[TC-CAT-EDGE-01]`. All 4 parametrised cases fail:
    - `Wireless Headphones: 20% off $89.99 is $71.99 in catalog and cart`
    - `USB-C Hub 7-in-1: 15% off $34.99 is $29.74 in catalog and cart`
    - `Mechanical Keyboard: 10% off $129.99 is $116.99 in catalog and cart`
    - `Webcam HD 1080p: 25% off $59.99 is $44.99 in catalog and cart`

- **Severity:** High
  - **Justification:** Every product in the store is priced wrong, and customers are charged more than the discount advertised on the same card. On a 1× Wireless Headphones order they overpay $16.20, and there is no workaround.

- **Steps to Reproduce:**
  1. Open http://localhost:3000/ in a fresh browser window. The login page "Welcome back" is shown.
  2. Type `demo@techshop.com` in **Username** and `password123` in **Password**, then click **Sign In**. The "Our Products" catalog opens.
  3. Find the **Wireless Headphones** card. It shows the original price **$89.99** struck through and a green **20% OFF** badge. Read the large blue discounted price next to them.
  4. Click **Add to Cart** on the Wireless Headphones card. Leave Qty at 1.
  5. Click **Cart** in the top navigation bar.
  6. Read the unit price ("… each"), the line total and the Order Summary.
  7. Optional: repeat step 3 for the other cards: USB-C Hub 7-in-1 ($34.99, 15% OFF), Mechanical Keyboard ($129.99, 10% OFF), Webcam HD 1080p ($59.99, 25% OFF).

- **Expected Result:**
  The discounted price is the original price minus the advertised percentage: `price × (1 − discount / 100)`, rounded to cents. This is the rule in `test-cases.md`, TC-CAT-POS-04 and TC-CAT-EDGE-01. The same discounted unit price is used in the catalog, the cart line, and the Order Summary.

  | Product | Original | Discount | Expected price |
  |---|---|---|---|
  | Wireless Headphones | $89.99 | 20% | **$71.99** |
  | USB-C Hub 7-in-1 | $34.99 | 15% | **$29.74** |
  | Mechanical Keyboard | $129.99 | 10% | **$116.99** |
  | Webcam HD 1080p | $59.99 | 25% | **$44.99** |

  For Wireless Headphones × 1 the cart shows "$71.99 each", a line total of $71.99, a Subtotal of $71.99, Shipping of $4.99 and a **Total of $76.98**.

- **Actual Result:**
  Every discounted price takes off only one tenth of the advertised percentage. The 20% OFF badge takes off 2%, 15% takes off 1.5%, and so on. The wrong price is shown on the catalog card (`<span class="price-discounted">`), even though the "20% OFF" badge and the struck-through original price are correct. The same wrong price then carries into the cart and the order total:

  | Product | Expected | Shown | Discount actually applied |
  |---|---|---|---|
  | Wireless Headphones | $71.99 | **$88.19** | 2% |
  | USB-C Hub 7-in-1 | $29.74 | **$34.47** | 1.5% |
  | Mechanical Keyboard | $116.99 | **$128.69** | 1% |
  | Webcam HD 1080p | $44.99 | **$58.49** | 2.5% |

  For Wireless Headphones × 1, the cart shows "$88.19 each", a line total of $88.19, a Subtotal of $88.19, Shipping of $4.99 and a **Total of $93.18**. That is $16.20 more than expected.

  The result is deterministic:
  - Every run shows the same values: 8/8 runs across Chromium, Firefox and WebKit, plus `--repeat-each=5`.
  - No page errors were logged.
  - The reference `fixed-app` passes all 4 cases.

  *Developer hint (non-normative):* `techshop/broken-app/app.js:92-94`, `calcDiscountedBuggy()`, computes `price * (1 - discountPct / 1000)`. It divides by 1000 instead of 100. The function is called by the catalog (`app.js:100`), the cart subtotal (`app.js:156`) and the cart line (`app.js:184`). That explains why all three are wrong in the same way.

- **Evidence:**
  - **Playwright Trace:** `test-results/cart-Cart-Discount-calcula-759cf-s-71-99-in-catalog-and-cart-chromium/trace.zip` (Wireless Headphones). Open it with `npx playwright show-trace <path>`. Sibling traces:
    - `test-results/cart-Cart-Discount-calcula-7d502-s-29-74-in-catalog-and-cart-chromium/trace.zip` (USB-C Hub)
    - `test-results/cart-Cart-Discount-calcula-182e7--116-99-in-catalog-and-cart-chromium/trace.zip` (Mechanical Keyboard)
    - `test-results/cart-Cart-Discount-calcula-db398-s-44-99-in-catalog-and-cart-chromium/trace.zip` (Webcam HD 1080p)

    `test-results/` is regenerated on every run. Regenerate the traces with:
    ```bash
    npx playwright test tests/cart.spec.ts -g "TC-CAT-EDGE-01" --project=chromium --trace=on
    ```
  - **Screenshot / Artifact:** The suite's custom fixture opens its own browser context, so Playwright's automatic failure screenshot is not produced. These screenshots were captured manually from the same steps:
    - `bug-reports/BUG-discount-catalog.png`: catalog card showing ~~$89.99~~ **$88.19** next to a **20% OFF** badge.
    - `bug-reports/BUG-discount-cart.png`: cart showing "$88.19 each", Subtotal $88.19, Total $93.18.
    - Page snapshot at failure: `test-results/cart-Cart-Discount-calcula-759cf-s-71-99-in-catalog-and-cart-chromium/error-context.md`.
  - **Error Output / Failed Assertion:**
    ```text
    [chromium] › tests/cart.spec.ts:218:7 › Cart › Discount calculation ›
      [TC-CAT-EDGE-01] Wireless Headphones: 20% off $89.99 is $71.99 in catalog and cart

    Error: expect(locator).toHaveText(expected) failed

    Locator:  locator('.product-card').filter({ has: getByText('Wireless Headphones', { exact: true }) }).getByText(/^\$\d+\.\d{2}$/).last()
    Expected: "$71.99"
    Received: "$88.19"
    Timeout:  5000ms

    Call log:
      - waiting for locator('.product-card').filter({ has: getByText('Wireless Headphones', { exact: true }) }).getByText(/^\$\d+\.\d{2}$/).last()
        14 × locator resolved to <span class="price-discounted">$88.19</span>
           - unexpected value "$88.19"

    > 220 |         await expect(cart.catalogPrice(p.name)).toHaveText(usd(p.unit));
            at tests/cart.spec.ts:220:49

    Other cases, same assertion:
      USB-C Hub 7-in-1      Expected "$29.74"   Received "$34.47"
      Mechanical Keyboard   Expected "$116.99"  Received "$128.69"
      Webcam HD 1080p       Expected "$44.99"   Received "$58.49"
    ```
    The test stops at the catalog assertion. The cart values in **Actual Result** come from following the Steps to Reproduce and are shown in `BUG-discount-cart.png`.
