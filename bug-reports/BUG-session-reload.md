### [BUG-session-reload] Reloading the page after login logs the user out and empties the cart

- **Environment:**
  - **App Version / Target:** TechShop `broken-app` (repo commit `1cfdd6d`), served locally. The reference `fixed-app` has the same failure.
  - **Browser / Engine:** Chromium 156.0.8078.4 (Playwright 1.64.1, `Desktop Chrome` device profile), macOS. Firefox and WebKit give the same result.
  - **URL:** http://localhost:3000/
  - **Failing Test Spec:** `tests/login.spec.ts` › Login › Positive › `[TC-AUTH-POS-03] Session persists across a page reload`

- **Severity:** Medium
  - **Justification:** A secondary requirement fails, and the workaround is easy: log in again. But any refresh, including an accidental one, signs the user out and loses the cart.

- **Steps to Reproduce:**
  1. Open http://localhost:3000/ in a fresh browser window.
  2. Type `demo@techshop.com` in **Username** and `password123` in **Password**, then click **Sign In**. The "Our Products" catalog is shown.
  3. Optional: click **Add to Cart** on any product. The cart badge shows 1.
  4. Reload the page with the browser Reload button, F5 or Cmd+R.

- **Expected Result:**
  The user is still signed in after the reload, and the "Our Products" catalog is shown. The requirement is "Session persists for the browser session". The cart contents are kept too, under "Cart state persists within session only".

- **Actual Result:**
  After the reload the "Welcome back" login page is shown, and "Our Products" is hidden. The user has to sign in again, and the cart badge is back to 0. No console or page errors are logged. The result is the same on every run and in all three browsers.

  *Note for triage:* the reference `fixed-app` fails this test too. `requirements.md` → *Technical Context* says "Cart state in JavaScript variables — not persisted", which seems to contradict the Login requirement. The product owner should confirm the intended behaviour before this is assigned.

  *Developer hint (non-normative):* login state is never stored. There is no `sessionStorage` or cookie, and `app.js` ends with an unconditional `showPage('login')` on every page load.

- **Evidence:**
  - **Playwright Trace:** `test-results/login-Login-Positive-TC-AU-fc81f-rsists-across-a-page-reload-chromium/trace.zip`. Regenerate with:
    ```bash
    npx playwright test tests/login.spec.ts -g "TC-AUTH-POS-03" --project=chromium --trace=on
    ```
  - **Screenshot / Artifact:** `bug-reports/BUG-session-reload.png`: the login page shown immediately after reloading a signed-in session. It was captured manually, because the suite's fixture context produces no automatic screenshot.
  - **Error Output / Failed Assertion:**
    ```text
    [chromium] › tests/login.spec.ts:43 › Login › Positive ›
      [TC-AUTH-POS-03] Session persists across a page reload

    Error: expect(locator).toBeVisible() failed

    Locator:  getByRole('heading', { name: 'Our Products' })
    Expected: visible
    Error: element(s) not found

      > 49 |       await expect(loginPage.productsHeading).toBeVisible();   // after page.reload()
    ```
