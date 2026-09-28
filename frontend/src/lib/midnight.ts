import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { createProofProvider } from '@midnight-ntwrk/midnight-js-types';
import type { MidnightProvider, WalletProvider } from '@midnight-ntwrk/midnight-js-types';
import { ContractState } from '@midnight-ntwrk/compact-runtime';
import { Transaction } from '@midnight-ntwrk/ledger-v8';

export function toHex(bytes: Uint8Array | number[] | string): string {
  if (typeof bytes === 'string') return bytes.replace(/^0x/, '').toLowerCase();
  return Array.from(bytes, (byte) => Number(byte).toString(16).padStart(2, '0')).join('');
}

export function fromHex(hex: string): Uint8Array {
  const normalized = hex.trim().replace(/^0x/, '');
  if (normalized.length % 2 || !/^[0-9a-f]*$/i.test(normalized)) throw new Error('Expected a hexadecimal secret.');
  const result = new Uint8Array(normalized.length / 2);
  for (let index = 0; index < result.length; index += 1) {
    result[index] = Number.parseInt(normalized.slice(index * 2, index * 2 + 2), 16);
  }
  return result;
}

export function validateSecretHex(secret: string): string {
  const normalized = secret.trim().replace(/^0x/, '');
  if (!/^[0-9a-f]{64}$/i.test(normalized)) throw new Error('Secret must be exactly 32 bytes (64 hexadecimal characters).');
  return normalized.toLowerCase();
}

export function randomSecretHex(): string {
  if (typeof globalThis.crypto === 'undefined') throw new Error('Secure randomness is unavailable in this browser.');
  return toHex(globalThis.crypto.getRandomValues(new Uint8Array(32)));
}

export function createPrivateStateProvider() {
  let scope = '';
  const state = new Map<string, unknown>();
  const signingKeys = new Map<string, unknown>();
  const scopedKey = (id: string) => {
    if (!scope) throw new Error('Private state address has not been selected.');
    return `${scope}:${id}`;
  };
  return {
    setContractAddress(address: string) { scope = address; },
    async set(id: string, value: unknown) { state.set(scopedKey(id), value); },
    async get(id: string) { return state.get(scopedKey(id)) ?? null; },
    async remove(id: string) { state.delete(scopedKey(id)); },
    async clear() { state.clear(); signingKeys.clear(); scope = ''; },
    async setSigningKey(address: string, value: unknown) { signingKeys.set(address, value); },
    async getSigningKey(address: string) { return signingKeys.get(address) ?? null; },
    async removeSigningKey(address: string) { signingKeys.delete(address); },
    async clearSigningKeys() { signingKeys.clear(); },
    async exportPrivateStates() { throw new Error('Private state export is disabled for this in-memory browser session.'); },
    async importPrivateStates() { throw new Error('Private state import is disabled for this in-memory browser session.'); },
    async exportSigningKeys() { throw new Error('Signing key export is disabled for this in-memory browser session.'); },
    async importSigningKeys() { throw new Error('Signing key import is disabled for this in-memory browser session.'); },
  };
}

export function createPatchedPublicDataProvider(queryUrl: string, subscriptionUrl: string) {
  const base = indexerPublicDataProvider(queryUrl, subscriptionUrl);
  return {
    ...base,
    async queryContractState(contractAddress: string, config?: unknown) {
      // The installed indexer provider already uses the v4 contractAction query and
      // deserializes the state. Keeping this wrapper preserves the old app export while
      // allowing tests to inject a provider without constructing an Apollo client.
      return base.queryContractState(contractAddress, config as any);
    },
  };
}

export type ConnectedSession = {
  api: any;
  config: { networkId: string; indexerUri: string; indexerWsUri: string; substrateNodeUri: string };
  networkId: string;
  unshieldedAddress: string;
  providers: {
    privateStateProvider: ReturnType<typeof createPrivateStateProvider>;
    publicDataProvider: ReturnType<typeof createPatchedPublicDataProvider>;
    zkConfigProvider: FetchZkConfigProvider<any>;
    proofProvider: ReturnType<typeof createProofProvider>;
    walletProvider: WalletProvider;
    midnightProvider: MidnightProvider;
  };
};

export async function createConnectedSession(api: any, expectedNetwork?: 'preview' | 'preprod'): Promise<ConnectedSession> {
  const [config, unshielded, shielded] = await Promise.all([
    api.getConfiguration(),
    api.getUnshieldedAddress(),
    api.getShieldedAddresses(),
  ]);
  if (expectedNetwork && config.networkId !== expectedNetwork) {
    throw new Error(`Wallet is connected to ${config.networkId}, but VoteVault requested ${expectedNetwork}. Switch networks in the wallet and reconnect.`);
  }
  if (config.networkId !== 'preview' && config.networkId !== 'preprod') {
    throw new Error(`Unsupported Midnight network: ${config.networkId}. VoteVault supports Preview and Preprod only.`);
  }
  setNetworkId(config.networkId);

  const zkConfigProvider = new FetchZkConfigProvider(
    new URL('/managed', window.location.origin).toString(),
    window.fetch.bind(window),
  );
  const provingProvider = await api.getProvingProvider(zkConfigProvider);
  const privateStateProvider = createPrivateStateProvider();
  const publicDataProvider = createPatchedPublicDataProvider(config.indexerUri, config.indexerWsUri);
  const proofProvider = createProofProvider(provingProvider);
  const walletProvider: WalletProvider = {
    getCoinPublicKey: () => shielded.shieldedCoinPublicKey,
    getEncryptionPublicKey: () => shielded.shieldedEncryptionPublicKey,
    balanceTx: async (tx: any) => {
      const balanced = await api.balanceUnsealedTransaction(toHex(tx.serialize()), { payFees: true });
      if (!balanced?.tx) throw new Error('The wallet did not return a balanced transaction.');
      return Transaction.deserialize('signature', 'proof', 'binding', fromHex(balanced.tx)) as any;
    },
  };
  const midnightProvider: MidnightProvider = {
    submitTx: async (tx: any) => {
      const identifiers = typeof tx.identifiers === 'function' ? tx.identifiers() : [];
      const txId = identifiers[0];
      await api.submitTransaction(toHex(tx.serialize()));
      return txId || tx.transactionHash();
    },
  };
  return {
    api,
    config,
    networkId: config.networkId,
    unshieldedAddress: typeof unshielded === 'string' ? unshielded : unshielded.unshieldedAddress,
    providers: { privateStateProvider, publicDataProvider, zkConfigProvider, proofProvider, walletProvider, midnightProvider },
  };
}

export function normalizeTxId(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object') {
    const candidate = value as Record<string, unknown>;
    for (const key of ['txId', 'transactionId', 'id', 'hash']) if (typeof candidate[key] === 'string') return candidate[key] as string;
  }
  return String(value ?? '');
}

export async function waitForIndexedTx(
  provider: { watchForTxData: (txId: string) => Promise<any> },
  txId: string,
  timeoutMs = 45_000,
): Promise<{ indexed: boolean; data?: any }> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    const data = await Promise.race([
      provider.watchForTxData(txId),
      new Promise<never>((_, reject) => { timeout = setTimeout(() => reject(new Error('Timed out waiting for indexer confirmation.')), timeoutMs); }),
    ]);
    return { indexed: true, data };
  } catch {
    return { indexed: false };
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

export function isSuccessfulIndexedTx(data: any): boolean {
  return data?.status === 'SucceedEntirely' || data?.status === 'success' || data?.status === 'finalized' || data?.status === 'confirmed';
}

export function findCredentialPath(ledgerState: any, commitment: Uint8Array): unknown | undefined {
  return ledgerState?.authorized_credentials?.findPathForLeaf?.(commitment);
}

export function ensureFutureExpiry(value: bigint, nowSeconds = BigInt(Math.floor(Date.now() / 1000))): void {
  if (value <= nowSeconds) throw new Error('Expiry must be in the future.');
}

export { ContractState };
