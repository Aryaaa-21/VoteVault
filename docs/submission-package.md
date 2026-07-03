# VoteVault: Developer Submission Package Details

This document packages all repository pointers, testing logs, and checklists required for the Midnight Level 1, 2, and 3 submission package.

---

## 1. Project Reference Metadata

*   **Repository URL**: `https://github.com/Aryaaa-21/VoteVault`
*   **Live Preview / Demo URL**: Local developer port `http://localhost:5173/` (Vite dev server)
*   **Network Target**: `midnight-devnet` (Simulated provider environment)
*   **Monorepo Structure**:
    *   `/contract`: Compact smart contract source and compilation scripts.
    *   `/frontend`: React + TypeScript frontend dashboard and Playwright E2E suites.

---

## 2. CI/CD Workflow Configuration

The automated pipeline is defined in `.github/workflows/ci.yml` and triggers on `push` and `pull_request` to the `main` branch.

**Workflow Outline**:
```yaml
name: VoteVault CI Pipeline
on: [push, pull_request]
jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with: { node-version: 20 }
      - name: Install Monorepo Deps
        run: npm install
      - name: Lint Code
        run: npm run lint
      - name: Compile Compact Contract
        run: npm run compile
      - name: Execute Vitest Suite
        run: npm run test
      - name: Production Bundle Build
        run: npm run build
```

---

## 3. Test Evidence Log

### A. Unit Tests (Vitest)
```
 ✓ src/tests/VoteVault.test.tsx (4 tests) 3467ms
     ✓ 1. Wallet Connection Flow - should connect, update walletAddress, and disconnect successfully
     ✓ 2. Vote Casting Test - should allow casting a vote, increment tallies, and store local ZK nullifiers
     ✓ 3. Double Voting Prevention Test - should throw an error if same nullifier is submitted twice
     ✓ 4. Election Creation Test - should allow deploying a new referendum and registering options
```

### B. Integration Tests (Playwright E2E)
```
Running 3 tests using 1 worker
  3 passed (16.5s)
```

---

## 4. Submission Checklist Review

*   [x] **Level 1**: Contract code (`index.compact`) compiles successfully. `managed/` compiler directory populated with index JS and types.
*   [x] **Level 2**: Wallet integration connects via `window.midnight.mnLace` with simulated local profile timing fallbacks.
*   [x] **Level 3**: Production-ready code compiles cleanly without compiler warnings. Passes Vitest and Playwright test suites.
