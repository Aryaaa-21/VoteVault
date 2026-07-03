
export interface ContractState {
  election_id: string;
  election_title: string;
  election_description: string;
  election_active: boolean;
  election_finalized: boolean;
  candidate_names: Map<bigint, string>;
  candidate_votes: Map<bigint, bigint>;
  total_votes: bigint;
  nullifiers: Map<string, boolean>;
  admin_pubkey: string;
}

export declare class VoteVaultContract {
  state: ContractState;
  constructor(initialState?: Partial<ContractState>);
  initialize(admin: string, id: string, title: string, description: string): void;
  register_candidate(admin_sig: string, index: bigint, name: string): void;
  open_election(admin_sig: string): void;
  close_election(admin_sig: string): void;
  finalize_election(admin_sig: string): void;
  cast_vote(nullifier: string, candidate_index: bigint): void;
}
