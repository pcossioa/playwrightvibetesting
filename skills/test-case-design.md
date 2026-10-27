# Skill: Test Case Design

## Purpose
Given a feature specification and corresponding exploration notes, produce an exhaustive, behavior-driven test matrix. Follow these instructions whenever asked to design, review, or expand test cases.

---

## Required Inputs
Before generating test cases, always inspect:
1. **Requirements/Specifications** (e.g. `requirements.md`): Defines the intended business logic and acceptance criteria.
2. **Exploration Notes** (e.g. `exploration-notes.md`): Provides ground-truth DOM selectors, live quirks, accessibility observations, and known failure points.

---

## Core Rules

1. **Ground in Real Application State:**
   - Base test steps and assertions on real elements, actual locators (`getByRole`, `getByLabel`), and confirmed system behaviors documented during exploration.
   - Never write generic, textbook guesses that assume standard backend behaviors not present in the app.

2. **Behavioral Titles:**
   - Every title must state the specific behavior under test.
   - Use active verb phrasing (e.g., *"Login rejects empty password"*, *"Cart updates subtotal when quantity increments"*).
   - Avoid vague titles like *"Test login"* or *"Check cart"*.

3. **Flag Known Bugs as Planned Regressions:**
   - When designing a case for behavior that currently fails or deviates from the spec (identified in the exploration notes), explicitly tag it as:
     `[Regression - Known Bug: <Brief Description>]`
   - These cases serve as planned regression coverage once fixes are applied.

---

## The Three Mandatory Categories
Every feature matrix must be partitioned into three categories:

### 1. Positive Cases
- **Definition:** Valid inputs and standard happy-path workflows that allow the user to complete the intended goal.
- **Coverage:** Primary business paths, expected redirects, session creation, data updates, and success feedback.

### 2. Negative Cases
- **Definition:** Deliberately invalid, incomplete, or unauthorized inputs that the system must detect and reject.
- **Coverage:** Empty mandatory fields, malformed formats (e.g. invalid emails, non-numeric strings), incorrect passwords, unauthorized route access, and rejected transactions.

### 3. Edge & Boundary Cases
- **Definition:** Critical threshold values, boundaries, extremes, and timing states.
- **Coverage:**
  - Numeric limits (e.g. 0, 1, max allowed quantity, just below minimum order value).
  - Date boundaries (e.g. past dates, current month, distant future).
  - String lengths (e.g. exactly 16-digit card vs 15/17 digits, 10-digit phone vs 9/11 digits, 3-digit CVV vs 2/4 digits).
  - State boundaries (e.g. removing the last item in cart, rapid double-clicks, browser reload persistence).

---

## Standard Test Case Format
Document each test case using the following markdown structure:

```markdown
#### [TEST-ID] [Behavioral Title]
- **Category:** Positive | Negative | Edge
- **Status / Tag:** Standard | [Regression - Known Bug: <Description>]
- **Preconditions:** Initial application state, authentication status, and route required before step 1.
- **Steps:**
  1. [Action 1 with specific test data and locator]
  2. [Action 2]
  3. [Action 3]
- **Expected Result:** Explicit, verifiable UI outcome, error message, state change, or navigation.
```

### Identifier Convention
Use structured IDs following this pattern:
`TC-[FEATURE]-[CATEGORY_PREFIX]-[NUMBER]`
- Example: `TC-AUTH-POS-01`, `TC-AUTH-NEG-02`, `TC-CART-EDGE-01`

---

## Output Structure
When asked to design test cases for a feature:
1. **Feature Scope & Assumptions:** Brief 1-2 sentence alignment with referenced requirements.
2. **Positive Test Cases:** Complete positive specifications.
3. **Negative Test Cases:** Complete negative specifications.
4. **Edge & Boundary Test Cases:** Complete boundary specifications.
5. **Traceability & Regression Summary:** Bulleted mapping connecting each test ID back to the requirement ID and noting any planned regression cases.
