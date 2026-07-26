import { VoteVaultContract } from 'votevault-contract';

export class ContractLayer {
  private instances: Map<string, VoteVaultContract> = new Map();

  public getContractInstance(electionId: string): VoteVaultContract {
    let instance = this.instances.get(electionId);
    if (!instance) {
      instance = new VoteVaultContract();
      instance.initialize(
        'admin-pubkey-0x123',
        electionId,
        'Election Referendum',
        'Decentralized governance referendum proposal'
      );
      this.instances.set(electionId, instance);
    }
    return instance;
  }

  public registerInstance(electionId: string, instance: VoteVaultContract): void {
    this.instances.set(electionId, instance);
  }
}
