# VoteVault: Privacy Model

VoteVault relies on the zero-knowledge features of the **Midnight Network** to achieve decentralized, tamper-proof voting while preserving the anonymity of individual voters.

## 1. State Separation

To ensure security and voter privacy, the data model splits information into two distinct classifications:

### Public Information (Stored On-Chain)
This data is visible to all network participants to ensure transparency and public auditability:
- **Election Metadata**: Title, ID, description, start/end dates.
- **Candidate Lists**: Names and designated index numbers.
- **Aggregated Tallies**: Total votes cast for each option.
- **Consensus Logs**: Proof verification roots, block heights, and cryptographic signatures.
- **Used Nullifier List**: A ledger map of computed nullifier hashes. This is public to prevent duplicate ballot submissions, but has no relation to the voter's identity.

### Private Information (Client-Side Only)
This data is processed locally on the voter's device and is never submitted to the blockchain:
- **Voter Identity**: The voter's private keys, seed phrases, or wallet addresses.
- **Individual Vote Selection**: Which candidate/option the user voted for (only the incremented total is published).
- **Wallet-to-Vote Mapping**: The link between a user's wallet address and their choice.
- **Voting History**: Records of which specific referendums the user has participated in.

---

## 2. Double-Voting Prevention: Cryptographic Nullifiers

To prevent duplicate votes without tracking voter identities, VoteVault uses **ZK Nullifiers**. 

$$\text{Nullifier Hash} = \text{Hash}(\text{Secret Salt} + \text{Voter Wallet Key} + \text{Election ID})$$

1. When a user votes, the client computes this hash locally.
2. The `cast_vote` circuit checks if this hash exists in the public `nullifiers` ledger map.
3. If it is already marked `true`, the contract rejects the transaction (double-voting prevented).
4. If it is unused, it is added to the map, and the vote choice increment is processed.
5. Because the hash is one-way, it is computationally impossible to backtrack the hash to reveal the voter's wallet address or identity.

---

## 3. Observability and Verifiability
A voter can confirm that their vote was recorded by checking their local transaction receipts containing their computed nullifier hash. Anyone can audit the public ledger to see that:
1. Total votes match the sum of increments.
2. Every increment corresponds to a valid ZK-SNARK proof.
3. No duplicate nullifiers exist on the ledger.
