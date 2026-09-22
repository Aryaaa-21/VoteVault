export class VoteVaultContract {
  constructor(initialState = {}) {
    this.state = {
      election_id: initialState.election_id || '',
      election_title: initialState.election_title || '',
      election_description: initialState.election_description || '',
      election_active: initialState.election_active || false,
      election_finalized: initialState.election_finalized || false,
      election_deadline: initialState.election_deadline || 0n,
      candidate_names: initialState.candidate_names || new Map(),
      candidate_votes: initialState.candidate_votes || new Map(),
      total_votes: initialState.total_votes || 0n,
      nullifiers: initialState.nullifiers || new Map(),
      admin_pubkey: initialState.admin_pubkey || '',
      eligibility_merkle_root: initialState.eligibility_merkle_root || '',
    };
  }

  initialize(admin, id, title, description, deadline = 0n, merkle_root = '') {
    this.state.admin_pubkey = admin;
    this.state.election_id = id;
    this.state.election_title = title;
    this.state.election_description = description;
    this.state.eligibility_merkle_root = merkle_root;
    this.state.election_deadline = BigInt(deadline);
    this.state.election_active = false;
    this.state.election_finalized = false;
    this.state.total_votes = 0n;
  }

  register_candidate(admin_sig, index, name) {
    if (this.state.election_finalized) {
      throw new Error("Election is finalized");
    }
    this.state.candidate_names.set(BigInt(index), name);
    this.state.candidate_votes.set(BigInt(index), 0n);
  }

  open_election(admin_sig) {
    if (this.state.election_finalized) {
      throw new Error("Election is finalized");
    }
    this.state.election_active = true;
  }

  close_election(admin_sig) {
    this.state.election_active = false;
  }

  finalize_election(admin_sig) {
    this.state.election_active = false;
    this.state.election_finalized = true;
  }

  cast_vote(nullifier, candidate_index, votes, merkle_proof) {
    if (!this.state.election_active) {
      throw new Error("Election is not active");
    }
    if (this.state.election_finalized) {
      throw new Error("Election is finalized");
    }

    // Simulate Merkle Root validation
    if (this.state.eligibility_merkle_root && (!merkle_proof || merkle_proof.length === 0)) {
      throw new Error("Merkle proof verification failed");
    }

    const v = BigInt(votes || 1);
    if (v <= 0n) throw new Error("Must cast at least 1 vote");
    if (v * v > 100n) throw new Error("Quadratic voting budget exceeded (Max 100 credits)");

    const idx = BigInt(candidate_index);
    if (this.state.nullifiers.get(nullifier)) {
      throw new Error("Double voting detected: Nullifier already spent");
    }
    this.state.nullifiers.set(nullifier, true);
    const currentVotes = this.state.candidate_votes.get(idx) || 0n;
    this.state.candidate_votes.set(idx, currentVotes + v);
    this.state.total_votes = this.state.total_votes + v;
  }
}
