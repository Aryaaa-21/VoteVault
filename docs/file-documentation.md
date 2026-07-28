# VoteVault: File & Module Documentation

This document explains the purpose, responsibilities, and key design considerations of every important file across the VoteVault monorepo.

---

## 1. Root Workspace

| Path | Purpose |
| :--- | :--- |
| `package.json` | Root monorepo configuration defining build and compilation scripts for contract and frontend packages. |
| `README.md` | Primary technical documentation covering problem statement, privacy architecture, circuit definitions, installation, and evaluation status. |
| `vercel.json` | Deployment routing rules for hosting the React frontend single-page application on Vercel. |
| `.github/workflows/ci.yml` | GitHub Actions CI pipeline automating contract compilation, linting with `oxlint`, Vitest execution, and Vite bundling. |

---

## 2. Smart Contract Module (`contract/`)

| Path | Module Responsibility |
| :--- | :--- |
| `contract/src/index.compact` | Official Midnight Compact smart contract. Defines public ledger state (`election_id`, `candidate_votes`, `nullifiers`), private witness function declarations, and 6 zero-knowledge circuits (`initialize`, `register_candidate`, `open_election`, `cast_vote`, `close_election`, `finalize_election`). |
| `contract/compile.js` | Contract build script. Validates `index.compact`, generates TypeScript type definitions (`dist/index.d.ts`), JavaScript contract simulator (`dist/index.js`), and managed circuit metadata (`managed/circuits.json`). |
| `contract/deploy.js` | On-chain deployment pipeline script. Interacts with `@midnight-network/midnight-js` SDK to deploy the compiled Compact contract to Devnet/Testnet. Automatically operates in transparent Simulation Mode when running without live node keys. |
| `contract/deployed-address.json` | Output artifact storing deployment status metadata (`SIMULATED` vs `ON-CHAIN`), contract address, transaction hash, and timestamp. |
| `contract/package.json` | NPM package manifest for the smart contract library (`votevault-contract`). |

---

## 3. Frontend Context Layer (`frontend/src/context/`)

| Path | Module Responsibility |
| :--- | :--- |
| `VoteVaultContext.tsx` | Core React Context Provider. Manages global application state (active referendums, candidate tallies, wallet connection state, error handling) and interfaces with contract instances. |
| `MidnightClient.ts` | Integration client for `@midnight-network/midnight-js` and injected Lace Wallet (`window.midnight.mnLace`). Computes deterministic ZK nullifier hashes (`0x...`) and submits transactions to ledger nodes. |
| `ThemeContext.tsx` | Dark/Light mode theme engine managing CSS Custom Property design tokens dynamically. |

---

## 4. Frontend Page Views (`frontend/src/pages/`)

| Path | Module Responsibility |
| :--- | :--- |
| `LandingPage.tsx` | High-impact product landing page highlighting VoteVault's value proposition ("Vote Privately. Verify Publicly."), interactive lunar orbit visualizer, core security architecture cards, and privacy model section. |
| `VoterDashboard.tsx` | Main dashboard displaying active governance referendums, candidate cards, real-time vote tallies, participation statistics, and historical outcomes. |
| `ElectionPage.tsx` | Interactive ballot voting page where users select options, view privacy guarantees, and execute zero-knowledge vote submissions with Lace Wallet signing. |
| `ResultsPage.tsx` | Verification audit page displaying public ledger state, participation timeline charts, spent nullifier proof registries, and cryptographic receipt hashes. |
| `AdminConsole.tsx` | Governance administration interface allowing authorized users to create referendums, register candidates, open voting epochs, and finalize election results. |
| `ConnectWalletPage.tsx` | Dedicated wallet connection hub for authorizing Lace Wallet or fallback testnet wallets. |

---

## 5. Frontend Shared Components (`frontend/src/components/`)

| Path | Module Responsibility |
| :--- | :--- |
| `ThemeToggle.tsx` | Interactive switch component allowing instant toggling between sleek Dark Mode and high-contrast Light Mode. |
| `MoonPhase.tsx` | Custom SVG lunar phase animation representing Midnight network's privacy phase cycles. |

---

## 6. Testing Infrastructure (`tests/`)

| Path | Module Responsibility |
| :--- | :--- |
| `frontend/src/tests/VoteVault.test.tsx` | Vitest integration test suite testing wallet connection flows, vote tally increments, ZK nullifier generation, and election creation. |
| `frontend/tests/e2e.spec.ts` | Playwright end-to-end browser automation suite testing full user workflows across landing, dashboard, voting, and audit results pages. |
| `frontend/vitest.config.ts` | Vitest test runner configuration. |
| `frontend/playwright.config.ts` | Playwright E2E browser configuration specifying desktop Chromium targets and dev webserver rules. |

---

## 7. Documentation Suite (`docs/`)

| Path | Module Responsibility |
| :--- | :--- |
| `docs/architecture.md` | Complete system, application, contract, privacy, and transaction flow documentation with Mermaid diagrams. |
| `docs/privacy-model.md` | Mathematical and cryptographic documentation of Midnight state separation, selective disclosure, and nullifiers. |
| `docs/circuits.md` | Specification of all 6 Compact contract circuits. |
| `docs/deployment.md` | Deployment guide and honest status report covering simulator mode and on-chain deployment. |
| `docs/testing.md` | Comprehensive testing guide for running Vitest unit tests and Playwright E2E tests. |
| `docs/file-documentation.md` | Module index documenting every important file in the workspace. |
| `docs/final-review.md` | Compliance audit report mapping Level 1, Level 2, and Level 3 evaluation checklists with honest status indicators. |
