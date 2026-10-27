# Skill: Test Authoring

## Purpose
Translate test case matrices into maintainable, robust, and isolated Playwright automated test suites. Follow these instructions whenever implementing, reviewing, or refactoring Playwright tests.

---

## 1. Locators
- **User-Facing First:** Always prioritize accessible, semantic locators:
  - `page.getByRole(...)`
  - `page.getByLabel(...)`
  - `page.getByPlaceholder(...)`
  - `page.getByText(...)`
- **Strictly Prohibited:** Never use brittle CSS selectors, DOM hierarchies, or positional chains (e.g. `div > div:nth-child(3) > span`, `#app > div > button`).
- **Missing Locators:** If an element lacks accessible semantics (e.g. unlinked labels, ambiguous buttons), recommend adding proper semantic attributes (`<label for="...">`, `aria-label`, or `data-testid`) rather than resorting to fragile selector hacks.

### 1a. Fallback Locators (when the app under test cannot be changed)
When an element has no usable role, label association, or accessible name, pick the **first** rung of this ladder that works — and use the same ladder in every page object:
  1. `getByRole` / `getByLabel` / `getByText`, optionally scoped inside a semantic container (`getByRole('navigation')`, a row filtered by visible text).
  2. A **single stable identifier on the element itself**: `getByTestId(...)` or `locator('#id')`.
  3. A **single** class name filtered by user-visible text (`locator('.cart-item').filter({ hasText: name })`) — only when the element has no id.
- **Never locate an element through its neighbours.** No "find the label → climb to its wrapper → take the input inside", no `.form-group` + label-text-regex filters, no descendant chains (`#page-x .group`), no compound selectors (`#toast.toast.error`). These break on layout changes and label rewording (a `*` added to a label, "Address" prefix-matching "Address Line 2").
- **Declare repeated fallbacks once, as data.** When many elements share a pattern (form inputs and their error messages), define one typed map in the page object (`{ CVV: { input: 'co-cvv', error: 'err-cvv' } }`) and build every locator from it. Do not hand-write a method or regex per element.
- **Tag every fallback `// A11Y-GAP:`** with the semantic fix the app needs (e.g. `<label for="co-cvv">`). This keeps the debt searchable and shows reviewers the locator is a deliberate, documented choice.

---

## 2. Assertions
- **Assert Real Business Outcomes:** Every test must verify the concrete final state:
  - Visual visibility (`toBeVisible()`)
  - Specific text content (`toHaveText(...)`)
  - Form field values (`toHaveValue(...)`)
  - State attributes (`toBeDisabled()`, `toHaveAttribute(...)`)
- **Web-First Only:** Always use async Playwright assertions (`await expect(locator)...`).
- **Never Settle for Smoke Checks:** Assertions like "the page did not crash" or `expect(page).toBeDefined()` are unacceptable.

---

## 3. Structure & Page Object Model (POM)
- **One Spec Per Feature:** Maintain one spec file per feature domain (e.g. `tests/login.spec.ts`, `tests/catalog.spec.ts`, `tests/cart.spec.ts`, `tests/checkout.spec.ts`).
- **Lightweight Page Objects:** Use a clean, lightweight Page Object class for each functional area:
  - Encapsulate element locators as readonly properties or getters.
  - Encapsulate discrete user interactions as async methods (e.g. `login(email, pass)`, `addItemToCart(name)`).
  - Keep assertions inside the test specs, not inside the page objects (POMs perform actions and expose locators; tests assert).

---

## 4. Fixtures
- **Shared Setup in Custom Fixtures:** Common setup workflows (e.g., authenticated user session, cart with pre-loaded items) must be defined as reusable Playwright custom fixtures (`test.extend(...)`).
- **Zero Copy-Paste:** Never copy-paste login or setup routines across multiple test blocks or files.

---

## 5. Test Isolation
- **Autonomous Execution:** Every test must run completely independently, in any arbitrary order, and in parallel.
- **Fresh Contexts:** Each test must start from a clean state (clean cookies, cleared storage, fresh page load).
- **No Shared State:** Tests must never depend on state or data created by a preceding test.

---

## 6. Secrets & Environment Variables
- **Dynamic Credential Sourcing:** Credentials must always be sourced from environment variables:
  ```ts
  const email = process.env.TEST_EMAIL ?? 'demo@techshop.com';
  const password = process.env.TEST_PASSWORD ?? 'password123';
  ```
- **Never Commit Plain Secrets:** Never hardcode passwords or sensitive tokens directly inside test files or POMs.

---

## 7. Forbidden Practices (Zero Tolerance)

| Prohibited Pattern | Reason | Required Alternative |
| :--- | :--- | :--- |
| `page.waitForTimeout(n)` | Flaky, slow, and arbitrary | Rely on Playwright's built-in auto-waiting and web-first `await expect()` |
| Hardcoded plain secrets | Security vulnerability | Use `process.env.*` with `.env` loading |
| Brittle structural CSS | Breaks on minor markup changes | Use `getByRole`, `getByLabel`, or `getByTestId` |
| Locating via neighbours (label → wrapper → input) | Breaks on layout or label-text changes | The element's own id / test id, from one POM map (§1a) |
| Tautological assertions | Tests nothing (`expect(true).toBe(true)`) | Assert actual DOM state or response payload |
| Inter-test dependencies | Prevents parallel and isolated runs | Use custom fixtures for clean prerequisite setup |
