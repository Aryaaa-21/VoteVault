export type Network = 'preview' | 'preprod';
export type NetworkConfig = {
  networkId: Network;
  indexerUrl: string;
  indexerWs: string;
  substrateNodeUri: string;
  explorerBaseUrl: string;
};
export const NETWORK_STORAGE_KEY = 'votevault.network.v1';
export const ADDRESS_STORAGE_KEY = 'votevault.contract.preview.v1';
const addressKey = (network: Network) => `votevault.contract.${network}.v1`;
const subscribers = new Set<(network: Network) => void>();
const memory = new Map<string, string>();
const env = import.meta.env;
function stored(key: string): string | null {
  try { return typeof window === 'undefined' ? memory.get(key) ?? null : window.localStorage.getItem(key) ?? memory.get(key) ?? null; }
  catch { return memory.get(key) ?? null; }
}
function persist(key: string, value: string) {
  memory.set(key, value);
  try { if (typeof window !== 'undefined') window.localStorage.setItem(key, value); } catch { /* Tab-only configuration when storage is blocked. */ }
}
export function isNetwork(value: unknown): value is Network { return value === 'preview' || value === 'preprod'; }
let activeNetwork: Network = isNetwork(stored(NETWORK_STORAGE_KEY)) ? stored(NETWORK_STORAGE_KEY) as Network : 'preview';
const configs: Record<Network, NetworkConfig> = {
  preview: {
    networkId: 'preview',
    indexerUrl: env.VITE_PREVIEW_INDEXER_URL || 'https://indexer.preview.midnight.network/api/v4/graphql',
    indexerWs: env.VITE_PREVIEW_INDEXER_WS || 'wss://indexer.preview.midnight.network/api/v4/graphql/ws',
    substrateNodeUri: env.VITE_PREVIEW_NODE_URL || 'wss://rpc.preview.midnight.network',
    explorerBaseUrl: 'https://explorer.1am.xyz',
  },
  preprod: {
    networkId: 'preprod',
    indexerUrl: env.VITE_PREPROD_INDEXER_URL || 'https://indexer.preprod.midnight.network/api/v4/graphql',
    indexerWs: env.VITE_PREPROD_INDEXER_WS || 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws',
    substrateNodeUri: env.VITE_PREPROD_NODE_URL || 'https://rpc.preprod.midnight.network',
    explorerBaseUrl: 'https://explorer.1am.xyz',
  },
};
export function getNetwork(): Network { return activeNetwork; }
export function setNetwork(network: Network): void {
  if (!isNetwork(network)) throw new Error('VoteVault supports only Preview and Preprod.');
  if (network === activeNetwork) return;
  activeNetwork = network;
  persist(NETWORK_STORAGE_KEY, network);
  subscribers.forEach((callback) => callback(activeNetwork));
}
export function getNetworkConfig(network: Network = getNetwork()): NetworkConfig { return configs[network]; }
export function subscribeConfiguration(callback: (network: Network) => void): () => void {
  subscribers.add(callback);
  return () => { subscribers.delete(callback); };
}
if (typeof window !== 'undefined') window.addEventListener('storage', (event) => {
  if (event.key === NETWORK_STORAGE_KEY || event.key === null) {
    const value = stored(NETWORK_STORAGE_KEY);
    activeNetwork = isNetwork(value) ? value : 'preview';
  }
  if (event.key === null || event.key === NETWORK_STORAGE_KEY || event.key?.startsWith('votevault.contract.')) subscribers.forEach((callback) => callback(activeNetwork));
});
export function normalizeContractAddress(address: string): string {
  const normalized = address.trim().replace(/^0x/i, '').toLowerCase();
  if (!/^[0-9a-f]{64}$/.test(normalized)) throw new Error('Contract address must be 64 hexadecimal characters.');
  return normalized;
}
export function getContractAddress(network: Network = getNetwork()): string {
  const value = stored(addressKey(network)) ?? (network === 'preview' ? env.VITE_PREVIEW_CONTRACT_ADDRESS : env.VITE_PREPROD_CONTRACT_ADDRESS) ?? '';
  if (!value.trim()) return '';
  try { return normalizeContractAddress(value); } catch { return ''; }
}
export function setContractAddress(address: string, network: Network = getNetwork()): void {
  persist(addressKey(network), address.trim() ? normalizeContractAddress(address) : '');
  subscribers.forEach((callback) => callback(activeNetwork));
}
// Retained for consumers of the former config shape. Reactive consumers must use getNetworkConfig().
export const INDEXER_URL = configs.preview.indexerUrl;
export const INDEXER_WS = configs.preview.indexerWs;
export function getExplorerContractUrl(address = getContractAddress(), network: Network = getNetwork()): string {
  return address ? `${configs[network].explorerBaseUrl}/contract/${encodeURIComponent(address)}?network=${network}` : configs[network].explorerBaseUrl;
}
export function getExplorerTxUrl(txId: string, network: Network = getNetwork()): string {
  return `${configs[network].explorerBaseUrl}/tx/${encodeURIComponent(txId)}?network=${network}`;
}
export const DEFAULT_SIGNAL_THRESHOLD = 72n;
export const DEFAULT_VISITOR_LIMIT = 144n;
export const MAX_CREDENTIALS = 1024n;
