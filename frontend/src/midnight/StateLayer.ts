export interface PublicLedgerSummary {
  electionId: string;
  title: string;
  totalVotes: bigint;
  electionActive: boolean;
  electionFinalized: boolean;
  candidateVotes: Map<bigint, bigint>;
  spentNullifierCount: number;
}

export class StateLayer {
  public parseLedgerSummary(contractState: any): PublicLedgerSummary {
    return {
      electionId: contractState.election_id || '',
      title: contractState.election_title || '',
      totalVotes: contractState.total_votes || 0n,
      electionActive: Boolean(contractState.election_active),
      electionFinalized: Boolean(contractState.election_finalized),
      candidateVotes: contractState.candidate_votes || new Map(),
      spentNullifierCount: contractState.nullifiers ? contractState.nullifiers.size : 0
    };
  }
}
