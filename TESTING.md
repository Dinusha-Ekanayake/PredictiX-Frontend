# Testing strategy (frontend)

The backend has its own `TESTING.md` covering API, authorization, SQL sandbox,
RAG evaluation and LLM tests. This file covers the Next.js app.

## Layers

| Layer | Tool | Where | Runs in CI | Needs backend |
|-------|------|-------|-----------|---------------|
| Unit | Vitest | `src/**/*.test.ts` | yes (`verify`) | no |
| Component | Vitest + Testing Library + jsdom | `src/**/*.test.tsx` | yes (`verify`) | no |
| End-to-end smoke | Playwright (Chromium) | `e2e/*.spec.ts` | yes (`e2e`) | no, API is intercepted |
| Static checks | `tsc --noEmit`, ESLint | whole repo | yes (`verify`) | no |

The pyramid is deliberate: many fast unit tests for pure logic (link checks,
token expiry, health bands), fewer component tests for forms and dialogs, and
a small E2E suite for the flows where only a real browser and a real
production build can prove the behaviour (client-side route guards, response
headers, production-only 404s).

## What must stay covered

These are security or access rules enforced in the browser. A change to any
of them needs a test change in the same commit.

| Rule | Test |
|------|------|
| Server-supplied links and chatbot buttons stay inside the app | `src/lib/safePath.test.ts` |
| A 401 signs the user out; a 400 or 403 does not | `src/lib/apiClient.test.ts` |
| An expired JWT counts as signed out | `src/lib/securityHardening.test.ts`, `e2e/auth.spec.ts` |
| Signed-out and wrong-role visitors are redirected | `e2e/auth.spec.ts` |
| Admins can only assign users to their own warehouse | `src/lib/assignableWarehouses.test.ts` |
| Attachments are limited by type and size | `src/lib/securityHardening.test.ts` |
| Security headers are sent and dev proxies are off in production | `e2e/security.spec.ts` |

The browser checks are for user experience. The API enforces every rule
again, and the backend's authorization matrix tests prove that.

## Running

```bash
npm test               # unit + component, grouped table
npm run test:coverage  # with coverage
npm run test:e2e       # builds the app, starts it on :3100, runs Playwright
npm run test:e2e:ui    # Playwright UI mode for debugging
```

Locally, `test:e2e` reuses a server already listening on port 3100. In CI
it always builds fresh.

On Windows, run the commands from PowerShell or cmd. Git Bash reports the
drive as `/e/` rather than `E:`, which makes Vitest load itself twice and
fail with "failed to find the current suite".

## Writing tests

- Arrange, act, assert. Name tests after the behaviour ("signs out and
  returns to the login page on a 401"), not the function.
- Query by role and label (`getByRole`, `getByLabelText`); fall back to text
  only when there is no accessible name.
- Mock at the module boundary (`vi.mock("@/lib/api/...")`) or the network
  boundary (`page.route` in E2E). Never call the real API from a test.
- E2E tests use the `api` fixture in `e2e/fixtures.ts`, which answers every
  API call with an empty list. Override only the endpoints the test is about.
- New test files are added to `GROUPS` in `scripts/run-tests.mjs` so they
  get a named row in the results table.
