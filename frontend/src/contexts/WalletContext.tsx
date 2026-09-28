import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import '@midnight-ntwrk/dapp-connector-api';
import type { ConnectedAPI, InitialAPI } from '@midnight-ntwrk/dapp-connector-api';
import { createConnectedSession, type ConnectedSession } from '../lib/midnight';
import { getNetwork, setNetwork, subscribeConfiguration, type Network } from '../config';

export type WalletStatus = 'checking' | 'detected' | 'not-found';
export type WalletType = '1am' | 'lace' | 'nightly' | 'other' | null;
export type WalletEntry = { id: string; name: string; icon?: string; api: InitialAPI };

type WalletContextValue = {
  address: string | null;
  isConnected: boolean;
  network: Network;
  walletType: WalletType;
  walletName: string | null;
  walletStatus: WalletStatus;
  isConnecting: boolean;
  session: ConnectedSession | null;
  availableWallets: WalletEntry[];
  error: string | null;
  clearError: () => void;
  connect: (network?: Network, walletId?: string) => Promise<ConnectedSession | undefined>;
  disconnect: () => void;
};
const WalletContext = createContext<WalletContextValue | null>(null);

function classifyWallet(wallet: WalletEntry): Exclude<WalletType, null> {
  const value = `${wallet.id} ${wallet.name}`.toLowerCase();
  if (value.includes('1am')) return '1am';
  if (value.includes('lace')) return 'lace';
  if (value.includes('nightly')) return 'nightly';
  return 'other';
}

export function listInjectedWallets(): WalletEntry[] {
  if (typeof window === 'undefined') return [];
  const midnight = (window as Window & { midnight?: Record<string, InitialAPI> }).midnight;
  if (!midnight) return [];
  return Object.entries(midnight)
    .filter(([, api]) => api && typeof api.connect === 'function')
    .map(([id, api]) => ({ id, api, name: api.name || id, icon: api.icon }));
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [network, setSessionNetwork] = useState<Network>(getNetwork());
  const [walletStatus, setWalletStatus] = useState<WalletStatus>('checking');
  const [availableWallets, setAvailableWallets] = useState<WalletEntry[]>([]);
  const [walletType, setWalletType] = useState<WalletType>(null);
  const [walletName, setWalletName] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [session, setSession] = useState<ConnectedSession | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const connecting = useRef(false);
  const generation = useRef(0);

  const clearError = useCallback(() => setError(null), []);
  const detect = useCallback((timeout = 6000) => {
    if (typeof window === 'undefined') return () => undefined;
    const started = Date.now();
    const poll = () => {
      const wallets = listInjectedWallets();
      if (wallets.length) {
        setAvailableWallets(wallets);
        setWalletStatus('detected');
        return true;
      }
      if (Date.now() - started > timeout) {
        setAvailableWallets([]);
        setWalletStatus('not-found');
        return true;
      }
      return false;
    };
    if (poll()) return () => undefined;
    const id = window.setInterval(() => { if (poll()) window.clearInterval(id); }, 250);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => detect(), [detect]);
  useEffect(() => subscribeConfiguration((next) => setSessionNetwork(next)), []);

  const connect = useCallback(async (requestedNetwork: Network = getNetwork(), walletId?: string) => {
    if (connecting.current) return undefined;
    connecting.current = true;
    const requestGeneration = ++generation.current;
    setIsConnecting(true);
    setError(null);
    try {
      const wallets = listInjectedWallets();
      if (!wallets.length) throw new Error('Install a Midnight-compatible wallet such as Lace, 1AM, or Nightly first.');
      const chosen = wallets.find((item) => item.id === walletId) || wallets[0];
      const api: ConnectedAPI = await chosen.api.connect(requestedNetwork);
      const connected = await createConnectedSession(api, requestedNetwork);
      if (requestGeneration !== generation.current) {
        await connected.providers.privateStateProvider.clear();
        return undefined;
      }
      setNetwork(requestedNetwork);
      setSessionNetwork(requestedNetwork);
      setSession(connected);
      setAddress(connected.unshieldedAddress);
      setWalletName(chosen.name);
      setWalletType(classifyWallet(chosen));
      setWalletStatus('detected');
      return connected;
    } catch (cause: any) {
      const message = cause?.message || String(cause);
      setError(message.toLowerCase().includes('sync')
        ? 'Your wallet is still syncing with Midnight. Open the extension and wait until sync is complete.'
        : message.toLowerCase().includes('rate limit')
          ? 'The wallet provider is rate limiting requests. Wait a moment, then try again.'
          : message);
      return undefined;
    } finally {
      connecting.current = false;
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    generation.current += 1;
    const current = session;
    if (current) {
      void current.providers.privateStateProvider.clear();
      const disconnectApi = current.api?.disconnect;
      if (typeof disconnectApi === 'function') void disconnectApi.call(current.api);
    }
    setSession(null);
    setAddress(null);
    setWalletName(null);
    setWalletType(null);
    setError(null);
    setWalletStatus('checking');
    void detect(3000);
  }, [detect, session]);

  return <WalletContext.Provider value={{ address, isConnected: Boolean(session), network, walletType, walletName, walletStatus, isConnecting, session, availableWallets, error, clearError, connect, disconnect }}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) throw new Error('useWallet must be used inside WalletProvider');
  return context;
}
