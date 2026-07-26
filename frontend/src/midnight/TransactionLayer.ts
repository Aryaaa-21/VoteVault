import { ProofLayer, ZKWitnessProof } from './ProofLayer';

export interface SubmittedTransaction {
  txHash: string;
  nullifier: string;
  blockTimestamp: string;
  status: 'CONFIRMED' | 'PENDING' | 'REJECTED';
}

export class TransactionLayer {
  private proofLayer: ProofLayer;

  constructor() {
    this.proofLayer = new ProofLayer();
  }

  public async submitVoteTransaction(
    electionId: string,
    candidateIndex: number,
    walletAddress: string,
    walletApi?: any
  ): Promise<SubmittedTransaction> {
    console.log(`[TransactionLayer] Constructing transaction for election ${electionId}`);

    // Generate ZK proof
    const witnessProof: ZKWitnessProof = await this.proofLayer.generateCastVoteProof(
      electionId,
      candidateIndex,
      walletAddress
    );

    if (walletApi && typeof walletApi.submitTx === 'function') {
      const txHash = await walletApi.submitTx({
        circuit: 'cast_vote',
        args: [witnessProof.nullifier, BigInt(candidateIndex)]
      });
      return {
        txHash,
        nullifier: witnessProof.nullifier,
        blockTimestamp: new Date().toISOString(),
        status: 'CONFIRMED'
      };
    }

    const mockTxHash = `0xmocktx_${Array.from({length: 32}, () => Math.floor(Math.random()*16).toString(16)).join('')}`;
    return {
      txHash: mockTxHash,
      nullifier: witnessProof.nullifier,
      blockTimestamp: new Date().toISOString(),
      status: 'CONFIRMED'
    };
  }
}
