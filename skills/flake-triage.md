# Skill: Flake Triage

## Purpose
Determine definitively whether a failing Playwright test represents a **REAL BUG** (application defect) or a **FLAKY TEST** (test implementation, race condition, or environment flaw). Follow these instructions whenever triaging a test failure.

---

## The 5-Step Triage Checklist

Work through every step in sequence before reaching a conclusion:

### 1. Consistency Check
- **Analyze execution history:** Does the test fail 100% of the time, or only intermittently?
  - **Deterministic (fails every run):** Strongly indicates an application defect or broken contract.
  - **Intermittent (passes on retry or fails randomly):** Strongly indicates a flaky test (timing, race condition, network jitter, or state pollution).
- **Mandatory Re-run Rule:** If consistency is ambiguous or based on a single failure, **run the test 3 to 5 times** (e.g., `npx playwright test <spec> --repeat-each=5`) before forming a verdict.

### 2. Root Cause Analysis
- **Identify the failure mechanism:**
  - **Application Defect Indicators:**
    - App rendered incorrect data, broken layout, 404/500 HTTP response, or an unhandled exception.
    - Application state contradicts documented acceptance criteria (e.g., plain-text password, wrong calculation).
  - **Flaky Test Indicators:**
    - Timeout while waiting for an element that eventually appears after the test dies.
    - Test asserted state before an asynchronous animation, fetch, or render cycle settled.
    - Test relied on a brittle CSS or positional selector (`div > span:nth-child(2)`) affected by render timing.
    - Test passed when run alone, but failed when run in parallel (state leakage / shared fixture).

### 3. Trace & Timeline Evidence
- **Inspect the Playwright Trace (`trace.zip`):**
  - **Action Log:** Did Playwright perform the action on the intended element?
  - **DOM Snapshot at Failure:** When the assertion failed, was the application visibly in an incorrect state, or was the assertion querying before hydration completed?
  - **Console & Network Tabs:** Were there uncaught application crashes, or merely test-runner timeouts waiting on a busy event loop?

### 4. Classification
Provide an unambiguous verdict:
- **`REAL BUG`** — The test accurately revealed that the application violated business specifications or crashed.
- **`FLAKY TEST`** — The application works as intended, but the test authoring or test environment failed to observe it reliably.

### 5. Actionable Recommendation
- **If REAL BUG:**
  - **Do NOT alter the test** to force a pass.
  - Document and file the issue using [`skills/bug-reporting.md`](./bug-reporting.md).
- **If FLAKY TEST:**
  - **Do NOT file an application bug.**
  - Identify and apply the exact test implementation remedy:
    - **Brittle locator:** Migrate to user-facing locators (`getByRole`, `getByLabel`).
    - **Timing/Race:** Replace manual assertions or sleeps with auto-waiting web-first assertions (`await expect(locator).toHaveText(...)`).
    - **State Leakage:** Fix test isolation by moving setup into fresh custom fixtures (`test.extend`).
    - **Animation/Network:** Add explicit web-first wait conditions for data hydration.

---

## Standard Triage Report Format

```markdown
### Triage: [Test Name / ID]

1. **Consistency:** [Consistent (X/X failed) | Intermittent (X/Y failed)]
2. **Failure Analysis:** [Quote exact error, locator, and timeout from Playwright]
3. **Trace Findings:** [Specific evidence from trace timeline, snapshot, and network tab]
4. **Classification:** **REAL BUG** | **FLAKY TEST**
5. **Next Step:**
   - *If Real Bug:* Proceed to file report via bug-reporting skill.
   - *If Flaky Test:* [Exact test code refactor required to eliminate flake]
```
