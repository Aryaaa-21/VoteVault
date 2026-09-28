import { useCallback, useEffect, useMemo, useState } from 'react';
import { ledger } from '../managed/contract/index.js';
import { getContractAddress, getNetwork, getNetworkConfig, subscribeConfiguration, type Network } from '../config';
import { createPatchedPublicDataProvider } from '../lib/midnight';

const providers = new Map<string, ReturnType<typeof createPatchedPublicDataProvider>>();
function getProvider(network: Network) {
  const config = getNetworkConfig(network);
  const key = `${config.indexerUrl}|${config.indexerWs}`;
  let provider = providers.get(key);
  if (!provider) {
    provider = createPatchedPublicDataProvider(config.indexerUrl, config.indexerWs);
    providers.set(key, provider);
  }
  return provider;
}

export function useContractState(interval = 5000, requestedAddress?: string) {
  const [network, setNetwork] = useState<Network>(getNetwork());
  const [ledgerState, setLedgerState] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const address = requestedAddress ?? getContractAddress(network);
  const provider = useMemo(() => getProvider(network), [network]);

  useEffect(() => subscribeConfiguration(setNetwork), []);

  const refetch = useCallback(async () => {
    if (!address) {
      setIsLoading(false);
      setLedgerState(null);
      setError(null);
      return;
    }
    let current = true;
    setIsLoading(true);
    try {
      const state = await provider.queryContractState(address);
      if (!current) return;
      setLedgerState(state?.data ? ledger(state.data) : null);
      setError(null);
      setLastUpdate(new Date());
    } catch (cause: any) {
      if (current) setError(cause?.message || 'Unable to read the Midnight indexer.');
    } finally {
      if (current) setIsLoading(false);
      current = false;
    }
    return () => { current = false; };
  }, [address, provider]);

  useEffect(() => {
    let stale = false;
    const load = async () => {
      if (!address) {
        setIsLoading(false);
        setLedgerState(null);
        return;
      }
      setIsLoading(true);
      try {
        const state = await provider.queryContractState(address);
        if (stale) return;
        setLedgerState(state?.data ? ledger(state.data) : null);
        setError(null);
        setLastUpdate(new Date());
      } catch (cause: any) {
        if (!stale) setError(cause?.message || 'Unable to read the Midnight indexer.');
      } finally {
        if (!stale) setIsLoading(false);
      }
    };
    void load();
    const timer = window.setInterval(() => { void load(); }, interval);
    return () => { stale = true; window.clearInterval(timer); };
  }, [address, interval, provider]);

  return { ledgerState, isLoading, error, lastUpdate, refetch };
}
