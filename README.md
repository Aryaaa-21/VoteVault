# VoteVault

[![CI/CD Pipeline](https://github.com/Aryaaa-21/VoteVault/actions/workflows/ci.yaml/badge.svg)](https://github.com/Aryaaa-21/VoteVault/actions)
[![Midnight Preview / Preprod Ready](https://img.shields.io/badge/Midnight-Preview%20%2F%20Preprod%20Ready-blueviolet)](https://midnight.network/)
[![Contract Tests](https://img.shields.io/badge/Contract%20Tests-19%20passing-2ea44f)](https://github.com/Aryaaa-21/VoteVault/actions)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

### Private eligibility, visibly verified.

VoteVault is a privacy-first allowlist gate for Midnight Network. An operator publishes a public room rule and enrolls salted credential commitments. A visitor proves that a private score clears the rule and that their credential belongs to the operator-approved Merkle tree, while the score, secret, selected leaf, and Merkle path remain inside the proving session.

<p align="center">
  <img src="frontend/public/images/votevault-lake.jpg" alt="VoteVault editorial lake interface atmosphere" width="100%" />
</p>

> **Project state:** The Compact contract, generated proving artifacts, deterministic tests, frontend, CI workflow, and release configuration are included. A Preprod contract address, public deployment, demo video, screenshots, and official social profile are intentionally not claimed until they are genuinely verified.

---

## 🚀 Local Demo & Deployment Status

- 🌐 **Run the web application locally:** `npm run dev` → [http://localhost:5173](http://localhost:5173)
- 📦 **Public repository:** [github.com/Aryaaa-21/VoteVault](https://github.com/Aryaaa-21/VoteVault)
- 🧪 **CI/CD pipeline:** [View GitHub Actions](https://github.com/Aryaaa-21/VoteVault/actions)
- 📜 **Contract address:** Not configured; deploy from **Studio** on Midnight Preview or Preprod first
- 🧭 **Explorer:** The application creates a network-aware explorer link after a verified address is configured
- 🛡️ **Deployment status:** Preview/Preprod ready; no external deployment is claimed by this repository

The app is intentionally usable without a wallet for exploring the interface. Deployment and private claims require a compatible Midnight browser wallet, generated proving assets, an indexed contract, and the selected network configuration.

---

## 📸 Interface & Visual Evidence

The repository currently contains atmospheric editorial imagery rather than fabricated product screenshots. These images are used by the frontend and are not chain evidence.

### Screenshot-ready landing atmosphere

The landing page uses a warm lake image to establish the quiet, editorial direction of VoteVault. Start the frontend locally to view the complete responsive interface.

<p align="center">
  <img src="frontend/public/images/votevault-lake.jpg" alt="VoteVault lake visual used by the landing page" width="88%" />
</p>

### Screenshot-ready privacy atmosphere

The privacy and public-record pages use a forest image to separate the private witness story from the public ledger surface.

<p align="center">
  <img src="frontend/public/images/votevault-forest.jpg" alt="VoteVault forest visual used by the privacy pages" width="88%" />
</p>

### Evidence still required

- [ ] Capture the landing page and responsive navigation.
- [ ] Capture the **Your pass** private proving flow without exposing secrets.
- [ ] Capture the **Public record** indexed ledger state.
- [ ] Capture the **Studio** deployment and operator controls.
- [ ] Capture the passing CI workflow after the repository checks complete remotely.

---

## 🎨 Brand Assets

- **Application favicon:** [`frontend/public/favicon.svg`](frontend/public/favicon.svg)
- **Lake atmosphere:** [`frontend/public/images/votevault-lake.jpg`](frontend/public/images/votevault-lake.jpg)
- **Forest atmosphere:** [`frontend/public/images/votevault-forest.jpg`](frontend/public/images/votevault-forest.jpg)
- **Image/font provenance:** [`frontend/public/images/ATTRIBUTION.md`](frontend/public/images/ATTRIBUTION.md)

The imagery is decorative and locally served. It is not used as contract evidence, identity data, or proof material.

---

## Product idea

Private research rooms, member circles, beta releases, and small gatherings should be able to answer one question—“is this visitor eligible?”—without turning a guest list into a public identity map. VoteVault gives an operator a verifiable gate: publish the rule, enroll a commitment, let a visitor prove that their private signal meets the rule, and record only an anonymous one-time result.

The pattern is deliberately narrow. It supports confidential credentials, private allowlists, invitation-only access, and small community rooms without requiring the operator to publish a visitor's score, secret, source credential, or Merkle path.

## Why VoteVault is different

- **Private allowlist access:** the selected product surface is eligibility, not a general identity system.
- **A deliberate public surface:** minimum score, room salt, expiry, issuer commitment, capacity, status, aggregate count, and replay-resistant receipts only.
- **A real Compact contract:** operator enrollment, Merkle membership, threshold checks, room lifecycle controls, and domain-separated receipts.
- **A browser deployment portal:** connect a Midnight wallet, deploy compiled artifacts, configure a network-scoped address, and open the explorer.
- **A calm public record:** inspect indexed public state without exposing private member data.
- **Explicit wallet and transaction states:** connection, proving, submission, indexed confirmation, and failure are kept distinct.
- **Day/night UI:** semantic tokens, visible focus states, reduced-motion-safe styling, and responsive layouts.

## Architecture

```text
contracts/stillwater.compact
        │ compact 0.31.1
        ▼
contracts/managed/stillwater/       generated bindings + zkir + prover/verifier keys
        │ npm run copy:managed
        ├── frontend/src/managed/contract/
        └── frontend/public/managed/

React + Vite
  ├── Your pass       private score, secret, commitment and claim flow
  ├── Public record   indexed public room state and receipts
  ├── Studio          browser deployment, enrollment and lifecycle controls
  └── Privacy notes   public/private boundary and disclosure model

Midnight browser wallet
  ├── DApp Connector API discovery
  ├── Preview / Preprod network matching
  ├── proving and transaction balancing
  └── wallet approval + indexed confirmation
```

The generated artifact directory keeps the existing `stillwater` technical namespace and domain-separated tags as a compatibility boundary. The public product, package metadata, interface, and documentation are branded VoteVault; the internal namespace is not user-facing and is left stable to avoid changing contract behavior.

## Privacy model

### Public on-chain ledger

The following values are intentionally exported by `contracts/stillwater.compact`:

- `minimum_signal` — the public rule a private signal must clear;
- `room_salt` and `issuer_id` — the active room domain and public issuer commitment;
- `expiry`, `room_live`, and `visitor_limit` — lifecycle and capacity controls;
- `operator_commitment` — the public commitment used to authorize operator circuits;
- `verified_visitors` — the aggregate successful-claim count;
- `spent_tokens` and `receipt_book` — replay protection and room-scoped public receipts;
- the circuit called, transaction timing, network metadata, and indexed status.

### Private client witness

The following values are supplied by browser witness callbacks and do not become circuit arguments:

- `get_private_signal()` — the private value compared with `minimum_signal`;
- `get_room_secret()` — the member secret used to derive the credential and receipt;
- `find_credential_path()` — the selected Merkle authentication path;
- `operator_secret()` — the private secret used for operator authorization.

`disclose()` is used only when a value is intentionally moved into public ledger state. A proof demonstrates that the private signal met the rule and that the credential is in the authorized tree; it does not disclose the signal, secret, selected leaf, or path. Observers can see that `claim_pass` occurred, when it occurred, that the room accepted it, and the resulting public receipt. They cannot recover the private witness values from the proof.

## Getting started

### Prerequisites

- Node.js 22+
- npm 10+
- Docker Desktop for the optional local network
- Compact compiler 0.31.1 (`compact`)
- A Midnight-compatible browser wallet such as Lace, 1AM, or Nightly for Preview/Preprod transactions
- WSL Ubuntu on Windows when compiling locally on Windows

Verify the toolchain:

```bash
node --version
npm --version
compact --version
```

### Install and compile

```bash
npm install
npm run compile
```

`npm run compile` compiles the Compact source, verifies the compiler/runtime metadata, and synchronizes the generated bindings and proving assets into the frontend. Do not hand-edit `contracts/managed/stillwater`; regenerate it with the compile command.

### Run the contract test suite

```bash
npm test
```

The deterministic suite covers initial state, eligible and ineligible witnesses, operator authorization, one-time receipts, Merkle membership, capacity, expiry, room lifecycle, and domain separation.

### Start the local network

```bash
npm run env:up
npm run compile
npm run test:local
npm run env:down
```

For a full local transaction flow, wait for the indexer and DUST services to be ready before submitting transactions. DUST is Midnight's transaction resource; it is not a private member credential.

### Run the frontend

```bash
npm run build
npm run dev
```

Open the Vite URL shown in the terminal. The browser requests compiled proving assets from `/managed`.

### Preview / Preprod environment

Copy `.env.preprod.example` to a private `.env.preprod` when using Node-side tooling. Never commit wallet seeds, mnemonics, operator secrets, visitor secrets, or private backups.

The frontend reads these network-specific variables:

```bash
VITE_PREVIEW_CONTRACT_ADDRESS=
VITE_PREPROD_CONTRACT_ADDRESS=
VITE_PREVIEW_INDEXER_URL=https://indexer.preview.midnight.network/api/v4/graphql
VITE_PREVIEW_INDEXER_WS=wss://indexer.preview.midnight.network/api/v4/graphql/ws
VITE_PREPROD_INDEXER_URL=https://indexer.preprod.midnight.network/api/v4/graphql
VITE_PREPROD_INDEXER_WS=wss://indexer.preprod.midnight.network/api/v4/graphql/ws
```

Contract addresses are intentionally empty by default. Studio stores a verified network-scoped address in browser storage after deployment is submitted; indexed confirmation must still be checked before sharing the address.

## Browser deployment flow

1. Open **Studio** and select Preview or Preprod.
2. Connect a compatible Midnight wallet on the selected network.
3. Keep the generated 32-byte operator secret in memory, or import an acknowledged backup.
4. Choose a minimum signal, visitor capacity, and future expiry.
5. Run the deployment and approve the transaction in the wallet.
6. Wait for indexed confirmation; wallet acceptance or a transaction id alone is not proof of success.
7. Copy the network-aware contract address and open its explorer link.
8. Enroll a visitor commitment in Studio through the operator circuit.
9. Open **Your pass**, generate/import a visitor secret, and enter the private score.
10. Share the derived commitment with the operator through a trusted channel, then submit the private claim after enrollment.
11. Use **Public record** to verify the room transition and aggregate receipt without exposing the private witness.

The generated constructor order is:

```text
(minimum: Uint<64>, salt: Bytes<32>, valid_until: Uint<64>, issuer: Bytes<32>, operator_hash: Bytes<32>, limit: Uint<32>)
```

## Level 1–4 cross-check

| Level | Implementation in VoteVault | Status & evidence |
|---|---|---|
| 1 — New Moon | Compact source, generated managed artifacts, deterministic runtime tests, setup docs, public/private explanation, deployment UI | ✅ Local implementation complete; external deployment evidence still required |
| 2 — Waxing Crescent | Wallet discovery, network matching, private Merkle claim flow, indexed confirmation states, public record | ✅ Implemented; real wallet session and deployed address still required |
| 3 — First Quarter | Private Allowlist Access proposal, 19 contract tests, frontend tests, CI workflow, responsive UI, privacy documentation | ✅ Implemented; passing remote CI evidence and demo capture still required |
| 4 — Waxing Gibbous | Browser Studio, technical/user docs, release workflow, day/night theme, public observatory surface | ✅ Product surface implemented; live deployment and public product profile still required |

## Evidence checklist

- [ ] Deploy the contract to Preview or Preprod and verify indexed success.
- [ ] Add the verified network-specific contract address to the deployment configuration.
- [ ] Capture the wallet connection → enrollment → private claim flow without exposing secrets.
- [ ] Add interface screenshots to this README after they are genuinely captured.
- [ ] Add a one-minute demo video and a public product profile after they exist.
- [x] Include Compact source, generated proving/verifying artifacts, deterministic tests, frontend tests, CI, and production build configuration.
- [x] Push the project to the public [VoteVault repository](https://github.com/Aryaaa-21/VoteVault).

## Design system

VoteVault uses an editorial field-notes direction rather than a generic crypto dashboard: Playfair Display for considered hierarchy, DM Sans for interface copy, IBM Plex Mono for cryptographic metadata, warm mineral surfaces, deep forest night mode, copper focus/action accents, and locally served lake/forest imagery. The day/night toggle uses `data-theme` semantic tokens and the `VOTEVAULT_THEME` preference key.

The interface keeps wallet states explicit, keeps transaction-critical actions solid, avoids logging private witness values, and treats decorative imagery as atmosphere rather than evidence. Image and font provenance is documented in [`frontend/public/images/ATTRIBUTION.md`](frontend/public/images/ATTRIBUTION.md).

## Useful commands

```bash
npm run compile       # compile + copy managed artifacts
npm test              # deterministic contract/runtime tests
npm run typecheck     # frontend TypeScript typecheck
npm run build         # production frontend build + root dist copy
npm run check         # compile, typecheck, tests, and build
npm run env:up        # start optional local Midnight services
npm run env:down      # stop optional local services
```

## License

MIT. See [`LICENSE`](LICENSE).
