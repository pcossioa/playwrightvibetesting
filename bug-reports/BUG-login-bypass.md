### [BUG-login-bypass] Sign In opens the product catalog for any credentials, including empty fields and a wrong password

- **Environment:**
  - **App Version / Target:** TechShop `broken-app` (repo commit `1cfdd6d`), served locally
  - **Browser / Engine:** Chromium 156.0.8078.4 (Playwright 1.64.1, `Desktop Chrome` device profile), macOS. Firefox and WebKit give the same result.
  - **URL:** http://localhost:3000/ (login page)
  - **Failing Test Spec:** `tests/login.spec.ts`. 11 tests fail at the same assertion, which expects the login page to still be shown:
    - Empty fields:
      - `[TC-AUTH-NEG-01][TC-AUTH-REG-02] Both fields empty → both fields flagged`
      - `[TC-AUTH-NEG-02] Username empty, password filled → username flagged`
      - `[TC-AUTH-NEG-03][TC-AUTH-EDGE-06] Username filled, password empty → password flagged`
      - `[TC-AUTH-NEG-09] Whitespace-only username is treated as empty`
    - Wrong credentials:
      - `[TC-AUTH-NEG-04][TC-AUTH-REG-03] wrong password → invalid-credentials error`
      - `[TC-AUTH-NEG-05] unregistered email → invalid-credentials error`
      - `[TC-AUTH-EDGE-02] password in wrong case → invalid-credentials error`
      - `[TC-AUTH-EDGE-05] password + 117 extra chars (128 total) → invalid-credentials error`
    - Email format:
      - `[TC-AUTH-NEG-06] Email missing "@" is rejected`
      - `[TC-AUTH-NEG-07] Email missing TLD is rejected`
      - `[TC-AUTH-NEG-08] Email not an email ("admin") is rejected`
      - `[TC-AUTH-NEG-11] Email illegal comma is rejected`

- **Severity:** Critical
  - **Justification:** Authentication bypass. Anyone can reach the store and the cart without valid credentials, and the login form never rejects anything.

- **Steps to Reproduce:**
  1. Open http://localhost:3000/ in a fresh browser window. The "Welcome back" login page is shown.
  2. Type `demo@techshop.com` in **Username** and `wrongpassword999` in **Password**.
  3. Click **Sign In**.
  4. Reload the page so you are back on "Welcome back". Leave both fields empty and click **Sign In**.
  5. Optional: repeat with Username `nonexistent@techshop.com` / Password `password123`, or Username `admin` / Password `x`.

- **Expected Result:**
  Each attempt is refused, and the user stays on the "Welcome back" login page:
  - Step 3: the error "Invalid username or password" is shown. The requirement is "Failed login shows error message, stays on login page".
  - Step 4: both fields are flagged as required. The requirement is "Empty fields must be rejected with an error message".
  - Step 5: invalid emails are rejected. The requirement is "Email must be valid format (contains @ and domain)".

  Only `demo@techshop.com` / `password123` opens the "Our Products" catalog.

- **Actual Result:**
  Every attempt in steps 3–5 opens the "Our Products" catalog. The "Welcome back" heading is hidden, and no error message or field error is shown (`#login-error` stays hidden). The navbar shows Products and Cart (0), and the user can add items to the cart. No console or page errors are logged. The result is the same on every run and in all three browsers.

  *Developer hint (non-normative):* `techshop/broken-app/app.js:78-90`, `buggyLogin()`, calls `showPage('products')` in **both** the failure branch and the success branch. It also has no empty-field or email-format check. Note that `VALID_USERS` includes `'admin'`, which is not a valid email.

- **Evidence:**
  - **Playwright Trace:** `test-results/login-Login-Wrong-credenti-7cc78-→-invalid-credentials-error-chromium/trace.zip` (wrong password). Others:
    - `test-results/login-Login-Empty-fields-T-cf11b-empty-→-both-fields-flagged-chromium/trace.zip` (empty form)
    - `test-results/login-Login-Email-format-T-3b325--an-email-admin-is-rejected-chromium/trace.zip` ("admin")

    Regenerate with:
    ```bash
    npx playwright test tests/login.spec.ts --project=chromium --trace=on
    ```
  - **Screenshot / Artifact:** `bug-reports/BUG-login-bypass.png`: the catalog shown after signing in with a wrong password. It was captured manually, because the suite's custom fixture opens its own context, so Playwright's automatic failure screenshot is not produced.
  - **Error Output / Failed Assertion:**
    ```text
    [chromium] › tests/login.spec.ts:106 › Login › Wrong credentials ›
      [TC-AUTH-NEG-04][TC-AUTH-REG-03] wrong password → invalid-credentials error

    Error: expect(locator).toBeVisible() failed

    Locator:  getByRole('heading', { name: 'Welcome back' })
    Expected: visible
    Error: element(s) not found

      at expectStillOnLogin (tests/login.spec.ts:20)
    ```
    The same failure appears in all 11 tests listed above.
