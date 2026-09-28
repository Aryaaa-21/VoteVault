# VoteVault product proposal

## Selected Level 3 problem

**Private Allowlist Access** — prove membership without revealing identity.

## Problem

Invitation-only communities, research rooms, private betas, and limited releases often use a spreadsheet, a wallet address, or a screenshot of a credential as an allowlist. These approaches create durable identity trails and make the host responsible for protecting more information than the access decision requires.

## Product

VoteVault is a selective-disclosure access room. An operator publishes a minimum score, expiry, capacity, and room salt. The operator enrolls salted credential commitments in a Compact Merkle tree. A visitor supplies a score, secret, credential leaf, and Merkle path as private witness data. The circuit proves the hidden score clears the rule and the hidden credential belongs to the approved tree, then records one public room-scoped receipt.

The operator learns that an eligible claim succeeded. The public chain does not receive the score, secret, selected leaf, or path. This is not an identity system and it does not claim protection from wallet-level metadata, timing analysis, or small anonymity sets.

## Users

- Operators of private research rooms, member circles, beta communities, and invite-only drops.
- Visitors who need a verifiable eligibility result without publishing the underlying credential.
- Auditors who need a public aggregate and replay-resistant receipt trail rather than a visitor directory.

## Public/private boundary

| Data | Location | Reason |
|---|---|---|
| Minimum score, room salt, expiry, issuer, capacity, live/sealed state | Public ledger | The network must agree on the active rule |
| Operator commitment and authorized Merkle root | Public ledger | Authorization and membership root must be verifiable |
| Accepted count and receipt/nullifier set | Public ledger | Aggregate accountability and replay prevention |
| Score and visitor secret | Private witness | Only the predicate is needed |
| Credential preimage, selected leaf, Merkle path | Private witness | Membership is proven without naming the leaf |
| Operator secret | Private witness | Operator circuits need knowledge, not disclosure |

`disclose()` is used deliberately at public state boundaries. A circuit argument is public, so sensitive visitor values are never passed as circuit parameters. Operator enrollment itself is public: it reveals that a commitment was approved, but the salted preimage is not included.

## Security decisions

- Credential commitments include `stillwater:credential:v1`, a private score, a private secret, and the current room salt.
- Credential membership uses `MerkleTree<10, Bytes<32>>`; the claim binds the supplied path leaf to the recomputed private commitment and checks the current root.
- Receipts and credentials use separate domain separators so the same secret cannot accidentally create the same value for two purposes.
- The claim circuit checks room status, future expiry, threshold, capacity, membership, and one-time receipt use before changing public state.
- Operator authorization uses a domain-separated commitment and a private witness. The operator secret is not a circuit argument.
- The operator can register commitments and seal/unseal or retune the room. Retuning does not erase the append-only credential tree, count, or spent receipts.

## Scope and roadmap

### Level 1 — New Moon

Compile the Compact contract, generate the managed circuits and keys, run deterministic tests, and deploy the first room to Preview or Preprod.

### Level 2 — Waxing Crescent

Connect a Midnight browser wallet, enroll a credential, submit a private claim, and make the public result observable without exposing the witness.

### Level 3 — First Quarter

Run the CI pipeline on every push, maintain contract and application tests, publish the privacy model, and submit this Private Allowlist Access proposal for approval.

### Level 4 — Waxing Gibbous

Operate an MVP room on Preprod with a documented deployment flow, public product profile, live demo, and release build.

### Later

Add verifiable-credential adapters, operator key rotation with explicit migration semantics, revocation policy, selective receipts for operators, a formal Compact/security review, and production wallet/prover threat-model documentation.
