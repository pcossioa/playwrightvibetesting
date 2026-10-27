# Skill: Bug Reporting

## Purpose
Transform a failing Playwright test, trace, and session artifact into a developer-ready, reproducible bug report. Follow these instructions whenever asked to file, draft, or format a defect report.

---

## Standard Bug Report Schema

Every bug report must strictly follow this structure:

```markdown
### [BUG-ID] [Behavioral Title]

- **Environment:**
  - **App Version / Target:** [e.g. broken-app / commit SHA / staging]
  - **Browser / Engine:** [e.g. Chromium 128 / Desktop Chrome]
  - **URL:** [e.g. http://localhost:3000/ or target route]
  - **Failing Test Spec:** [e.g. tests/login.spec.ts::TC-AUTH-NEG-01]

- **Severity:** Critical | High | Medium | Low
  - **Justification:** [Mandatory one-line justification explaining user/business impact]

- **Steps to Reproduce:**
  1. [Explicit step 1 with starting URL]
  2. [Explicit action with exact inputs/credentials]
  3. [Explicit trigger action e.g. click button]

- **Expected Result:**
  [Clear, isolated statement of what the application should do according to specifications]

- **Actual Result:**
  [Explicit statement of what the application actually did, including UI state, failure mode, and DOM behavior]

- **Evidence:**
  - **Playwright Trace:** `test-results/<test-folder>/trace.zip`
  - **Screenshot / Artifact:** `test-results/<test-folder>/test-failed-1.png`
  - **Error Output / Failed Assertion:**
    ```text
    [Paste relevant Playwright assertion error or console log snippet]
    ```
```

---

## Core Rules & Constraints

1. **Behavioral, Specific Titles:**
   - Always describe the exact observable failure.
   - **Forbidden:** Vague titles like *"Checkout broken"* or *"Login issue"*.
   - **Required:** Action-and-failure phrasing, e.g. *"Proceed to Checkout button does not respond to click"*, *"Password input displays entered characters in plain text"*.

2. **Strict Separation of Expected vs. Actual:**
   - **Never** combine Expected and Actual into a single paragraph or sentence.
   - They must remain two distinct, dedicated fields for absolute clarity.

3. **Severity Definitions & Required Justification:**
   - **Critical:** Total feature blockage, data loss, security flaw, or crash with no workaround (e.g. authentication bypass, checkout button dead).
   - **High:** Major user flow broken, incorrect pricing/calculations, or primary requirement failed with difficult workaround.
   - **Medium:** Secondary feature malfunction, validation failure that doesn't block completion, or noticeable layout defect.
   - **Low:** Cosmetic discrepancy, minor copy mistake, or subtle styling glitch.
   - *Every report must provide a one-line impact justification immediately following the severity rating.*

4. **Complete Trace & Evidence Linking:**
   - Always reference the relative file path to the Playwright trace zip (`trace.zip`), failure screenshot, and the failing assertion snippet.

---

## Mandatory Quality Gate

Before finalizing any bug report, perform this self-check:

> **"Could an external developer reproduce this issue using only the Steps to Reproduce, without reading the test code or asking questions?"**

- If the answer is **NO**, the report is incomplete. Add the missing data, starting URL, or exact click target before submitting.
- If the answer is **YES**, the report is ready.
