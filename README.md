# VoteVault

> **A little proof. A lot left private.**

VoteVault is a Midnight Network dApp for private allowlist access. An operator publishes a room rule and enrolls salted credential commitments. A visitor proves, with a Compact circuit, that a private score clears the rule and that their credential is in the operator-approved Merkle tree. The chain records the accepted result and a replay-resistant receipt without recording the score, secret, selected leaf, or Merkle path.

**Project status:** local contract compilation, generated ZK artifacts, contract tests, frontend tests, production build, and CI configuration are included. A public deployment, screenshots, demo recording, product social profile, and commit history are intentionally left for the project owner to create and verify.

## Product idea

Private research rooms, member circles, beta releases, and small gatherings often need to answer one question: “is this visitor eligible?” They should not need to collect a wallet address, inspect a credential, or publish a guest list to answer it. VoteVault makes the eligibility decision verifiable while keeping the reason for eligibility inside a private proving witness. It is deliberately a narrow Level 3 **Private Allowlist Access** proposal rather than a general identity system.

## What is included

- `contracts/stillwater.compact` — Compact contract with public room state, private witnesses, `disclose()`, operator enrollment, Merkle membership, threshold checks, expiry, capacity, lifecycle controls, and one-time receipts.
- `contracts/managed/stillwater` — generated contract bindings, circuits, prover keys, verifier keys, and ZKIR artifacts. Regenerate with `npm run compile`; do not hand edit this directory.
- `frontend/` — React + Vite dApp with wallet selection, Preview/Preprod switching, private pass flow, public record, privacy notes, and browser-based operator Studio.
- `docs/` — setup, usage, privacy, and submission evidence guidance.
- `.github/workflows/` — CI on pushes and pull requests, plus a release build workflow.

## Privacy model

### Public by design

The public ledger and transaction transcript can reveal:

- room minimum score, salt, expiry, issuer commitment, capacity, and open/sealed state;
- the operator commitment and the current authorized-credential Merkle root;
- aggregate accepted-visitor count;
- spent room-scoped receipt/nullifier values;
- the contract and circuit called, transaction timing, and network metadata.

### Private witness data

The browser/wallet witness supplies:

- the visitor score;
- the visitor’s 32-byte secret;
- the derived credential commitment preimage;
- the selected credential leaf and Merkle authentication path;
- the operator secret for operator-only circuits.

Circuit arguments are public, so VoteVault does not pass the score or secret as circuit arguments. `disclose()` is used only where a value intentionally crosses into public ledger state. The Compact proof demonstrates that private inputs satisfied the checks; it does not make the existence, timing, circuit name, or public state transition invisible. Remote wallet/proving providers may observe operational metadata, and a very small room or outside timing information can weaken practical unlinkability.

## Requirements

- Node.js 22 and npm 10+
- Compact manager/compiler 0.31.1
- Docker Desktop for the optional local Midnight environment
- Lace, 1AM, Nightly, or another compatible Midnight browser wallet for Preview/Preprod transactions
- WSL Ubuntu on Windows when compiling locally on Windows (the Windows `compact.exe` utility is not the Compact compiler)

Check the toolchain:

```bash
node --version
npm --version
compact --version
```

## Local setup

```bash
npm install
npm run compile
npm test
npm run typecheck
npm run build
```

`npm run compile` calls the Compact compiler with the pinned version, verifies the runtime/compiler versions, verifies every proving/verifying artifact, and copies generated assets into `frontend/src/managed` and `frontend/public/managed`.

Start the frontend:

```bash
npm run dev
```

The app prints a local Vite URL. It can be explored without a wallet. A transaction requires a wallet connected to the selected network and a configured contract.

Optional local services:

```bash
npm run env:up
npm run compile
npm run env:down
```

## Preview and Preprod configuration

Copy `.env.preprod.example` to a private environment file when using Node-side tooling. Never commit seed phrases, mnemonics, operator secrets, or private pass backups.

Frontend configuration uses these Vite variables:

```bash
VITE_PREVIEW_CONTRACT_ADDRESS=
VITE_PREPROD_CONTRACT_ADDRESS=
VITE_PREVIEW_INDEXER_URL=https://indexer.preview.midnight.network/api/v4/graphql
VITE_PREVIEW_INDEXER_WS=wss://indexer.preview.midnight.network/api/v4/graphql/ws
VITE_PREPROD_INDEXER_URL=https://indexer.preprod.midnight.network/api/v4/graphql
VITE_PREPROD_INDEXER_WS=wss://indexer.preprod.midnight.network/api/v4/graphql/ws
```

A freshly deployed address is scoped to the selected network and stored in browser storage by the Studio page. The app does not use an old generic address fallback.

## Browser deployment and first pass

1. Open **Studio** and select Preview or Preprod.
2. Connect the operator wallet on the same network.
3. Keep the generated operator secret in memory, or explicitly import an acknowledged backup. Store a backup in a secure password manager if the operator must return later.
4. Choose a minimum score, capacity, and future expiry, then deploy.
5. Wait for indexed confirmation. A wallet acceptance or returned transaction id is not proof that a contract succeeded.
6. Copy the address and open the network-aware explorer link.
7. In **Your pass**, generate/import a 32-byte visitor secret and enter the private score.
8. Copy the derived credential commitment and give it to the operator through a trusted channel.
9. The operator enrolls that commitment in Studio. The visitor refreshes, connects a wallet, and submits the pass claim.
10. Verify the public record shows only the room transition, aggregate counter, root, and receipt—not the score or secret.

The generated constructor order is:

```text
(minimum: Uint<64>, salt: Bytes<32>, valid_until: Uint<64>, issuer: Bytes<32>, operator_hash: Bytes<32>, limit: Uint<32>)
```

## Verification commands

```bash
npm run compile       # Compact + generated managed artifacts
npm test              # 19 contract/runtime privacy tests
npm run typecheck     # frontend TypeScript
npm run build         # production frontend + root dist copy
npm run check         # compile, typecheck, contract tests, build
```

Frontend logic tests can also be run directly:

```bash
npx vitest run --root frontend --config ../vitest.config.ts
```

## Level 1–4 readiness audit

| Level | Local implementation | Evidence still required from the owner |
|---|---|---|
| 1 — New Moon | Compact contract, generated `managed/`, 19 passing runtime tests, setup docs, public/private explanation, deployer UI | Preview/Preprod address, compile screenshot, deployment screenshot, public repository, five meaningful commits, initial idea submission |
| 2 — Waxing Crescent | Wallet connect/disconnect, wallet selection, strict network matching, private Merkle claim flow, indexed confirmation states | Real Lace/1AM session, verifiable deployed address, live demo, wallet + proof video, eight meaningful commits |
| 3 — First Quarter | Private Allowlist Access proposal, 19 contract tests, frontend tests, CI workflow, responsive polished dApp, truthful privacy documentation | Passing remote CI run/badge, three-test screenshot, live demo, one-minute demo, approval submission, ten meaningful commits |
| 4 — Waxing Gibbous | Browser Studio deployment/admin page, technical/user docs, release workflow, day/night theme, public-record observatory, product-ready responsive UI | MVP deployed to Preprod, public product profile linked here, demo video, screenshots, passing CI badge, fifteen meaningful commits |

Do not mark the external evidence as complete until it is genuinely produced. In particular, this repository does not claim a contract address, live URL, social profile, screenshots, demo video, or commit count.

## Manual submission checklist

- [ ] Run `npm run compile`, save a screenshot with all five circuits and generated artifacts visible.
- [ ] Deploy from Studio on Preview or Preprod and verify indexed success in the explorer.
- [ ] Add the verified contract address to the network-specific environment/deployment configuration.
- [ ] Capture the wallet connect → enrollment → private claim flow without exposing secrets in the recording.
- [ ] Add a live demo, public product profile, screenshots, and demo video to this README after they exist.
- [ ] Push to a public repository and create at least 15 meaningful commits across the build history.
- [ ] Submit the Level 3 Private Allowlist Access proposal for approval.

## Design system

VoteVault uses an editorial field-notes direction: Playfair Display for considered hierarchy, DM Sans for interface copy, IBM Plex Mono for addresses and circuit metadata, warm mineral surfaces, deep forest night mode, copper focus/action accents, and locally served lake/forest imagery. The system is documented in `design-system/votevault/MASTER.md` and `design-system/votevault/IMPLEMENTATION.md`. Day/night preference is stored under `VOTEVAULT_THEME` and is fully semantic rather than a second page skin.

Image/font provenance is documented in `frontend/public/images/ATTRIBUTION.md`. Decorative imagery is not chain evidence.

## License

MIT. See [`LICENSE`](LICENSE).
