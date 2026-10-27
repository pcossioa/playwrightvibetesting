# Exploration Notes

## Login

### Flows
1. Navigate to the application root (`/` or `http://localhost:3000`).
2. Locate the "Username" input field and fill with valid credentials (e.g., `demo@techshop.com`).
3. Locate the "Password" input field and fill with the corresponding password (e.g., `password123`).
4. Click the "Sign In" button.
5. Verify successful transition away from the login card to the "Our Products" view.
6. **Negative Flow - Empty Submission:** Click "Sign In" with empty username and password.
7. **Negative Flow - Bad Password:** Enter `demo@techshop.com` and `wrongpassword999`, then click "Sign In".
8. **Negative Flow - Invalid Email Format:** Enter malformed emails (`invalidemail`, `admin`) with `password123` and click "Sign In".
9. **Persistence Flow - Session Retention:** Log in successfully, reload page (`page.reload()`), and verify whether user remains on Products or is redirected back to Login.

### Selectors
- **Username / Email field:** `page.getByLabel('Username')` (fallback: `page.getByPlaceholder('Enter username')` or `page.getByRole('textbox', { name: 'Username' })`)
- **Password field:** `page.getByLabel('Password')` (fallback: `page.getByPlaceholder('Enter password')`; currently exposes role `textbox` due to `type="text"`, will expose standard password semantics once `type="password"` is fixed)
- **Sign-in button:** `page.getByRole('button', { name: 'Sign In' })`
- **Guest browse button:** `page.getByRole('button', { name: 'Browse as Guest' })`
- **Error message container:** `page.getByRole('alert')` (or `page.locator('#toast')` / `page.locator('.toast.error')`; currently missing/unrendered on failed auth)

### Surprises
1. **Unmasked Password Input:**
   - *Action:* Typed a password into the password field.
   - *Expected:* Characters should be masked with bullets/dots (`type="password"`).
   - *Actual:* Characters were displayed in plain text because the element is `<input type="text" id="login-pass">`.
   - *Requirement Broken:* **"Password field must mask input characters"** (FAIL)
2. **Empty Credentials Accepted:**
   - *Action:* Clicked "Sign In" with both username and password fields left completely empty.
   - *Expected:* Form validation error highlighting required fields; remain on login screen.
   - *Actual:* The form submitted and redirected directly to the "Our Products" page.
   - *Requirement Broken:* **"Empty fields must be rejected with an error message"** (FAIL)
3. **Invalid Password Accepted:**
   - *Action:* Entered valid username (`demo@techshop.com`) with an incorrect password (`wrongpassword999`) and clicked "Sign In".
   - *Expected:* Authentication rejection with an error message (e.g., "Invalid credentials"); remain on login screen.
   - *Actual:* The app transitioned to the "Our Products" page without any error message or warning (`buggyLogin()` routes to `showPage('products')` on both success and failure).
   - *Requirement Broken:* **"Failed login shows error message, stays on login page"** (FAIL)
4. **Invalid Email Format Accepted:**
   - *Action:* Entered `invalidemail` and username `admin` (from the demo credentials hint) with `password123` and clicked "Sign In".
   - *Expected:* Input validation error rejecting inputs without `@` and domain.
   - *Actual:* Accepted unconditionally and redirected to the catalog.
   - *Requirement Broken:* **"Email must be valid format (contains @ and domain)"** and **"Users log in with email and password"** (FAIL)
5. **Session Lost on Browser Reload:**
   - *Action:* Logged in as `demo@techshop.com`, reached the products catalog, and reloaded the page (`page.reload()`).
   - *Expected:* User session remains active, displaying the catalog.
   - *Actual:* Page resets to the initial login screen (`#page-login`). State is entirely unpersisted in `sessionStorage` or `localStorage`.
   - *Requirement Broken:* **"Session persists for the browser session"** (FAIL)
6. **No Session or Auth State Indicator:**
   - *Action:* Logged in with valid credentials.
   - *Expected:* Visible indication of authenticated state in header (user email/avatar, logout button).
   - *Actual:* Header remained unchanged ("Products", "Cart (0)"); no logout option or user identity was displayed.
7. **No URL Change / History Update:**
   - *Action:* Clicked "Sign In".
   - *Expected:* Route changes to `/products` or updates browser history.
   - *Actual:* URL remained static at `http://localhost:3000/` using pure CSS `.hidden` toggling without history/hash routing.

---

## Catalog

### Flows
1. Reach catalog page (via login submission, "Browse as Guest" button, or navbar "Products" link).
2. Browse products grid (inspect product card titles, images, descriptions, prices, and discount badges).
3. Adjust item quantity in the card's quantity input field.
4. Click "Add to Cart" button to add product to cart.
5. Verify navbar cart badge counter updates with the added quantity.
6. Check for out-of-stock badges and disabled buttons across product catalog.
7. Inspect browser page title.

### Selectors
- **Product card:** `page.locator('.product-card')`
- **Product title:** `card.locator('.product-name')` (or `page.getByText('Wireless Headphones')`)
- **Product description:** `card.locator('.product-desc')`
- **Original price:** `card.locator('.price-original')`
- **Discounted price:** `card.locator('.price-discounted')`
- **Discount badge:** `card.locator('.badge-discount')`
- **Quantity input:** `card.locator('.qty-input')` (or `card.getByLabel('Qty:')`)
- **Add to Cart button:** `card.getByRole('button', { name: 'Add to Cart' })`
- **Navbar Cart link / badge:** `page.locator('.cart-icon')` (badge: `page.locator('#cart-count')`)

### Surprises
1. **Navbar Visible Before Login:**
   - *Action:* Loaded application at root `/` on login page.
   - *Expected:* Navbar hidden or restricted until user logs in.
   - *Actual:* Full navbar is visible; clicking "Products" or "Cart" bypasses authentication entirely.
2. **Page Title is "Untitled":**
   - *Action:* Checked document title on Catalog view.
   - *Expected:* Title should be `"TechShop — Products"`.
   - *Actual:* Title remains generic `<title>Untitled</title>`.
   - *Requirement Broken:* **"Page title: \"TechShop — Products\""** (FAIL)
3. **Broken Images & Missing Alt Attributes:**
   - *Action:* Inspected product images in catalog.
   - *Expected:* Valid placeholder images with descriptive alt text for accessibility.
   - *Actual:* Product 1 (Wireless Headphones) points to a 404 URL (`.../BROKEN_LINK_404/...`) and completely omits the `alt` attribute. Product 2 (USB-C Hub) fails with a 500 server error from loremflickr.
   - *Requirement Broken:* **"Each card: product name, price, image placeholder, Add to Cart button"** (FAIL)
4. **Incorrect Discount Math:**
   - *Action:* Checked prices against discount percentages.
   - *Expected:* 20% discount on $89.99 should be ~$71.99; 15% discount on $34.99 should be ~$29.74.
   - *Actual:* `calcDiscountedBuggy()` divides discount by 1000 instead of 100, resulting in roughly one-tenth the expected discount (e.g., $88.19 for Headphones, $34.47 for USB-C Hub).
   - *Requirement Broken:* **"Each card: product name, price, image placeholder, Add to Cart button"** (FAIL - incorrect price calculation)
5. **Horizontal Text Overflow on Product Description:**
   - *Action:* Inspected Product 3 (Mechanical Keyboard) card layout.
   - *Expected:* Description wraps within the card container.
   - *Actual:* Product description has `.overflow-bug` (`white-space: nowrap`), overflowing horizontally past card boundaries.
6. **No Stock Status or Disabled Buttons:**
   - *Action:* Checked for out-of-stock indicators.
   - *Expected:* Out of stock products show a badge and disabled Add to Cart button.
   - *Actual:* No products indicate stock status, badges are absent, and all buttons remain enabled.
   - *Requirement Broken:* **"Out of Stock products show badge and disabled button"** (FAIL)
7. **Unconstrained Quantity Input on Card:**
   - *Action:* Entered negative numbers (`-2`) or zero into product quantity input and clicked "Add to Cart".
   - *Expected:* Input restricted to minimum 1.
   - *Actual:* Field lacks `min="1"`, allowing negative values into the cart and turning the navbar cart counter negative (`-2`).

---

## Cart

### Flows
1. Click Cart icon in navigation bar (`.cart-icon`).
2. Review items list, unit prices, quantity inputs, and line subtotals.
3. Update item quantity directly via the numeric input (testing increments, decrements, 0, and negative values).
4. Attempt to apply discount code (if promo field exists).
5. Remove an item by clicking its "Remove" button.
6. Check behavior when cart has orders under $10.00.
7. Click "Proceed to Checkout" to transition to the checkout view.
8. Reload browser page while cart has items to verify session persistence.

### Selectors
- **Cart container:** `page.locator('#cart-content')`
- **Cart item row:** `page.locator('.cart-item')`
- **Cart item quantity input:** `item.locator('.cart-item-qty')`
- **Cart item unit price:** `item.locator('.cart-item-price')`
- **Cart item line subtotal:** `item.locator('.cart-item-subtotal')`
- **Remove item button:** `item.getByRole('button', { name: 'Remove' })`
- **Order summary subtotal:** `page.locator('#cart-subtotal')`
- **Order summary grand total:** `page.locator('#cart-total')`
- **Proceed to Checkout button:** `page.getByRole('button', { name: 'Proceed to Checkout' })`
- **Continue Shopping button:** `page.getByRole('button', { name: 'Continue Shopping' })`
- **Empty cart container:** `page.locator('.cart-empty')`
- **Empty cart message:** `page.getByText('Your cart is empty.')`
- **Shop Now button:** `page.getByRole('button', { name: 'Shop Now' })`

### Surprises
1. **"Proceed to Checkout" Button is Non-Functional:**
   - *Action:* Clicked "Proceed to Checkout" button.
   - *Expected:* Navigate to Checkout page (`#page-checkout`).
   - *Actual:* Button click does nothing (`proceedToCheckoutBuggy()` returns `false` without transitioning views).
   - *Requirement Broken:* **"Accessible via \"Proceed to Checkout\" button in cart"** (FAIL - also blocks end-to-end checkout flow)
2. **Order Summary Totals Frozen on Quantity Update:**
   - *Action:* Changed item quantity from 1 to 3 in the cart item input.
   - *Expected:* Line item subtotal, order subtotal, and total recalculate and refresh.
   - *Actual:* Only the navbar badge updates; line subtotal and order summary amounts remain frozen at initial values.
   - *Requirement Broken:* **"Cart shows: name, unit price, quantity, line total, order total"** (FAIL)
3. **No Quantity Lower Bounds (Allows <= 0):**
   - *Action:* Changed cart item quantity to `0` or negative values.
   - *Expected:* Enforce minimum quantity of 1 or prompt to remove item.
   - *Actual:* Accepts 0 and negative numbers without validation, resulting in negative totals (e.g. `$-171.39`).
   - *Requirement Broken:* **"Increment/decrement quantity controls — minimum 1"** (FAIL)
4. **Removing Item Does Not Recalculate Totals or Render Empty Cart State:**
   - *Action:* Clicked "Remove" on the only item remaining in cart.
   - *Expected:* Order totals reset to $0.00 and view displays "Your cart is empty" with "Shop Now" button.
   - *Actual:* Item element is removed from DOM, but summary panel stays visible with stale subtotal/total figures, and the empty state template never renders.
   - *Requirement Broken:* **"Remove individual items"** and **"Empty cart message: \"Your cart is empty\""** (FAIL)
5. **Cart Wiped on Page Reload:**
   - *Action:* Added items to cart (badge = 1) and reloaded browser tab.
   - *Expected:* Cart state persists within the browser session.
   - *Actual:* Cart count drops to 0; state held only in volatile in-memory JS array `cart = []`.
   - *Requirement Broken:* **"Cart state persists within session only"** (FAIL)
6. **No Minimum Order Value Enforcement:**
   - *Action:* Inspected cart with total under $10.00 (or negative).
   - *Expected:* Orders under $10.00 rejected with message: "Minimum order value is $10.00".
   - *Actual:* No minimum threshold validation exists.
   - *Requirement Broken:* **"Orders under $10.00 rejected with message: \"Minimum order value is $10.00\""** (FAIL)
7. **No Discount Code Field:**
   - *Action:* Searched cart page for promo code or coupon input.
   - *Expected:* Promo/discount input to apply code.
   - *Actual:* No discount/coupon input exists anywhere in the Cart UI.

---

## Checkout

### Flows
1. Access Checkout view (intended via cart "Proceed to Checkout"; requires direct navigation `showPage('checkout')` while button is broken).
2. Enter Shipping Information: First Name, Last Name, Address, City, ZIP Code.
3. Enter Contact Details: Email Address, Phone Number.
4. Enter Payment Details: Card Number, Expiry Date (MM/YY), CVV.
5. Review Order Summary side panel.
6. Click "Place Order" button.
7. **Negative Flow - Blank Submission:** Submit form with all fields empty.
8. **Negative Flow - Malformed Fields:** Submit form with:
   - Invalid email (`invalid-email`)
   - Short card number (`1234`)
   - Short phone (`123`)
   - Expired date (`01/20`)
   - 1-digit CVV (`1`)
9. Inspect Order Confirmation screen for reference number, purchased item list, and total amount paid.

### Selectors
- **First Name input:** `page.getByPlaceholder('John')` (or `page.locator('#co-firstname')`)
- **Last Name input:** `page.getByPlaceholder('Doe')` (or `page.locator('#co-lastname')`)
- **Address input:** `page.getByPlaceholder('123 Main Street')` (or `page.locator('#co-address')`)
- **City input:** `page.getByPlaceholder('New York')` (or `page.locator('#co-city')`)
- **ZIP Code input:** `page.getByPlaceholder('10001')` (or `page.locator('#co-zip')`)
- **Email input:** `page.getByPlaceholder('john@example.com')` (or `page.locator('#co-email')`)
- **Phone input:** `page.getByPlaceholder('555-0100')` (or `page.locator('#co-phone')`)
- **Card Number input:** `page.getByPlaceholder('1234 5678 9012 3456')` (or `page.locator('#co-card')`)
- **Card Expiry input:** `page.getByPlaceholder('MM/YY')` (or `page.locator('#co-expiry')`)
- **Card CVV input:** `page.getByPlaceholder('123')` (or `page.locator('#co-cvv')`)
- **Place Order button:** `page.getByRole('button', { name: 'Place Order' })`
- **Order confirmation heading:** `page.getByRole('heading', { name: 'Order Placed!' })`
- **Continue Shopping button (confirmation):** `page.getByRole('button', { name: 'Continue Shopping' })`

### Surprises
1. **Empty Form Submission Accepted (Zero Validation):**
   - *Action:* Clicked "Place Order" with all checkout form fields completely blank.
   - *Expected:* All fields required; submission blocked with field-level validation errors.
   - *Actual:* Submission immediately succeeded and navigated directly to confirmation view.
   - *Requirement Broken:* **"All fields required — empty submission rejected"** (FAIL)
2. **Invalid Email Accepted:**
   - *Action:* Entered `invalid-email` into the Email Address field.
   - *Expected:* Rejected with valid email format error.
   - *Actual:* Accepted without validation.
   - *Requirement Broken:* **"Email: valid format"** (FAIL)
3. **Invalid Card Number Accepted:**
   - *Action:* Entered `1234` (4 digits) into Card Number.
   - *Expected:* Rejected unless exactly 16 digits.
   - *Actual:* Accepted without validation.
   - *Requirement Broken:* **"Card Number: exactly 16 digits"** (FAIL)
4. **Invalid Phone Number Accepted:**
   - *Action:* Entered `123` (3 digits) into Phone Number.
   - *Expected:* Rejected unless exactly 10 digits.
   - *Actual:* Accepted without validation.
   - *Requirement Broken:* **"Phone: 10 digits"** (FAIL)
5. **Expired Date Accepted:**
   - *Action:* Entered past date `01/20` into Expiry.
   - *Expected:* Rejected with error indicating expiry date cannot be in the past and must be MM/YY.
   - *Actual:* Accepted without validation.
   - *Requirement Broken:* **"Expiry: MM/YY format, not in the past"** (FAIL)
6. **Invalid CVV Accepted:**
   - *Action:* Entered `1` (1 digit) into CVV.
   - *Expected:* Rejected unless exactly 3 digits.
   - *Actual:* Accepted without validation.
   - *Requirement Broken:* **"CVV: 3 digits"** (FAIL)
7. **Order Summary Side Panel is Blank:**
   - *Action:* Inspected checkout "Order Summary" panel.
   - *Expected:* Displays items being purchased, quantities, shipping cost, and grand total.
   - *Actual:* Hardcoded placeholder text reads `"Nothing to show here."` (`renderCheckoutSummary()` is an unwritten stub).
8. **Incomplete Confirmation Screen:**
   - *Action:* Landed on Order Confirmation view.
   - *Expected:* Displays unique order reference number, purchased item breakdown, and order total.
   - *Actual:* Shows only generic checkmark icon, `"Order Placed!"`, `"Your order has been placed successfully."`, and `"Continue Shopping"` button without any order reference or financial summary.
   - *Requirement Broken:* **"Success: confirmation page with order reference, items, total"** (FAIL)
9. **Unlinked Form Labels:**
   - *Action:* Inspected accessibility labels in the checkout form.
   - *Expected:* `<label for="...">` associated with input IDs to allow `getByLabel` resolution.
   - *Actual:* Labels lack `for` attributes, breaking accessible association and requiring placeholder-based locators.

---

## Requirements Coverage & Compliance Summary

### Summary Statistics
- **Total In-Scope Requirements:** 28
- **Requirements Checked:** 28 / 28 (100% coverage)
- **Passed:** 4
- **Failed:** 23
- **Blocked from UI:** 1 (Checkout flow access blocked by non-functional cart button)

### Detailed Compliance Matrix

| Area | Requirement | Status | Notes / Exact Violation Quote |
| :--- | :--- | :---: | :--- |
| **Login** | Users log in with email and password | **FAIL** | Labeled "Username", accepts non-email strings like `admin`. |
| **Login** | Email must be valid format (contains @ and domain) | **FAIL** | Violates: *"Email must be valid format (contains @ and domain)"* |
| **Login** | Password field must mask input characters | **FAIL** | Violates: *"Password field must mask input characters"* (`type="text"`) |
| **Login** | Empty fields must be rejected with an error message | **FAIL** | Violates: *"Empty fields must be rejected with an error message"* |
| **Login** | Valid credentials: demo@techshop.com / password123 | **PASS** | Successfully authenticates user with expected credentials. |
| **Login** | Successful login redirects to product catalog | **PASS** | Transitions to `#page-products` view upon submission. |
| **Login** | Failed login shows error message, stays on login page | **FAIL** | Violates: *"Failed login shows error message, stays on login page"* |
| **Login** | Session persists for the browser session | **FAIL** | Violates: *"Session persists for the browser session"* (resets on page reload) |
| **Catalog** | Grid of available products | **PASS** | Renders 4 product cards in grid layout. |
| **Catalog** | Each card: product name, price, image placeholder, Add to Cart button | **FAIL** | Violates: *"Each card: product name, price, image placeholder, Add to Cart button"* (broken images, broken discount math) |
| **Catalog** | Out of Stock products show badge and disabled button | **FAIL** | Violates: *"Out of Stock products show badge and disabled button"* (no stock badges/controls) |
| **Catalog** | Page title: "TechShop — Products" | **FAIL** | Violates: *"Page title: \"TechShop — Products\""* (title is `"Untitled"`) |
| **Cart** | Add products from catalog | **PASS** | Items add to cart array and badge counter increments. |
| **Cart** | Cart shows: name, unit price, quantity, line total, order total | **FAIL** | Violates: *"Cart shows: name, unit price, quantity, line total, order total"* (totals frozen on quantity edit) |
| **Cart** | Increment/decrement quantity controls — minimum 1 | **FAIL** | Violates: *"Increment/decrement quantity controls — minimum 1"* (allows 0 and negative quantities) |
| **Cart** | Remove individual items | **FAIL** | Violates: *"Remove individual items"* (removes element but leaves stale totals) |
| **Cart** | Empty cart message: "Your cart is empty" | **FAIL** | Violates: *"Empty cart message: \"Your cart is empty\""* (missing when items removed; has period initially) |
| **Cart** | Cart state persists within session only | **FAIL** | Violates: *"Cart state persists within session only"* (wiped on page reload) |
| **Cart** | Orders under $10.00 rejected with message: "Minimum order value is $10.00" | **FAIL** | Violates: *"Orders under $10.00 rejected with message: \"Minimum order value is $10.00\""* |
| **Checkout** | Accessible via "Proceed to Checkout" button in cart | **FAIL / BLOCKED** | Violates: *"Accessible via \"Proceed to Checkout\" button in cart"* (`proceedToCheckoutBuggy()` returns `false`) |
| **Checkout** | Fields: First Name, Last Name, Email, Phone, Card Number, Expiry Date, CVV | **PASS** | All 7 inputs exist in the DOM structure. |
| **Checkout** | All fields required — empty submission rejected | **FAIL** | Violates: *"All fields required — empty submission rejected"* |
| **Checkout** | Email: valid format | **FAIL** | Violates: *"Email: valid format"* |
| **Checkout** | Card Number: exactly 16 digits | **FAIL** | Violates: *"Card Number: exactly 16 digits"* |
| **Checkout** | Phone: 10 digits | **FAIL** | Violates: *"Phone: 10 digits"* |
| **Checkout** | Expiry: MM/YY format, not in the past | **FAIL** | Violates: *"Expiry: MM/YY format, not in the past"* |
| **Checkout** | CVV: 3 digits | **FAIL** | Violates: *"CVV: 3 digits"* |
| **Checkout** | Success: confirmation page with order reference, items, total | **FAIL** | Violates: *"Success: confirmation page with order reference, items, total"* |

### Untestable & Blocked Flows
- **Checkout via UI:** The entire checkout experience cannot be reached naturally by a user through the UI because clicking `"Proceed to Checkout"` in the cart executes `proceedToCheckoutBuggy()` which returns `false` without triggering navigation. Checkout requirements were tested by invoking `showPage('checkout')` directly.

### Newly Explored Gaps
No additional requirements remained untested after the comprehensive coverage performed. All 28 in‑scope requirements have been examined.
