
export class VoteVaultContract {
  constructor(initialState = {}) {
    this.state = {
      election_id: initialState.election_id || '',
      election_title: initialState.election_title || '',
      election_description: initialState.election_description || '',
      election_active: initialState.election_active || false,
      election_finalized: initialState.election_finalized || false,
      candidate_names: initialState.candidate_names || new Map(),
      candidate_votes: initialState.candidate_votes || new Map(),
      total_votes: initialState.total_votes || 0n,
      nullifiers: initialState.nullifiers || new Map(),
      admin_pubkey: initialState.admin_pubkey || '',
    };
  }

  initialize(admin, id, title, description) {
    this.state.admin_pubkey = admin;
    this.state.election_id = id;
    this.state.election_title = title;
    this.state.election_description = description;
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

  cast_vote(nullifier, candidate_index) {
    if (!this.state.election_active) {
      throw new Error("Election is not active");
    }
    if (this.state.election_finalized) {
      throw new Error("Election is finalized");
    }
    const idx = BigInt(candidate_index);
    if (this.state.nullifiers.get(nullifier)) {
      throw new Error("Double voting detected: Nullifier already spent");
    }
    this.state.nullifiers.set(nullifier, true);
    const currentVotes = this.state.candidate_votes.get(idx) || 0n;
    this.state.candidate_votes.set(idx, currentVotes + 1n);
    this.state.total_votes = this.state.total_votes + 1n;
  }
}
