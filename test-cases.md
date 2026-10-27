# Updated Test‑Case Matrix (ensuring full Positive, Negative & Edge coverage)

**File:** `playwrightvibetesting/test-cases.md`

---

## 1️⃣ Feature : **Login**

### Feature Scope & Assumptions
- Uses credentials `demo@techshop.com / password123` (fallback env vars).
- UI is fully accessible: inputs located by label, buttons/links by role.
- The app currently **fails** many validation checks (see exploration notes); those are marked as **[Regression – Known Bug]**.

### Positive Test Cases
| ID | Title | Category | Status/Tag | Preconditions | Steps | Expected Result |
|----|-------|----------|-----------|----------------|-------|-----------------|
| **TC‑AUTH‑POS‑01** | Login succeeds with valid credentials and redirects to product catalog | Positive | Standard | App on login page, no session | 1. `loginPage.login(TEST_EMAIL, TEST_PASSWORD)` <br>2. Wait for navigation | Products heading visible, login heading hidden, URL contains `/products` |
| **TC‑AUTH‑POS‑02** | Password field masks input characters as bullets or dots | Positive | Standard | Login page displayed | 1. Locate `loginPage.passwordInput` <br>2. Verify `type="password"` attribute <br>3. Fill with any string, take screenshot (optional) | Input type remains `"password"`; characters not visible in UI |
| **TC‑AUTH‑POS‑03** | Authenticated session persists across browser page reload | Positive | Standard | Logged‑in on products page | 1. Login as in POS‑01 <br>2. `await page.reload()` <br>3. Verify headings | Products heading still visible, login heading hidden, session cookie retained |

### Negative Test Cases (including TechShop‑specific checks)
| ID | Title | Category | Status/Tag | Preconditions | Steps | Expected Result |
|----|-------|----------|-----------|----------------|-------|-----------------|
| **TC‑AUTH‑NEG‑01** | Login rejects submission when both fields are empty | Negative | Standard | Login page | 1. `loginPage.clickSignIn()` <br>2. Verify error UI | Login heading visible, products heading hidden, error alert *“All fields are required”* |
| **TC‑AUTH‑NEG‑02** | Login rejects submission when email is missing but password is provided | Negative | Standard | Login page | 1. Fill password only <br>2. Click Sign‑In | Error *“Email required”* |
| **TC‑AUTH‑NEG‑03** | Login rejects submission when email is provided but password is empty | Negative | Standard | Login page | 1. Fill email only <br>2. Click Sign‑In | Error *“Password required”* |
| **TC‑AUTH‑NEG‑04** | Login rejects incorrect password for a registered email | Negative | Standard | Login page | 1. `loginPage.login(TEST_EMAIL, 'wrongpassword999')` | Error *“Invalid credentials”* |
| **TC‑AUTH‑NEG‑05** | Login rejects unregistered user email | Negative | Standard | Login page | 1. `loginPage.login('nonexistent@techshop.com', TEST_PASSWORD)` | Error *“Invalid credentials”* |
| **TC‑AUTH‑NEG‑06** | Login rejects email missing the “@” symbol | Negative | Standard | Login page | 1. `loginPage.login('demo.techshop.com', TEST_PASSWORD)` | Error *“Invalid credentials”* |
| **TC‑AUTH‑NEG‑07** | Login rejects email missing a top‑level domain | Negative | Standard | Login page | 1. `loginPage.login('demo@techshop', TEST_PASSWORD)` | Error *“Invalid credentials”* |
| **TC‑AUTH‑NEG‑08** | Login rejects non‑email username string (e.g., “admin”) | Negative | **[Regression – Known Bug: “Username field accepts non‑email strings”]** | Login page | 1. `loginPage.login('admin', TEST_PASSWORD)` | Error *“Invalid credentials”* (currently passes) |
| **TC‑AUTH‑REG‑01** | Password field should mask input (type="password") | Regression | **[Regression – Known Bug: Password shown in plaintext]** | Login page | 1. Locate password input field, check `type` attribute is `password` | Input is masked, not visible as plaintext |
| **TC‑AUTH‑REG‑02** | Empty email and password should be rejected | Regression | **[Regression – Known Bug: Empty credentials accepted]** | Login page | 1. Click Sign In with both fields empty | Validation error displayed, login prevented |
| **TC‑AUTH‑REG‑03** | Wrong credentials must show error, not redirect to catalog | Regression | **[Regression – Known Bug: Wrong credentials redirect]** | Login page | 1. Attempt login with valid email and wrong password | Error message shown, remains on login page |
| **TC‑AUTH‑REG‑04** | Navbar should be hidden on login page before authentication | Regression | **[Regression – Known Bug: Navbar visible pre‑auth]** | Login page | 1. Verify navbar element is not visible | Navbar hidden until after successful login |

| **TC‑AUTH‑NEG‑09** | Login rejects whitespace‑only email / password fields | Negative | Standard | Login page | 1. Fill both inputs with spaces only <br>2. Click Sign‑In | Error *“All fields are required”* |
| **TC‑AUTH‑NEG‑10** | Login rejects email with leading/trailing spaces after trimming (should succeed) | Negative | Standard | Login page | 1. `loginPage.login('  ${TEST_EMAIL}  ', TEST_PASSWORD)` | Should succeed after trim – if not, fail |
| **TC‑AUTH‑NEG‑11** | Login rejects email containing illegal characters (e.g., commas) | Negative | Standard | Login page | 1. `loginPage.login('demo,shop@techshop.com', TEST_PASSWORD)` | Error *“Invalid email format”* |

### Edge & Boundary Test Cases
| ID | Title | Category | Status/Tag | Preconditions | Steps | Expected Result |
|----|-------|----------|-----------|----------------|-------|-----------------|
| **TC‑AUTH‑EDGE‑01** | Login trims leading and trailing whitespace on email (positive) | Edge | Standard | Login page | 1. `loginPage.login('  ${TEST_EMAIL}  ', TEST_PASSWORD)` | Successful login, products heading visible |
| **TC‑AUTH‑EDGE‑02** | Login enforces case‑sensitivity on password | Edge | Standard | Login page | 1. `loginPage.login(TEST_EMAIL, TEST_PASSWORD.toUpperCase())` | Failure as in NEG‑04 |
| **TC‑AUTH‑EDGE‑03** | Navigation to protected catalog via top navbar is restricted before login | Edge | Standard | Login page (not authenticated) | 1. Click `loginPage.navbarProductsLink` <br>2. Verify UI | Login heading visible, products heading hidden, error or redirection |
| **TC‑AUTH‑EDGE‑04** | Session persistence after closing and reopening the browser (same context) | Edge | Standard | Logged‑in on products page | 1. Login, close page, `await context.close()` <br>2. Re‑open new page with same context <br>3. Verify state | User remains on products page (session cookie retained) |
| **TC‑AUTH‑EDGE‑05** | Login with maximum allowed password length (128 chars) | Edge | Standard | Login page | 1. Generate 128‑character password <br>2. `loginPage.login(TEST_EMAIL, longPassword)` | Successful login (if app limits length, should still accept) |
| **TC‑AUTH‑EDGE‑06** | Login with password length 0 (empty) – already covered by NEG‑03, but explicit boundary check | Edge | Standard | Login page | 1. `loginPage.login(TEST_EMAIL, '')` | Error *“Password required”* |

---

## 2️⃣ Feature : **Catalog / Product Listing**

### Feature Scope & Assumptions
- Product grid displayed with cards containing name, price, image placeholder, “Add to Cart” button.
- Title should be **“TechShop — Products”** (currently broken).
- Out‑of‑stock products should show a badge and disabled button (currently missing).
- Discount rules: 20 % for electronics, 15 % for accessories (see requirements).

### Positive Test Cases
| ID | Title | Category | Status/Tag | Preconditions | Steps | Expected Result |
|----|-------|----------|-----------|----------------|-------|-----------------|
| **TC‑CAT‑POS‑01** | Catalog displays a grid of product cards on successful login | Positive | Standard | Logged‑in on products page | 1. Verify `page.locator('.product-card')` count > 0 | At least one product card visible |
| **TC‑CAT‑POS‑02** | Each product card shows name, price, image placeholder, and enabled “Add to Cart” button | Positive | Standard | Catalog displayed | 1. For the first card, assert `card.locator('.product-name')` has non‑empty text <br>2. Assert price element contains a currency format <br>3. Verify image has `src` attribute and non‑empty `alt` <br>4. Verify `Add to Cart` button is enabled | All four UI elements present and correct |
| **TC‑CAT‑POS‑03** | Page title matches spec “TechShop — Products” | Positive | **[Regression – Known Bug: Title is “Untitled”]** | Catalog displayed | 1. `await expect(page).toHaveTitle('TechShop — Products')` | Title matches (currently fails) |
| **TC‑CAT‑POS‑04** | Discount displayed on eligible product matches rule (20 % for electronics) | Positive | Standard | Catalog with known electronic product (price $100) | 1. Locate product card, read displayed price ($80) <br>2. Verify discount = 20 % of original | Correct discounted price shown |
| **TC‑CAT‑POS‑05** | Out‑of‑stock product shows badge and disabled “Add to Cart” button | Positive | **[Regression – Known Bug: Missing badge/button state]** | Catalog with at least one out‑of‑stock item (stock 0) | 1. Locate out‑of‑stock card <br>2. Verify badge text “Out of Stock” <br>3. Verify button `disabled` attribute | UI correctly indicates out‑of‑stock (currently fails) |

### Negative Test Cases (TechShop‑specific)
| ID | Title | Category | Status/Tag | Preconditions | Steps | Expected Result |
|----|-------|----------|-----------|----------------|-------|-----------------|
| **TC‑CAT‑NEG‑01** | Catalog does not expose out‑of‑stock badge or disabled button | Negative | **[Regression – Known Bug: No out‑of‑stock UI]** | Catalog displayed (with at least one out‑of‑stock product) | 1. Locate a product flagged as out‑of‑stock in data <br>2. Verify badge not present and button still enabled | Failure – UI missing required badge/disabled state |
| **TC‑CAT‑NEG‑02** | Images missing `alt` attribute cause accessibility failure | Negative | Standard | Catalog displayed | 1. For each product image, assert `hasAttribute('alt')` and non‑empty value | All images have proper alt text (currently fails for some) |
| **TC‑CAT‑NEG‑03** | Product price displays with incorrect currency symbol (e.g., `$` vs `€` for European locale) | Negative | Standard | Catalog displayed with locale set to EUR | 1. Verify price strings contain `€` when locale is EUR | Currency mismatch triggers failure |
| **TC‑CAT‑NEG‑04** | “Add to Cart” button is clickable when product is out‑of‑stock | Negative | **[Regression – Known Bug: Button enabled]** | Catalog with out‑of‑stock product | 1. Click “Add to Cart” on out‑of‑stock card <br>2. Verify no item added to cart | Button should be disabled – currently not |

### Edge & Boundary Test Cases
| ID | Title | Category | Status/Tag | Preconditions | Steps | Expected Result |
|----|-------|----------|-----------|----------------|-------|-----------------|
| **TC‑CAT‑EDGE‑01** | Discount calculation on product price respects 20 % / 15 % rules | Edge | **[Regression – Known Bug: Discount off by factor 10]** | Catalog displayed | 1. Read displayed discounted price for a known product (e.g., $89.99 original) <br>2. Compute expected discount (20 % → $71.99) <br>3. Compare | Displayed price is $88.19 (incorrect) – test fails |
| **TC‑CAT‑EDGE‑02** | Product description text wraps correctly inside card (no horizontal overflow) | Edge | Standard | Catalog displayed | 1. Locate a product with a long description <br>2. Capture bounding box of description element <br>3. Verify width ≤ card width | No overflow (currently passes) |
| **TC‑CAT‑EDGE‑03** | Catalog page loads within acceptable performance budget (≤ 2 s) | Edge | Standard | Direct navigation to `/products` via URL | 1. Measure `page.waitForLoadState('load')` timing <br>2. Assert duration ≤ 2000 ms | Load time within budget |
| **TC‑CAT‑EDGE‑04** | Pagination works correctly when product count exceeds page limit (e.g., > 20 items) | Edge | Standard | Catalog with 45 products (mocked or real) | 1. Verify first page shows 20 items <br>2. Click “Next” pagination <br>3. Verify next 20 items displayed, etc. | Pagination correct |
| **TC‑CAT‑EDGE‑05** | Sorting by price (ascending/descending) updates UI order accurately | Edge | Standard | Catalog displayed | 1. Select sort “Price: Low to High” <br>2. Capture first three product prices, ensure ascending <br>3. Repeat for “High to Low” | Sorting works as expected |

---

## 3️⃣ Feature : **Cart**

### Feature Scope & Assumptions
- Users can add products from catalog, adjust quantity, remove items, and see a running total.
- Minimum order value is $10; orders below should be rejected.
- Quantity cannot go below 1.
- Cart state is stored only in‑memory (no persistence).

### Positive Test Cases
| ID | Title | Category | Status/Tag | Preconditions | Steps | Expected Result |
|----|-------|----------|-----------|----------------|-------|-----------------|
| **TC‑CART‑POS‑01** | Adding a product to the cart updates badge counter | Positive | Standard | Logged‑in, catalog displayed | 1. Click “Add to Cart” on first product <br>2. Verify badge `#cart-count` shows “1” | Counter increments |
| **TC‑CART‑POS‑02** | Cart shows name, unit price, quantity, line total, and order total for a single item | Positive | Standard | Item added to cart | 1. Open cart view <br>2. Verify each column displays correct data (price × quantity) | All values correct |
| **TC‑CART‑POS‑03** | Incrementing quantity updates line total and order total | Positive | Standard | Cart with 1 item, quantity 1 | 1. Increase quantity to 3 (via UI control) <br>2. Verify line total = unit × 3 <br>3. Verify order total reflects change | Totals updated |
| **TC‑CART‑POS‑04** | Removing the sole item clears cart and shows empty‑cart message | Positive | Standard | Cart with one item | 1. Click “Remove” on that item <br>2. Verify cart list empty <br>3. Verify text “Your cart is empty” displayed | Empty state shown |
| **TC‑CART‑POS‑05** | Order total ≥ $10 allows proceeding to checkout button (when functional) | Positive | Standard | Cart total ≥ $10 | 1. Verify “Proceed to Checkout” button enabled (if it were functional) | Button enabled |
| **TC‑CART‑POS‑06** | Cart persists across navigation to other pages (e.g., back to catalog) within same session | Positive | Standard | Cart with items, on cart page | 1. Navigate to catalog via navbar <br>2. Return to cart <br>3. Verify items still present | Cart state retained |

### Negative Test Cases (including TechShop‑specific edge failures)
| ID | Title | Category | Status/Tag | Preconditions | Steps | Expected Result |
|----|-------|----------|-----------|----------------|-------|-----------------|
| **TC‑CART‑NEG‑01** | Cart allows quantity 0 or negative values (should be blocked) | Negative | **[Regression – Known Bug: Quantity not enforced]** | Cart with item | 1. Edit quantity input to `0` and submit <br>2. Verify cart badge becomes `0` | Bad behavior – test fails |
| **TC‑CART‑NEG‑02** | Cart totals do not recalculate when quantity changes | Negative | **[Regression – Known Bug: Totals frozen]** | Cart with item, quantity 1 | 1. Change quantity to 3 <br>2. Verify order total remains unchanged | Totals unchanged – test fails |
| **TC‑CART‑NEG‑03** | Removing an item does not clear order total (stale totals shown) | Negative | **[Regression – Known Bug: Stale totals]** | Cart with one item | 1. Click “Remove” <br>2. Verify total still shows previous amount | Stale total displayed – test fails |
| **TC‑CART‑NEG‑04** | Cart state is lost on page reload (should persist for session) | Negative | **[Regression – Known Bug: No persistence]** | Cart with items, page loaded | 1. Reload page <br>2. Verify cart badge resets to `0` | State lost – test fails |
| **TC‑CART‑NEG‑05** | Orders under $10.00 are accepted (should be rejected) | Negative | **[Regression – Known Bug: No min‑order validation]** | Cart with total `$8.00` | 1. Attempt to proceed to checkout (button functional) <br>2. Verify error message “Minimum order value is $10.00” appears (currently absent) | Order proceeds – test fails |
| **TC‑CART‑NEG‑06** | Adding the same product twice creates duplicate line items instead of incrementing quantity | Negative | **[Regression – Known Bug: Duplicate line items]** | Catalog displayed, empty cart | 1. Click “Add to Cart” for product A twice <br>2. Open cart, verify only one line for product A with quantity 2 | Duplicate lines appear – test fails |
| **TC‑CART‑NEG‑07** | Removing an item while another item is being edited causes UI race (flashing/error) | Negative | Standard | Cart with two items, both quantity inputs editable | 1. Click “Remove” on item 1 while editing quantity of item 2 <br>2. Verify no UI errors, second item remains correctly | Should handle concurrent actions without error |
| **TC‑CART‑NEG‑08** | Adding product with price zero creates zero‑value line item (should be blocked) | Negative | Standard | Catalog displayed | 1. Add product whose price is $0.00 <br>2. Verify cart does not accept it or shows warning | Zero‑value items rejected |

### Edge & Boundary Test Cases
| ID | Title | Category | Status/Tag | Preconditions | Steps | Expected Result |
|----|-------|----------|-----------|----------------|-------|-----------------|
| **TC‑CART‑EDGE‑01** | Adding the maximum allowed quantity (e.g., 99) updates totals correctly | Edge | Standard | Cart empty | 1. Add product, set quantity to 99 <br>2. Verify line total = unit × 99, order total matches | Correct calculation |
| **TC‑CART‑EDGE‑02** | Rapid double‑click on “Add to Cart” does not create duplicate entries (debounce) | Edge | Standard | Catalog displayed | 1. Double‑click “Add to Cart” quickly <br>2. Verify only one line appears, badge shows “1” | No duplicate entries |
| **TC‑CART‑EDGE‑03** | Removing the last item triggers the empty‑cart UI instantly (no flicker) | Edge | Standard | Cart with 1 item | 1. Click “Remove” <br>2. Verify empty‑cart message appears within 500 ms | Immediate UI update |
| **TC‑CART‑EDGE‑04** | Cart badge updates correctly after a full page reload when persistence were fixed (future regression) | Edge | Planned Regression (once persistence added) | Cart with items, reload | 1. Reload page <br>2. Verify badge shows correct count | Expected behavior after fix |
| **TC‑CART‑EDGE‑05** | Quantity input enforces numeric only (rejects letters, symbols) | Edge | Standard | Cart with item | 1. Enter `abc` into quantity field <br>2. Submit/change focus | Validation error “Quantity must be numeric” |
| **TC‑CART‑EDGE‑06** | Quantity accepts maximum integer value without overflow (e.g., 2,147,483,647) | Edge | Standard | Cart empty | 1. Add product, set quantity to `2147483647` <br>2. Verify UI does not crash, totals computed (may be capped) | System handles extreme quantity gracefully |

---

## 4️⃣ Feature : **Checkout**

### Feature Scope & Assumptions
- Accessible via “Proceed to Checkout” button (currently broken).
- Form fields: First Name, Last Name, Email, Phone, Card Number, Expiry Date, CVV.
- All fields required; each has strict format rules (see requirements).
- Success page must display order reference, item list, and total.

### Positive Test Cases
| ID | Title | Category | Status/Tag | Preconditions | Steps | Expected Result |
|----|-------|----------|-----------|----------------|-------|-----------------|
| **TC‑CHK‑POS‑01** | Checkout succeeds with fully valid data and shows confirmation with order reference | Positive | Standard | Logged‑in, cart total ≥ $10, on checkout page (forced) | 1. Fill every field with valid data (e.g., email `john@example.com`, card `4242 4242 4242 4242`, expiry future, CVV `123`) <br>2. Click “Place Order” | Confirmation page shows an order reference number, item list, and correct total amount |
| **TC‑CHK‑POS‑02** | Checkout form fields are correctly labeled for accessibility | Positive | Standard | Checkout page displayed | 1. Verify each input has a matching `<label for="...">` element | All labels correctly associated (currently missing – regression) |
| **TC‑CHK‑POS‑03** | Checkout page displays a progress indicator while processing payment | Positive | Standard | Checkout page with valid data | 1. Click “Place Order” <br>2. Verify a spinner or progress bar appears until response | UI shows loading state, then success page |

### Negative Test Cases (including TechShop‑specific validation)
| ID | Title | Category | Status/Tag | Preconditions | Steps | Expected Result |
|----|-------|----------|-----------|----------------|-------|-----------------|
| **TC‑CHK‑NEG‑01** | Empty form submission is rejected with per‑field validation errors | Negative | Standard | Checkout page | 1. Click “Place Order" with all fields empty | Each required field shows an error message (e.g., “First name required”) |
| **TC‑CHK‑NEG‑02** | Invalid email format is rejected | Negative | Standard | Checkout page | 1. Fill email with `invalid-email` <br>2. Fill other fields correctly <br>3. Submit | Email field shows “Invalid email format” |
| **TC‑CHK‑NEG‑03** | Card number with fewer than 16 digits is rejected | Negative | Standard | Checkout page | 1. Fill card number with `1234` <br>2. Fill other fields correctly <br>3. Submit | Card field shows “Card number must be 16 digits” |
| **TC‑CHK‑NEG‑04** | Phone number with fewer than 10 digits is rejected | Negative | Standard | Checkout page | 1. Fill phone with `123` <br>2. Submit | Phone field shows “Phone must be 10 digits” |
| **TC‑CHK‑NEG‑05** | Expiry date in the past is rejected | Negative | Standard | Checkout page | 1. Fill expiry `01/20` (past) <br>2. Submit | Expiry field shows “Date cannot be in the past” |
| **TC‑CHK‑NEG‑06** | CVV with incorrect length (1 or 4 digits) is rejected | Negative | Standard | Checkout page | 1. Fill CVV `1` (or `1234`) <br>2. Submit | CVV field shows “CVV must be 3 digits” |
| **TC‑CHK‑NEG‑07** | Checkout button is disabled when cart total < $10 | Negative | **[Regression – Known Bug: Button always enabled]** | Cart with total $8 | 1. Verify “Proceed to Checkout” button state | Button should be disabled (currently not) |
| **TC‑CHK‑NEG‑08** | Checkout form submits successfully even when a required field is missing (e.g., no CVV) | Negative | **[Regression – Known Bug: No validation]** | Checkout page | 1. Fill all fields except CVV <br>2. Submit | Form should block; currently succeeds |
| **TC‑CHK‑NEG‑09** | Card number containing non‑numeric characters is rejected | Negative | Standard | Checkout page | 1. Fill card number `4242 4242 4242 ABCD` <br>2. Submit | Card field shows “Card number must contain only digits” |
| **TC‑CHK‑NEG‑10** | CVV contains letters is rejected | Negative | Standard | Checkout page | 1. Fill CVV `12A` <br>2. Submit | CVV field shows “CVV must contain only digits” |
| **TC‑CHK‑NEG‑11** | Email with leading/trailing spaces is trimmed and accepted (negative if not trimmed) | Negative | Standard | Checkout page | 1. Fill email `  john@example.com  ` <br>2. Submit | Should succeed after trim; if not trimmed, error shown |
| **TC‑CHK‑NEG‑12** | Duplicate order submission on network retry creates two orders | Negative | Standard | Checkout page with valid data (order in progress) | 1. Click “Place Order", simulate network retry/resend <br>2. Verify only one order reference created | Idempotent behavior enforced |

### Edge & Boundary Test Cases
| ID | Title | Category | Status/Tag | Preconditions | Steps | Expected Result |
|----|-------|----------|-----------|----------------|-------|-----------------|
| **TC‑CHK‑EDGE‑01** | Card number exactly 16 digits passes, 15 and 17 digits fail | Edge | Standard | Checkout page | 1. Test with 15‑digit, 16‑digit, and 17‑digit card numbers <br>2. Submit each | Only 16‑digit passes |
| **TC‑CHK‑EDGE‑02** | Phone number exactly 10 digits passes, 9 and 11 digits fail | Edge | Standard | Checkout page | Same as above for phone field | Only 10‑digit passes |
| **TC‑CHK‑EDGE‑03** | Expiry month boundary (e.g., current month) accepted, past month rejected | Edge | Standard | Checkout page | 1. Set expiry to current month/year <br>2. Submit (should pass) <br>3. Set expiry to previous month/year <br>4. Submit (should fail) | Correct handling of month boundary |
| **TC‑CHK‑EDGE‑04** | Submitting checkout after a rapid double‑click on “Place Order” does not double‑charge (idempotent) | Edge | Standard | Checkout page with valid data | 1. Double‑click “Place Order” quickly <br>2. Verify only one order is created (e.g., via order‑reference uniqueness) | Single order only |
| **TC‑CHK‑EDGE‑05** | Checkout page remains functional after a full page reload before submission (session persists) | Edge | **[Regression – Known Bug: No persistence]** | Cart with items, on checkout page (forced) | 1. Reload page <br>2. Verify form fields retain entered data (currently they do not) | Form data retained after reload |
| **TC‑CHK‑EDGE‑06** | Expiry month value out of range (13) is rejected | Edge | Standard | Checkout page | 1. Fill expiry `13/25` (invalid month) <br>2. Submit | Expiry field shows “Invalid month” |
| **TC‑CHK‑EDGE‑07** | Card number with spaces versus no spaces is accepted uniformly | Edge | Standard | Checkout page | 1. Test `4242 4242 4242 4242` and `4242424242424242` <br>2. Submit | Both formats accepted |
| **TC‑CHK‑EDGE‑08** | Card expiry year far in the future (e.g., 50 years ahead) is rejected as unrealistic | Edge | Standard | Checkout page | 1. Fill expiry `12/2076` <br>2. Submit | Expiry field shows “Expiry year out of acceptable range” |

---

## 5️⃣ Traceability & Regression Summary

| Feature | Test ID | Requirement (from `requirements.md`) | Regression? |
|---------|---------|--------------------------------------|--------------|
| Login | TC‑AUTH‑POS‑01 | “Successful login redirects to product catalog” | No |
| Login | TC‑AUTH‑NEG‑08 | “Users log in with email and password” (email format) | **Yes** – non‑email accepted |
| Catalog | TC‑CAT‑POS‑03 | “Page title: “TechShop — Products”” | **Yes** – title is “Untitled” |
| Catalog | TC‑CAT‑NEG‑01 | “Out of Stock products show badge and disabled button” | **Yes** – missing |
| Cart | TC‑CART‑NEG‑01 | “Increment/decrement quantity controls — minimum 1” | **Yes** – zero/negative allowed |
| Cart | TC‑CART‑NEG‑02 | “Cart shows: name, unit price, quantity, line total, order total” | **Yes** – totals frozen |
| Cart | TC‑CART‑NEG‑04 | “Cart state persists within session only” | **Yes** – wiped on reload |
| Cart | TC‑CART‑NEG‑05 | “Orders under $10.00 rejected with message” | **Yes** – not enforced |
| Checkout | TC‑CHK‑NEG‑07 | “Accessible via ‘Proceed to Checkout’ button in cart” | **Yes** – button non‑functional |
| Checkout | TC‑CHK‑NEG‑08 | “All fields required — empty submission rejected” | **Yes** – empty form succeeds |
| Checkout | TC‑CHK‑POS‑02 | “Labels have `for` attributes (accessible)” | **Yes** – missing (regression) |
| Checkout | TC‑CHK‑EDGE‑05 | “Cart state persists within session only” (checkout context) | **Yes** – loss on reload |

*All other cases map to passing requirements (or are newly added edge checks).*

---

### Next Steps
- If you want the **test‑authoring** skill to turn any of these rows into concrete Playwright spec files, just ask for the feature you’d like to generate next.
- Let me know if you need additional cases or further refinement of any section.
