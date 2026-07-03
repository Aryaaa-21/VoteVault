# VoteVault

> **Vote Privately. Verify Publicly.**

VoteVault is a decentralized, zero-knowledge voting dApp built on the **Midnight Network**. It leverages cardano-aligned privacy technology to enable users to cast ballots on referendums and elections with cryptographically guaranteed anonymity while maintaining 100% public verifiability of the outcomes.

---

## 1. Project Overview

### Problem Statement
Traditional voting systems force a trade-off between **privacy** and **integrity**. Public blockchains verify transactions transparently but expose individual choices, creating risks of voter intimidation, bribery, and coercion. Conversely, closed/centralized systems protect privacy but require trusting a central administrator to count votes honestly.

### Why Privacy Matters
In decentralized governance (DAOs), exposing wallet-to-vote mappings leads to:
- **Coercion**: Powerful entities targeting smaller delegates based on their choices.
- **Groupthink**: Voters waiting to see where the majority goes before signing.
- **Targeted Exploits**: Aligning wallet contents with governance opinions to exploit validators.

### Solution
VoteVault resolves this dilemma by separating **voter identity** from the **ballot choice**. Using Midnight's zero-knowledge capabilities, voters generate a proof of eligibility and a unique transaction nullifier on their own devices. The ledger records that a valid vote was cast without exposing *who* cast it or *which option* they selected, producing a publicly auditable ledger of anonymous results.

---

## 2. Features

- **Day/Night Theme Toggle**: Premium, system-aware design with custom grayscale/monochromatic theme switches.
- **Secure Wallet Connection**: Seamless integration with the **Lace Wallet** browser extension.
- **ZK Nullifiers**: Prevention of double-voting without tracking individual voter accounts.
- **Admin Deployment Console**: Simple panel for administrators to deploy new referendums, register candidate lists, and transition epochs.
- **Participation Timelines**: Minimalist grayscale graphs displaying voting progress over epochs.
- **Ledger Verification Table**: Live feed of cryptographic proof verification logs, state roots, and block signatures.

---

## 3. Technology Stack

- **Frontend**: React (v19), TypeScript, Vite, TailwindCSS (v4), Framer Motion
- **Smart Contract**: Midnight Compact (v0.23)
- **Client SDK**: Midnight.js SDK
- **Testing**: Vitest (Unit/State), Playwright (E2E)
- **Deployment**: Vercel

---

## 4. Folder Structure

```text
votevault/
├── contract/                  # Midnight Compact Smart Contract
│   ├── src/
│   │   └── index.compact     # Smart contract circuits and state rules
│   ├── compile.js             # Compiler run script
│   └── package.json
├── frontend/                  # React Single Page Application
│   ├── src/
│   │   ├── components/        # Shared components (ThemeToggle, etc.)
│   │   ├── context/           # App state (VoteVaultContext, ThemeContext)
│   │   ├── pages/             # Page components (Landing, Dashboard, Results, Admin)
│   │   ├── tests/             # Vitest unit test cases
│   │   └── index.css          # Theme CSS variable mappings
│   ├── tests/                 # Playwright E2E browser tests
│   ├── playwright.config.ts   # Playwright configuration
│   ├── tsconfig.app.json      # App TS configuration
│   └── vercel.json            # Vercel deployment rules
├── docs/                      # Extensive Documentation
│   ├── architecture.md
│   ├── privacy-model.md
│   ├── deployment.md
│   ├── testing.md
│   └── submission-checklist.md
└── README.md                  # Main project landing documentation
```

---

## 5. Installation & Local Development

### Prerequisites
- **Node.js**: v20 or later
- **Midnight Compact Toolchain**: Installed and configured on your shell path.

### Environment Setup
Create a `.env` file in `votevault/frontend/` with the following variables:
```env
VITE_MIDNIGHT_NETWORK_ID=midnight-devnet-3
VITE_CONTRACT_ADDRESS=0x5b38...3f1d
VITE_LACE_WALLET_PROVIDER=lace
```

### Installation
Clone the repository and install the dependencies:
```bash
# Install frontend packages
cd votevault/frontend
npm install

# Install contract packages
cd ../contract
npm install
```

### Compile the Smart Contract
Compile the Compact contract to generate ABI, types, and ZK verifier files:
```bash
cd votevault/contract
npm run compile
```

### Running Locally
To launch the frontend dev server:
```bash
cd votevault/frontend
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/) in your web browser.

---

## 6. Testing Instructions

### Unit & State Tests (Vitest)
Runs testing on wallet state updates, ballot tallies, and admin creations:
```bash
cd votevault/frontend
npm run test
```

### End-to-End Tests (Playwright)
Validates complete user flows inside simulated Chromium browsers:
```bash
# Install Playwright browser configurations
cd votevault/frontend
npx playwright install

# Run tests
npm run test:e2e
```

---

## 7. Privacy Model

VoteVault separates public verification from private identity:

| PUBLIC LEDGER (Transparent) | PRIVATE WITNESS (Encrypted) |
| :--- | :--- |
| Election IDs, Titles, and Descriptions | Voter Wallet Seed Phrases & Private Keys |
| Candidate/Option Registrations | Selected Vote Options |
| Aggregated Ballot Tallies | Voter Wallet-to-Vote Associations |
| Cryptographic Nullifier Hashes | User's Individual Vote History |

### ZK-Proof Operations
1. **Eligibility verification**: The client verifies they possess a registered credential.
2. **Uniqueness check**: A nullifier hash `H(wallet + election)` is generated. If the nullifier is unused, the vote choice is registered, and the nullifier is recorded publicly to prevent duplicate actions.

---

## 8. Live Demos & Media

### Screenshots Section
Detailed visual walkthroughs can be found in `docs/architecture.md`.

### Demo Video Section
Watch the [VoteVault Demo Video](https://example.com/demo-video) demonstrating the dark mode toggle and ZK ballot signing flows.

### Live Demo Section
The project is optimized for deployment at: [https://votevault-dapp.vercel.app](https://votevault-dapp.vercel.app)

---

## 9. Product Proposal & Roadmap

### Future Features
- **Multi-Credential Gates**: Integrate Cardano stake address checkpoints or specific NFT ownership proofs using selective disclosure.
- **Quadratic Voting**: Support fractioned weight structures based on token balances while keeping final weights hidden.
- **Offline Ballot Generation**: Pre-sign ballots on isolated hardware and submit them when connected online.

---

## 10. License & Acknowledgements

- **License**: MIT
- **Acknowledgements**: Built with support from the Input Output (IOG) team and the Midnight Network developer community.
