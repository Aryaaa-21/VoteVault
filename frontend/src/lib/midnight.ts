import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { toHex, fromHex } from '@midnight-ntwrk/midnight-js-contracts';

export interface ConnectedSession {
  unshieldedAddress: string;
  shieldedAddress: any;
  config: any;
  providers: {
    privateStateProvider: any;
    publicDataProvider: any;
    zkConfigProvider: any;
    proofProvider: any;
    walletProvider: any;
  };
}

export async function createConnectedSession(api: any): Promise<ConnectedSession> {
  const [config, unshieldedAddr, shieldedAddress] = await Promise.all([
    api.getConfiguration(),
    api.getUnshieldedAddress(),
    api.getShieldedAddresses(),
  ]);

  // Set the active network (Preview / Preprod)
  setNetworkId(config.networkId);

  // Serve compiled ZK keys & artifacts from the public directory (e.g., /managed)
  const zkConfigProvider = new FetchZkConfigProvider(
    new URL('/managed', window.location.origin).toString(),
    window.fetch.bind(window),
  );

  const provingProvider = await api.getProvingProvider(zkConfigProvider);

  const proofProvider = {
    async proveTx(unprovenTx: any, _config: any) {
      const { CostModel } = await import('@midnight-ntwrk/ledger-v8');
      return unprovenTx.prove(provingProvider, CostModel.initialCostModel());
    },
  };

  const walletProvider = {
    getCoinPublicKey: () => shieldedAddress.shieldedCoinPublicKey,
    getEncryptionPublicKey: () => shieldedAddress.shieldedEncryptionPublicKey,
    balanceTx: async (tx: any) => {
      const txHex = toHex(tx.serialize());
      const balanced = await api.balanceUnsealedTransaction(txHex);
      if (!balanced?.tx) throw new Error('balanceUnsealedTransaction failed');
      const { Transaction } = await import('@midnight-ntwrk/ledger-v8');
      return Transaction.deserialize('signature', 'proof', 'binding', fromHex(balanced.tx));
    },
  };

  return {
    unshieldedAddress: unshieldedAddr,
    shieldedAddress,
    config,
    providers: {
      privateStateProvider: (window as any).privateStateProvider ?? {
        get: async () => null,
        set: async () => {},
      },
      publicDataProvider: api.getPublicDataProvider ? await api.getPublicDataProvider() : null,
      zkConfigProvider,
      proofProvider,
      walletProvider,
    },
  };
}
