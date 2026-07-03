# VoteVault: Testing Documentation

VoteVault features a double-layered test suite to ensure the stability of the React UI components, the wallet state machines, and Zero-Knowledge workflows.

## 1. Unit & State Testing (Vitest)

Vitest is used to mock state changes, verify context logic, and validate calculations under high speed.

### Running Vitest
To run the unit tests locally:
```bash
cd votevault/frontend
npm run test
```

### Test Coverage (`src/tests/VoteVault.test.tsx`)
1. **Wallet Connection Flow**: Mocks wallet interface injections and asserts that `walletConnected` status and addresses update correctly.
2. **Vote Casting Test**: Mocks ballot creation, confirms increments of candidate and total tallies, and validates ZK nullifier creation.
3. **Result Verification Test**: Validates the loading of finalized referendum outcomes and audits cryptographic signatures.
4. **Election Creation Test**: Simulates admin deployments and candidate options registry.

---

## 2. End-to-End Testing (Playwright)

Playwright simulates user interactions in headless or headed web browsers.

### Setup Playwright
First install the Playwright test runners and browser binaries:
```bash
cd votevault/frontend
npx playwright install
```

### Running E2E Tests
To run Playwright tests:
```bash
cd votevault/frontend
npm run test:e2e
```

### Test Scenarios (`tests/e2e.spec.ts`)
- **Wallet Connection Flow**: Opens the landing page, navigates to the wallet selection screen, mocks a successful connection, and verifies dashboard entry.
- **Voting Flow**: Selects an active referendum, triggers vote selection, clicks 'Confirm & Sign', waits for the ZK proof validation, and asserts the nullifier receipt details display.
- **Results Flow**: Navigates to completed referendums, verifies the dynamic timeline SVG curve renders, and audits the consensus proof validation logs.
