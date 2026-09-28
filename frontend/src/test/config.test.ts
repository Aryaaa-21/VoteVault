import { afterEach, describe, expect, it } from 'vitest';
import {
  getContractAddress,
  getNetwork,
  getNetworkConfig,
  getExplorerContractUrl,
  normalizeContractAddress,
  setContractAddress,
  setNetwork,
  subscribeConfiguration,
} from '../config';

const address = 'a'.repeat(64);

afterEach(() => {
  setNetwork('preview');
  setContractAddress('', 'preview');
  setContractAddress('', 'preprod');
});

describe('network-scoped configuration', () => {
  it('defaults to Preview and exposes distinct endpoints', () => {
    expect(getNetwork()).toBe('preview');
    expect(getNetworkConfig('preview').networkId).toBe('preview');
    expect(getNetworkConfig('preprod').networkId).toBe('preprod');
    expect(getNetworkConfig('preview').indexerUrl).not.toBe(getNetworkConfig('preprod').indexerUrl);
  });

  it('does not leak a contract address across networks', () => {
    setContractAddress(address, 'preview');
    expect(getContractAddress('preview')).toBe(address);
    expect(getContractAddress('preprod')).toBe('');
    setContractAddress(address.replaceAll('a', 'b'), 'preprod');
    expect(getContractAddress('preprod')).toBe('b'.repeat(64));
    expect(getContractAddress('preview')).toBe(address);
  });

  it('notifies consumers when network or address changes', () => {
    const changes: string[] = [];
    const unsubscribe = subscribeConfiguration((network) => changes.push(network));
    setNetwork('preprod');
    setContractAddress(address, 'preprod');
    unsubscribe();
    expect(changes).toEqual(['preprod', 'preprod']);
  });

  it('validates contract addresses and builds network-specific explorer URLs', () => {
    expect(() => normalizeContractAddress('not-an-address')).toThrow();
    expect(getExplorerContractUrl(address, 'preprod')).toContain(encodeURIComponent(address));
    expect(getExplorerContractUrl(address, 'preprod')).toContain('explorer.1am.xyz');
    expect(getExplorerContractUrl(address, 'preprod')).toContain('network=preprod');
  });
});
