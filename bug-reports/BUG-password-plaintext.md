### [BUG-password-plaintext] Password input displays entered characters in plain text

- **Environment:**
  - **App Version / Target:** TechShop `broken-app` (repo commit `1cfdd6d`), served locally
  - **Browser / Engine:** Chromium 156.0.8078.4 (Playwright 1.64.1, `Desktop Chrome` device profile), macOS. Firefox and WebKit give the same result.
  - **URL:** http://localhost:3000/ (login page)
  - **Failing Test Spec:** `tests/login.spec.ts` › Login › Positive › `[TC-AUTH-POS-02][TC-AUTH-REG-01] Password field masks input`

- **Severity:** High
  - **Justification:** A primary security requirement fails. Every user's password is readable on screen by anyone nearby, and by screen recordings and screenshots.

- **Steps to Reproduce:**
  1. Open http://localhost:3000/ in a fresh browser window. The "Welcome back" login page is shown.
  2. Click the **Password** field and type `password123`.
  3. Look at the Password field.

- **Expected Result:**
  Each typed character is masked, shown as `•` dots, and the input is `type="password"`. The requirement is "Password field must mask input characters".

- **Actual Result:**
  The field shows `password123` in clear text. The element is `<input type="text" id="login-pass" placeholder="Enter password">`. The result is the same on every run and in all three browsers.

  *Developer hint (non-normative):* `techshop/broken-app/index.html:34` declares the input as `type="text"`.

- **Evidence:**
  - **Playwright Trace:** `test-results/login-Login-Positive-TC-AU-c8787--Password-field-masks-input-chromium/trace.zip`. Regenerate with:
    ```bash
    npx playwright test tests/login.spec.ts -g "TC-AUTH-POS-02" --project=chromium --trace=on
    ```
  - **Screenshot / Artifact:** `bug-reports/BUG-password-plaintext.png`: the login form with `password123` readable in the Password field. It was captured manually, because the suite's fixture context produces no automatic screenshot.
  - **Error Output / Failed Assertion:**
    ```text
    [chromium] › tests/login.spec.ts:39 › Login › Positive ›
      [TC-AUTH-POS-02][TC-AUTH-REG-01] Password field masks input

    Error: expect(locator).toHaveAttribute(expected) failed

    Locator:  getByLabel('Password')
    Expected: "password"
    Received: "text"
        14 × locator resolved to <input type="text" id="login-pass" placeholder="Enter password"/>
    ```
