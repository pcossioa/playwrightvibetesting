### [BUG-navbar-before-login] Navbar is shown on the login page, and its Products link opens the catalog without signing in

- **Environment:**
  - **App Version / Target:** TechShop `broken-app` (repo commit `1cfdd6d`), served locally
  - **Browser / Engine:** Chromium 156.0.8078.4 (Playwright 1.64.1, `Desktop Chrome` device profile), macOS. Firefox and WebKit give the same result.
  - **URL:** http://localhost:3000/ (login page)
  - **Failing Test Spec:** `tests/login.spec.ts` › Login › Before login › `[TC-AUTH-REG-04][TC-AUTH-EDGE-03] Navbar (and its Products link) is hidden before login`

- **Severity:** Critical
  - **Justification:** This is a second authentication bypass, separate from the Sign In defect. One click on "Products" opens the store without credentials, so fixing `buggyLogin()` alone would not secure the app.

- **Steps to Reproduce:**
  1. Open http://localhost:3000/ in a fresh browser window. Do not type anything.
  2. Look at the top of the page above the "Welcome back" login form.
  3. Click **Products** in the top bar. Clicking the **TechShop** logo or **Cart** has the same effect.

- **Expected Result:**
  Before login, only the login form is shown. The navbar, including the Products and Cart links, is hidden or disabled. No catalog or cart page can be reached until a valid login succeeds. The requirements say "Successful login redirects to product catalog", which makes login the only way in.

- **Actual Result:**
  - Step 2: the blue navbar "TechShop · Products · Cart 0" is visible above the "Welcome back" form.
  - Step 3: clicking **Products** opens the "Our Products" catalog, and the login form disappears. No credentials were entered. The user can add items and open the cart.

  The result is the same on every run and in all three browsers.

  *Developer hint (non-normative):*
  - The `<nav class="navbar">` in `techshop/broken-app/index.html:11-21` is always rendered.
  - Its links call `showPage('products')` and `showPage('cart')` directly.
  - `showPage()` (`app.js:49`) has no authentication check.

- **Evidence:**
  - **Playwright Trace:** `test-results/login-Login-Before-login-T-37417-link-is-hidden-before-login-chromium/trace.zip`. Regenerate with:
    ```bash
    npx playwright test tests/login.spec.ts -g "TC-AUTH-REG-04" --project=chromium --trace=on
    ```
  - **Screenshot / Artifact:** `bug-reports/BUG-navbar-before-login.png`: the login page with the navbar visible. It was captured manually, because the suite's fixture context produces no automatic screenshot.
  - **Error Output / Failed Assertion:**
    ```text
    [chromium] › tests/login.spec.ts:151 › Login › Before login ›
      [TC-AUTH-REG-04][TC-AUTH-EDGE-03] Navbar (and its Products link) is hidden before login

    Error: expect(locator).toBeHidden() failed

    Locator:  getByRole('navigation')
    Expected: hidden
    Received: visible
        14 × locator resolved to <nav class="navbar">…</nav>
    ```
    The test stops at the navbar assertion. The click-through in step 3 was confirmed manually.
