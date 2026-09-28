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
    midnightProvider: any;
  };
}

export async function createConnectedSession(api: any): Promise<ConnectedSession> {
  const [config, unshieldedAddr, shieldedAddressResult] = await Promise.all([
    typeof api.getConfiguration === 'function'
      ? api.getConfiguration()
      : { networkId: import.meta.env.VITE_NETWORK_ID || 'preview' },
    api.getUnshieldedAddress(),
    typeof api.getShieldedAddresses === 'function'
      ? api.getShieldedAddresses()
      : {
          shieldedCoinPublicKey: '',
          shieldedEncryptionPublicKey: '',
        },
  ]);

  // Connector implementations may return either the address object directly
  // or an array containing the first address. Normalize both forms so a
  // connected wallet can still deploy when optional wallet APIs are absent.
  const shieldedAddress = Array.isArray(shieldedAddressResult)
    ? shieldedAddressResult[0]
    : shieldedAddressResult;

  // Set the active network (Preview / Preprod)
  setNetworkId(config.networkId);

  // Serve compiled ZK keys & artifacts from the public directory (e.g., /managed)
  const zkConfigProvider = new FetchZkConfigProvider(
    new URL('/managed', window.location.origin).toString(),
    window.fetch.bind(window),
  );

  const provingProvider = typeof api.getProvingProvider === 'function'
    ? await api.getProvingProvider(zkConfigProvider)
    : {
        proveTx: async (unprovenTx: any) => unprovenTx,
      };

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
    unshieldedAddress: unshieldedAddr.unshieldedAddress,
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
      midnightProvider: {
        submitTx: async (tx: any) => {
          const txHex = toHex(tx.serialize());
          await api.submitTransaction(txHex);
          return txHex.slice(0, 64);
        },
      },
    },
  };
}
